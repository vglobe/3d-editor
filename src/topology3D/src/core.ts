import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import {
  AbstractMesh,
  Color3,
  Color4,
  Engine,
  Mesh,
  PickingInfo,
  Scene,
  SceneLoader,
  SceneSerializer,
  StandardMaterial,
  Tags,
  Texture,
  Tools,
  TransformNode,
  Vector3
} from 'babylonjs';
import {
  deepClone,
  getElement,
  getRotationFromAngle,
  toScaling,
  toSize
} from '..';
import { LoadingScreen } from './loadingScreen';
import mitt from 'mitt';
import {
  GizmoType,
  SceneManager,
  getRotation,
  initMeshMetadata,
  registerEvents,
  MeshType,
  getRotateAngle,
  CreateDecal,
  getRoot,
  resetName,
  getMeshCenter,
  setBoundingBoxInfo,
  AnimationPlayState,
  resetMeshRotation
} from './scene';
import { EventManager } from './event';
import { createId, getValue, setValue, tryCatch } from './utils/helper';
import { AnimationManager, metadataInitValueToBabylonValue } from './animation';
import { clearStore, Topology3dStore, useStore } from './store';
import { OperateType, UndoRedoManager, Record } from './undoRedo';
import { trimAll } from './utils/string';
import { getTargetType, TargetType } from './utils/type';
import { toArray } from './utils/array';

export type Point2D = { x: number; y: number };
export type Point3D = { x: number; y: number; z: number };
export type TreeNode = { mesh: AbstractMesh; children: TreeNode[] };
export type UpdateObj = {
  target: any;
  update: { [property: string]: any };
  old?: { [property: string]: any };
};

/** 全局禁止自动显示加载页面，由手动控制 */
SceneLoader.ShowLoadingScreen = false;

export class Topology3D {
  public store: Topology3dStore;
  public canvas: HTMLCanvasElement;
  public engine: Engine;
  public sceneManager: SceneManager;
  public eventManager: EventManager;
  public animationManager: AnimationManager;
  public undoRedoManager: UndoRedoManager;
  public loadingScreen: LoadingScreen;
  public emitter = mitt();
  public copiedMeshes: string[] = [];
  private pastePosition: Vector3;
  private pasteOffset: number = 0;

  public GROUNDWIDTH = 100;
  public GROUNDHEIGHT = 100;
  public MOVE_DIFF = 1;
  public SCALE_DIFF = 0.1;
  public ROTATE_DIFF = Math.PI / 180;

  constructor(parent: string | HTMLCanvasElement) {
    this.store = useStore(Tools.RandomId());
    this.canvas = getElement(parent) as HTMLCanvasElement;
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.sceneManager = new SceneManager(this);
    this.eventManager = new EventManager(this);
    this.animationManager = new AnimationManager(this);
    this.undoRedoManager = new UndoRedoManager(this);
    this.loadingScreen = new LoadingScreen(this.canvas);
    this.engine.runRenderLoop(() => {
      this.sceneManager.render();
    });
    this.engine.onResizeObservable.add(() => this.engine.resize());
    if (window) {
      window['topology3d'] = this;
    }
  }

  lock(locked: number) {
    this.store.data.locked = locked;
    this.sceneManager.toggleLock();
  }

  getLocked() {
    return this.store.data.locked || 0;
  }

  addMesh = (name: MeshType, option: any = {}, history = true) => {
    const mesh = this.sceneManager.createMesh(name, option);
    if (mesh) {
      registerEvents(mesh, this.emitter);
      if (option.position) {
        const { x, y, z } = option.position;
        mesh.position = new Vector3(x, y, z);
      }
      if (history) {
        this.undoRedoManager.add({
          type: OperateType.Add,
          infos: [{ target: mesh, targetType: TargetType.Mesh }]
        });
      }
      tryCatch(() => this.emitter.emit('addMesh', { mesh }));
    }
    return mesh;
  };

  deleteMesh = (mesh: TransformNode | TransformNode[], history = true) => {
    const meshes = toArray(mesh);
    const selectedMeshes = this.getSelectedMeshes();
    this.selectMesh(
      selectedMeshes.filter(
        mesh => meshes.findIndex(m => m.name === mesh.name) === -1
      )
    );
    this.stopMeshAnimation(meshes);
    this.removeNodes(meshes, true);
    if (history) {
      this.undoRedoManager.add({
        type: OperateType.Delete,
        infos: meshes.map(mesh => ({
          target: mesh,
          targetType: getTargetType(mesh)
        }))
      });
    }
    if (meshes.length > 0) {
      tryCatch(() => this.emitter.emit('deleteMesh', { meshes }));
    }
  };

  /**
   * 更新指定对象（集合）的属性
   * @param updateObj 更改信息(集合)
   * @param history 是否加入undoredo历史记录
   */
  updateProps(updateObj: UpdateObj | UpdateObj[], history = true) {
    const updates = toArray(updateObj);
    const record: Record = { type: OperateType.Update, infos: [] };
    updates.forEach(item => {
      const { target, update, old = {} } = item;
      const keys = Object.keys(update);
      const props = keys.reduce((obj, key) => {
        obj[key] = {
          oldValue: old.hasOwnProperty(key) ? old[key] : getValue(target, key),
          newValue: update[key]
        };
        return obj;
      }, {});
      record.infos.push({ target, targetType: getTargetType(target), props });
      keys.forEach(key => setValue(target, key, update[key]));
    });
    if (history) {
      this.undoRedoManager.add(record);
    }
  }

  showMesh = (name: string | string[], visible: boolean) => {
    const meshes = this.getMeshesByNames(name);
    meshes.forEach(mesh => mesh.setEnabled(visible));
  };

  lockMesh = (name: string | string[], locked: number) => {
    const meshes = this.getMeshesByNames(name);
    meshes.forEach(mesh => (mesh.metadata.unmovable = !!locked));
  };

  selectMesh = (mesh: AbstractMesh | AbstractMesh[]) => {
    const gizmo = this.getGizmo();
    const oldMeshes = [...this.getSelectedMeshes()];
    const newMeshes = mesh ? toArray(mesh) : [];
    const selected = newMeshes.filter(
      mesh => oldMeshes.findIndex(m => m.name === mesh.name) === -1
    );
    const deselected = oldMeshes.filter(
      mesh => newMeshes.findIndex(m => m.name === mesh.name) === -1
    );
    if (deselected.length > 0) {
      gizmo.detechMesh(deselected);
    }
    if (selected.length > 0) {
      gizmo.attechMesh(selected);
    }
    tryCatch(() =>
      this.emitter.emit('selectMesh', {
        meshes: newMeshes,
        selected,
        deselected
      })
    );
  };

  pickMesh(point: Point2D, filter?: (mesh: AbstractMesh) => boolean) {
    const activeScene = this.getScene();
    if (!activeScene) {
      return null;
    }
    return activeScene.pick(point.x, point.y, mesh =>
      filter ? filter(mesh) : true
    );
  }

  moveMeshStart = (mesh?: AbstractMesh | AbstractMesh[]) => {
    const meshes = toArray(mesh);
    tryCatch(() => this.emitter.emit('moveStartMesh', { meshes }));
  };

  moveMesh = (diff: Vector3, mesh: AbstractMesh | AbstractMesh[]) => {
    const meshes = toArray(mesh);
    const moveInfos = meshes.map(mesh => {
      const before = mesh.position.clone();
      if (!mesh.metadata.unmovable) {
        mesh.position.addInPlace(diff);
      }
      const after = mesh.position.clone();
      return {
        before,
        after,
        diff,
        mesh
      };
    });
    tryCatch(() => this.emitter.emit('moveMesh', { meshes, moveInfos }));
  };

  moveMeshEnd = (mesh: AbstractMesh | AbstractMesh[]) => {
    const meshes = toArray(mesh);
    tryCatch(() => this.emitter.emit('moveEndMesh', { meshes }));
  };

  scaleMesh = (diff: Vector3, mesh: AbstractMesh | AbstractMesh[]) => {
    const meshes = toArray(mesh);
    const scaleInfos = meshes.map(mesh => {
      const before = mesh.scaling.clone();
      if (!mesh.metadata.unscalable) {
        const { x, y, z } = mesh.scaling;
        const _x = x + diff.x;
        const _y = y + diff.y;
        const _z = z + diff.z;
        /* // 缩放到负值时会影响旋转，这里禁止缩放到负值
        mesh.scaling.x = _x <= 0 ? 0.1 : _x;
        mesh.scaling.y = _y <= 0 ? 0.1 : _y;
        mesh.scaling.z = _z <= 0 ? 0.1 : _z; */
        mesh.scaling.x = _x;
        mesh.scaling.y = _y;
        mesh.scaling.z = _z;
      }
      const after = mesh.scaling.clone();
      return {
        before,
        after,
        diff,
        mesh
      };
    });
    tryCatch(() => this.emitter.emit('scaleMesh', { meshes, scaleInfos }));
  };

  rotateMesh = (diff: Vector3, mesh: AbstractMesh | AbstractMesh[]) => {
    const meshes = toArray(mesh);
    const rotateInfos = meshes.map(mesh => {
      const before = getRotation(mesh);
      if (!mesh.metadata.unrotatable) {
        mesh.rotation.addInPlace(diff);
      }
      const after = getRotation(mesh);
      return {
        before,
        after,
        diff,
        mesh
      };
    });
    tryCatch(() => this.emitter.emit('rotateMesh', { meshes, rotateInfos }));
  };

  cloneMesh = (mesh: TransformNode | TransformNode[]) => {
    const meshes = toArray(mesh);
    const copyMeshes = meshes.map(mesh => {
      const cloneMesh = mesh.clone('clone', null);
      const prefix = mesh.name.split('-!-')[0] + '(副本)';
      cloneMesh.name = createId(prefix);
      cloneMesh.id = mesh.id + '(副本)';
      cloneMesh.metadata = deepClone(mesh.metadata);
      cloneMesh.setParent(null);
      const children = mesh.getChildren(() => true, false);
      children.forEach(
        child => (child.name = createId(child.name.split('-!-')[0]))
      );
      this.removeNodes(cloneMesh, true);
      return cloneMesh;
    });
    return copyMeshes;
  };

  copyMesh = (mesh: TransformNode | TransformNode[]) => {
    const meshes = toArray(mesh);
    this.copiedMeshes = meshes.map(mesh => mesh.name);
    if (meshes.length) {
      this.pastePosition = null;
      this.pasteOffset = 0;
      tryCatch(() => this.emitter.emit('copyMesh', { meshes }));
    }
    return meshes;
  };

  pasteMesh = (history = true) => {
    if (this.copiedMeshes) {
      const meshes = this.getMeshesByNames(this.copiedMeshes).filter(
        mesh => !!mesh
      );
      if (meshes.length) {
        const position = meshes[0].position;
        if (!this.pastePosition || !this.pastePosition.equals(position)) {
          this.pastePosition = position.clone();
          this.pasteOffset = 0;
        }
        this.pasteOffset += 3;
        const cloneMeshes = this.cloneMesh(meshes);
        cloneMeshes.forEach(mesh => {
          mesh.position.addInPlace(
            new Vector3(this.pasteOffset, 0, this.pasteOffset)
          );
          this.addNodes(mesh);
        });
        if (history) {
          this.undoRedoManager.add({
            type: OperateType.Add,
            infos: cloneMeshes.map(mesh => ({
              target: mesh,
              targetType: getTargetType(mesh)
            }))
          });
        }
      }
    }
  };

  loadMesh = async ({
    meshNames = '',
    rootUrl = '',
    file = '',
    scaling = { x: 1, y: 1, z: 1 },
    angle = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 }
  }: {
    file: string | File;
    meshNames?: string | string[];
    rootUrl?: string;
    scaling?: Point3D;
    angle?: Point3D;
    position?: Point3D;
  }) => {
    const activeScene = this.getScene();
    const result = await SceneLoader.ImportMeshAsync(
      meshNames,
      rootUrl,
      file,
      activeScene
    ).catch(e => console.error('Error on ImportMeshAsync:', e));
    if (result) {
      const { meshes, transformNodes, geometries } = result;
      let rootMesh: AbstractMesh;
      meshes.forEach(mesh => {
        resetName(mesh);
        initMeshMetadata(mesh, MeshType.Import);
        registerEvents(mesh, this.emitter);
        setBoundingBoxInfo(mesh);
        if (!rootMesh && !mesh.parent) {
          rootMesh = mesh;
        }
      });
      transformNodes.forEach(node => {
        resetName(node);
        initMeshMetadata(node, MeshType.TransformNode);
      });
      geometries.forEach(geometry => resetName(geometry));
      resetMeshRotation(rootMesh);
      setValue(
        rootMesh,
        'scaling',
        new Vector3(
          rootMesh.scaling.x * scaling.x || 1,
          rootMesh.scaling.y * scaling.y || 1,
          rootMesh.scaling.z * scaling.z || 1
        )
      );
      setValue(
        rootMesh,
        'position',
        new Vector3(position.x || 0, position.y || 0, position.z || 0)
      );
      this.undoRedoManager.add({
        type: OperateType.Add,
        infos: [{ target: rootMesh, targetType: getTargetType(rootMesh) }]
      });
      tryCatch(() => this.emitter.emit('loadMesh', { result }));
      return { result, rootMesh };
    }
  };

  combine = (meshes: TransformNode[], history: boolean = true) => {
    if (meshes.length < 2) {
      return { parent: null, children: [] };
    }
    const parent = this.mergeNodes(meshes) as AbstractMesh;
    setBoundingBoxInfo(parent);
    initMeshMetadata(parent, MeshType.Combine);
    registerEvents(parent, this.emitter);
    if (history) {
      this.undoRedoManager.add({
        type: OperateType.Combine,
        combine: [
          {
            parent,
            children: [...meshes]
          }
        ]
      });
    }
    tryCatch(() =>
      this.emitter.emit('combine', { meshes: { parent, children: meshes } })
    );
    return { parent, children: meshes };
  };

  uncombine = (
    mesh: TransformNode | TransformNode[],
    history: boolean = true
  ) => {
    const meshes = toArray(mesh);
    const result = meshes.reduce<
      { parent: TransformNode; children: TransformNode[] }[]
    >((arr, mesh) => {
      const children = this.unmergeNodes(mesh);
      if (children.length) {
        arr.push({ parent: mesh, children });
      }
      return arr;
    }, []);
    if (history) {
      this.undoRedoManager.add({
        type: OperateType.Uncombine,
        combine: result.map(item => ({
          parent: item.parent,
          children: item.children
        }))
      });
    }
    tryCatch(() => this.emitter.emit('uncombine', { meshes: result }));
    return result;
  };

  beginMeshAnimation(mesh: AbstractMesh | AbstractMesh[]) {
    const meshes = toArray(mesh);
    meshes.forEach(mesh => {
      this.animationManager.begin(mesh);
    });
  }

  pauseMeshAnimation(mesh: AbstractMesh | AbstractMesh[]) {
    const meshes = toArray(mesh);
    meshes.forEach(mesh => {
      this.animationManager.pause(mesh);
    });
  }

  restartMeshAnimation(mesh: AbstractMesh | AbstractMesh[]) {
    const meshes = toArray(mesh);
    meshes.forEach(mesh => {
      this.animationManager.restart(mesh);
    });
  }

  stopMeshAnimation(mesh: TransformNode | TransformNode[]) {
    const meshes = toArray(mesh);
    meshes.forEach(mesh => {
      this.animationManager.stop(mesh);
    });
  }

  switchGizmoType(type: GizmoType) {
    const gizmo = this.getGizmo();
    gizmo.switchGizmoType(type);
  }

  switchCamera(type: string) {
    const activeScene = this.getScene();
    const camera = this.getCamera(type);
    const prevMesh = this.sceneManager.targetMesh.get(activeScene.uid);
    const prevPoint = this.sceneManager.targetPoint.get(activeScene.uid);
    const selectedMesh = this.getSelectedMeshes()[0] || prevMesh;
    const activePoint = selectedMesh
      ? selectedMesh.position.clone()
      : prevPoint;
    activeScene.activeCamera = camera;
    this.sceneManager.setTargetOnActiveCamera(
      selectedMesh || activePoint,
      activeScene
    );
  }

  addMaterial(mesh: AbstractMesh, type: string, history = true) {
    const material = this.sceneManager.createMaterial(type);
    this.updateProps({ target: mesh, update: { material } }, history);
    return material;
  }

  removeMaterial(mesh: AbstractMesh, history = true) {
    this.updateProps({ target: mesh, update: { material: null } }, history);
  }

  addDecal(pickInfo: PickingInfo) {
    const mesh = pickInfo.pickedMesh;
    const position = pickInfo.pickedPoint;
    const normal = pickInfo.getNormal(true);
    const {
      decalImage = '',
      decalSizeX = 1,
      decalSizeY = 1,
      decalSizeZ = 1,
      decalZOffset = -2
    } = this.store.option;
    const size = new Vector3(decalSizeX, decalSizeY, decalSizeZ);
    const decal = CreateDecal(mesh, {
      position,
      normal,
      size,
      zOffset: decalZOffset
    });
    if (decalImage) {
      const material = decal.material as StandardMaterial;
      const diffuseTexture = new Texture(decalImage, decal.getScene());
      diffuseTexture.hasAlpha = true;
      material.diffuseTexture = diffuseTexture;
    }
    return decal;
  }

  removeDecal(decal: AbstractMesh | AbstractMesh[]) {
    this.removeNodes(decal, true, true);
  }

  undo = () => {
    if (!this.undoRedoManager.undoable()) {
      return;
    }
    this.selectMesh([]);
    this.undoRedoManager.undo();
  };

  redo = () => {
    if (!this.undoRedoManager.redoable()) {
      return;
    }
    this.selectMesh([]);
    this.undoRedoManager.redo();
  };

  on(name: string, callback: (obj?: any) => void) {
    this.emitter.on(name, callback);
  }

  off(name: string, callback: (obj?: any) => void) {
    this.emitter.off(name, callback);
  }

  async open(file?: File) {
    if (!file) {
      clearStore(this.store);
      this.engine.stopRenderLoop();
      this.undoRedoManager.clear();
      this.animationManager.dispose();
      this.animationManager = new AnimationManager(this);
      this.sceneManager.dispose();
      this.sceneManager = new SceneManager(this);
      this.engine.runRenderLoop(() => {
        this.sceneManager.render();
      });
    } else {
      const scene = await SceneLoader.LoadAsync('', file, this.engine);
      this.engine.stopRenderLoop();
      this.undoRedoManager.clear();
      this.animationManager.dispose();
      this.animationManager = new AnimationManager(this);
      this.sceneManager.dispose();
      this.sceneManager.addScene(scene);
      this.sceneManager.pickScene(scene);
      scene.cameras.forEach(camera => camera.attachControl(true));
      scene.meshes.forEach(mesh => {
        setBoundingBoxInfo(mesh);
        initMeshMetadata(mesh, MeshType.Import);
        registerEvents(mesh, this.emitter);
        const {
          animationPlayState = AnimationPlayState.Finished,
          animationInitValues = {}
        } = mesh.metadata;
        if (animationPlayState === AnimationPlayState.Play) {
          Object.keys(animationInitValues).forEach(key => {
            const value = metadataInitValueToBabylonValue(
              key,
              animationInitValues[key]
            );
            setValue(mesh, key, value);
          });
          this.animationManager.begin(mesh);
        }
      });
      scene.transformNodes.forEach(node => {
        initMeshMetadata(node, MeshType.TransformNode);
      });
      this.lock(this.getLocked());
      this.engine.runRenderLoop(() => {
        this.sceneManager.render();
      });
    }
    this.undoRedoManager.clear();
    this.pastePosition = null;
    this.pasteOffset = 0;
    this.copiedMeshes = [];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      const _this = this;
      reader.onloadend = function() {
        const result = this.result as string;
        const json = JSON.parse(result);
        const store = json.store || useStore(Tools.RandomId());
        _this.store = store;
        _this.emitter.emit('open');
      };
      reader.readAsText(file);
    } else {
      this.emitter.emit('open');
    }
  }

  async openJSON(json: any) {
    let filename = json.store?.option?.filename || 'le5le-topology3d';
    filename += '.json';
    if (typeof json !== 'string') {
      json = JSON.stringify(json);
    }
    const file = new File([json], filename, { type: 'application/json' });
    await this.open(file);
  }

  download(filename?: string) {
    filename = filename || this.store.option.filename;
    filename += '.json';
    const json = this.json();
    const blob = new Blob([json], { type: 'octet/stream' });
    const objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    const click = document.createEvent('MouseEvents');
    click.initEvent('click', true, false);
    link.dispatchEvent(click);
  }

  json() {
    this.selectMesh([]);
    const serializedScene = SceneSerializer.Serialize(
      this.sceneManager.activeScene
    );
    serializedScene.store = this.store;
    return JSON.stringify(serializedScene);
  }

  getPositionOnGround(point: Point2D) {
    const activeScene = this.getScene();
    if (!activeScene) {
      return null;
    }
    const pickInfo = this.pickMesh(
      point,
      mesh => mesh.name === 'le5le-scene-ground'
    );
    if (!pickInfo || !pickInfo.hit) {
      return null;
    }
    return pickInfo.pickedPoint;
  }

  getScene(scene?: string | Scene) {
    return this.sceneManager.getScene(scene);
  }

  getGizmo(scene?: string | Scene) {
    return this.sceneManager.getGizmo(scene);
  }

  getSelectedMeshes = () => {
    return this.getGizmo().activeMeshes;
  };

  getRootMesh = (mesh: AbstractMesh) => {
    return getRoot(mesh);
  };

  getAllRootMeshes(scene?: string | Scene) {
    const activeScene = this.getScene(scene);
    if (activeScene) {
      return activeScene.meshes.filter(mesh => !mesh.parent);
    }
  }

  getMeshesByTags(tagsString: string) {
    const activeScene = this.getScene();
    if (!tagsString) {
      return [];
    }
    const tags = trimAll(tagsString).split(',');
    return tags.reduce<AbstractMesh[]>((arr, tag) => {
      return arr.concat(tag ? activeScene.getMeshesByTags(tag) : []);
    }, []);
  }

  getMeshesByNames(name: string | string[]) {
    const activeScene = this.getScene();
    const names = toArray(name);
    return names.map(name => activeScene.getMeshByName(name));
  }

  getCamera(type?: string) {
    const scene = this.getScene();
    return this.sceneManager.findCamera(scene, type);
  }

  getMeshTree(mesh?: AbstractMesh | AbstractMesh[]) {
    let meshes: AbstractMesh[];
    if (!mesh) {
      meshes = this.getAllRootMeshes();
    } else {
      meshes = toArray(mesh);
    }
    return meshes.map(mesh => {
      const obj: TreeNode = { mesh, children: [] };
      const children = mesh.getChildren(() => true, true) as AbstractMesh[];
      if (children.length > 0) {
        obj.children = this.getMeshTree(children);
      }
      return obj;
    });
  }

  getRotateAngle(mesh: AbstractMesh) {
    return getRotateAngle(mesh);
  }

  getSizeFromScaling(mesh: AbstractMesh, scaling?: Point3D) {
    return toSize(scaling || mesh.scaling, mesh.metadata.initSize);
  }

  getScalingFromSize(size: Point3D, mesh: AbstractMesh) {
    return toScaling(size, mesh.metadata.initSize);
  }

  setValue = (obj: any, property: string, value: any) => {
    return setValue(obj, property, value);
  };

  getValue = (obj: any, property: string) => {
    return getValue(obj, property);
  };

  addNodes = (target: TransformNode | TransformNode[]) => {
    const targets = toArray(target);
    targets.forEach(target => {
      const type = getTargetType(target);
      const scene = target.getScene();
      if (type === TargetType.Mesh) {
        scene.addMesh(target as AbstractMesh, true);
      } else {
        scene.addTransformNode(target);
      }
    });
  };

  removeNodes = (
    target: TransformNode | TransformNode[],
    allChildren = true,
    dispose = false
  ) => {
    const targets = toArray(target);
    targets.forEach(target => {
      const type = getTargetType(target);
      const scene = target.getScene();
      if (allChildren) {
        const children = target.getChildren(
          () => true,
          true
        ) as TransformNode[];
        children.forEach(child => {
          this.removeNodes(child, allChildren);
          if (dispose) {
            child.dispose();
          }
        });
      } else {
        target.getChildMeshes(true).forEach(mesh => {
          mesh.setParent(null);
          if (dispose) {
            mesh.dispose();
          }
        });
        target.getChildTransformNodes(true).forEach(node => {
          node.setParent(null);
          if (dispose) {
            node.dispose();
          }
        });
      }
      if (type === TargetType.Mesh) {
        scene.removeMesh(target as AbstractMesh, false);
      } else {
        scene.removeTransformNode(target);
      }
      if (dispose) {
        target.dispose();
      }
    });
  };

  mergeNodes = (targets: TransformNode[], parent?: TransformNode) => {
    const scene = this.getScene();
    const position = getMeshCenter(targets);
    if (parent) {
      this.addNodes(parent);
    }
    const _parent = parent || new Mesh(createId(MeshType.Combine), scene);
    _parent.position = position;
    targets.forEach(mesh => mesh.setParent(_parent));
    return _parent;
  };

  unmergeNodes = (target: TransformNode) => {
    const children = this.getChildNodes(target);
    if (children.length) {
      this.removeNodes(target, false);
    }
    return children;
  };

  getChildNodes = (target: TransformNode) => {
    return [
      ...target.getChildMeshes(true),
      ...target.getChildTransformNodes(true)
    ];
  };

  showLoading = (title?: string, subtitle?: string) => {
    this.loadingScreen.show(title, subtitle);
  };

  hideLoading = () => {
    this.loadingScreen.hide();
  };

  static AddTagsTo(obj: Object, tags: string[] = []) {
    if (tags.length === 0) {
      return;
    }
    const tagsString = tags.map(tag => trimAll(tag)).join(' ');
    Tags.AddTagsTo(obj, tagsString);
  }

  static GetTags(obj: Object): string[] {
    const tagsString = Tags.GetTags(obj, true);
    if (tagsString) {
      return tagsString.split(' ');
    }
    return [];
  }

  static HasTags(obj: Object) {
    return Tags.HasTags(obj);
  }

  /**
   *
   * @param obj 检测对象
   * @param tagsQuery 标签选择语句 e.g. "tag1 && tag2 || tag3 || !tag4"
   * @returns boolean
   */
  static MatchesQuery(obj: Object, tagsQuery: string) {
    return Tags.MatchesQuery(obj, tagsQuery);
  }

  static RemoveTagsFrom(obj: Object, tags: string[] = []) {
    if (tags.length === 0) {
      return;
    }
    const tagsString = tags.map(tag => trimAll(tag)).join(' ');
    Tags.RemoveTagsFrom(obj, tagsString);
  }

  static StringToColor3(color: string) {
    if (color.startsWith('rgb')) {
      const _color = trimAll(color);
      const [r = 0, g = 0, b = 0] = _color
        .substring(_color.indexOf('(') + 1, _color.indexOf(')'))
        .split(',')
        .map(n => Number(n));
      return new Color3(r / 255, g / 255, b / 255);
    }
    return Color3.FromHexString(color);
  }

  static StringToColor4(color: string) {
    if (color.startsWith('rgb')) {
      const _color = trimAll(color);
      const [r = 0, g = 0, b = 0, a = 1] = _color
        .substring(_color.indexOf('(') + 1, _color.indexOf(')'))
        .split(',')
        .map(n => Number(n));
      return new Color4(r / 255, g / 255, b / 255, a);
    }
    return Color4.FromHexString(color);
  }

  destroy() {
    this.canvas = null;
    this.sceneManager.dispose();
    this.sceneManager = null;
    this.eventManager.dispose();
    this.eventManager = null;
    this.animationManager.dispose();
    this.animationManager = null;
    this.engine.stopRenderLoop();
    this.engine.dispose();
    this.engine = null;
    delete window['topology3d'];
  }
}
