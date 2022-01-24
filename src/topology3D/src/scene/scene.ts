import {
  AbstractMesh,
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  IPointerEvent,
  FollowCamera,
  GroundMesh,
  Light,
  Material,
  PickingInfo,
  PointerEventTypes,
  Scene,
  Vector3,
  StandardMaterial,
} from 'babylonjs';
import { GridMaterial } from 'babylonjs-materials';
import { Topology3D } from '../core';
import { GizmoBehavor } from './gizmo';
import { CreateCamera, CameraType } from './camera';
import { CreateLight } from './light';
import { CreateMaterial, MaterialType } from './material/material';
import { CreateMesh, MeshType } from './mesh';

export class SceneManager {
  public root: Topology3D;
  public sceneMap: Map<string, Scene> = new Map();
  public gizmoMap: Map<string, GizmoBehavor> = new Map();
  public targetMesh: Map<string, AbstractMesh> = new Map();
  public targetPoint: Map<string, Vector3> = new Map();
  public renderScenes: Scene[] = [];
  public activeScene: Scene;
  public activeGizmo: GizmoBehavor;

  constructor(root: Topology3D) {
    this.root = root;
    const scene = this.addScene();
    scene.clearColor = new Color4(0.96, 0.96, 0.96, 1);
    this.pickScene(scene);
    const arcRotateCamera = this.createCamera('arcRotate') as ArcRotateCamera;
    arcRotateCamera.attachControl(true);
    const followCamera = this.createCamera('follow') as FollowCamera;
    followCamera.attachControl(true);
    scene.activeCamera = arcRotateCamera;
    this.setTargetOnActiveCamera(Vector3.Zero(), scene);
    this.createLight('hemispheric', { direction: new Vector3(0, 1, 0) });
    this.createGround({ width: 1000, height: 1000 });
  }

  toggleLock() {
    this.activeGizmo.toggleLock();
  }

  get(target: string | Scene) {
    const scene =
      typeof target === 'string' ? this.sceneMap.get(target) : target;
    const gizmo = this.gizmoMap.get(scene.uid);
    return { scene, gizmo };
  }

  set(scene: Scene) {
    this.sceneMap.set(scene.uid, scene);
    this.gizmoMap.set(scene.uid, new GizmoBehavor(this.root, scene));
  }

  delete(target: string | Scene) {
    const { scene, gizmo } = this.get(target);
    if (scene) {
      gizmo.dispose();
      scene.dispose();
      this.gizmoMap.delete(scene.uid);
      this.sceneMap.delete(scene.uid);
    }
  }

  addScene(scene?: Scene) {
    const engine = this.root.engine;
    if (!scene) {
      scene = new Scene(engine);
    }
    scene.onPointerDown = (
      evt: IPointerEvent,
      pickInfo: PickingInfo,
      type: PointerEventTypes
    ) => {
      this.root.eventManager.onMouseDown(evt, scene);
    };
    scene.onPointerMove = (
      evt: IPointerEvent,
      pickInfo: PickingInfo,
      type: PointerEventTypes
    ) => {
      this.root.eventManager.onMouseMove(evt, scene);
    };
    scene.onPointerUp = (
      evt: IPointerEvent,
      pickInfo: PickingInfo,
      type: PointerEventTypes
    ) => {
      this.root.eventManager.onMouseUp(evt, scene);
    };
    this.set(scene);
    this.runScene(scene);
    return scene;
  }

  runScene(target?: string | Scene) {
    if (target) {
      const { scene } = this.get(target);
      if (scene && !this.renderScenes.find((s) => s === scene)) {
        this.renderScenes.push(scene);
      }
    } else {
      this.renderScenes = Array.from(this.sceneMap.values());
    }
  }

  stopScene(target?: string | Scene) {
    if (target) {
      const { scene } = this.get(target);
      this.renderScenes = this.renderScenes.filter((s) => s !== scene);
    } else {
      this.renderScenes = [];
    }
  }

  pickScene(target: string | Scene) {
    const { scene, gizmo } = this.get(target);
    this.activeScene = scene;
    this.activeGizmo = gizmo;
  }

  findMesh(name: string, target: string | Scene) {
    const { scene } = this.get(target);
    if (!scene) {
      return null;
    }
    return scene.getMeshByName(name);
  }

  findCamera(target: string | Scene, type?: string) {
    const { scene } = this.get(target);
    if (!scene) {
      return null;
    }
    if (type) {
      return scene.getCamerasByTags(type)[0];
    }
    return scene.activeCamera;
  }

  setTargetOnActiveCamera(
    target: Vector3 | AbstractMesh,
    targetScene: string | Scene
  ) {
    const { scene, gizmo } = this.get(targetScene);
    if (!scene) {
      return null;
    }
    let targetPoint: Vector3;
    let targetMesh: AbstractMesh;
    if (target instanceof Vector3) {
      targetPoint = target;
    }
    if (target instanceof AbstractMesh) {
      targetPoint = target.position.clone();
      targetMesh = target;
    }
    const activeCamera = scene.activeCamera;
    const type = activeCamera.metadata.type;
    if (type === CameraType.ArcRotate) {
      const _activeCamera = activeCamera as ArcRotateCamera;
      _activeCamera.setPosition(
        new Vector3(targetPoint.x, targetPoint.y + 20, targetPoint.z - 30)
      );
      _activeCamera.setTarget(targetPoint);
      gizmo.moveLocked = false;
    } else if (type === CameraType.Follow) {
      const _activeCamera = activeCamera as FollowCamera;
      _activeCamera.radius = 30;
      _activeCamera.heightOffset = 10;
      _activeCamera.rotationOffset = 0;
      _activeCamera.lockedTarget = targetMesh || null;
      gizmo.moveLocked = true;
    }
    this.targetPoint.set(scene.uid, targetPoint);
    this.targetMesh.set(scene.uid, targetMesh);
  }

  render() {
    this.renderScenes.forEach((scene) => scene.render());
  }

  getScene(target?: string | Scene) {
    return target ? this.get(target).scene : this.activeScene;
  }

  getGizmo(target?: string | Scene) {
    return target ? this.get(target).gizmo : this.activeGizmo;
  }

  createCamera(name: string, option: any = {}, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return null;
    }
    return CreateCamera(name, scene, option);
  }

  removeCamera(camera: Camera, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return false;
    }
    scene.removeCamera(camera);
    return true;
  }

  createLight(name: string, option: any = {}, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return null;
    }
    return CreateLight(name, scene, option);
  }

  removeLight(light: Light, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return false;
    }
    scene.removeLight(light);
    return true;
  }

  createMesh(name: MeshType, option: any = {}, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return null;
    }
    return CreateMesh(name, scene, option);
  }

  removeMesh(mesh: string | AbstractMesh, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return false;
    }
    mesh = typeof mesh === 'string' ? this.findMesh(mesh, scene) : mesh;
    scene.removeMesh(mesh);
    return true;
  }

  createMaterial(name: string, option: any = {}, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return null;
    }
    return CreateMaterial(name, scene, option);
  }

  removeMaterial(material: Material, target?: string | Scene) {
    const scene = this.getScene(target);
    if (!scene) {
      return false;
    }
    scene.removeMaterial(material);
    return true;
  }

  createGround(option: any = {}, target?: string | Scene) {
    this.removeGround(target);
    const ground = this.createMesh(
      MeshType.Ground,
      option,
      target
    ) as GroundMesh;
    if (!ground) {
      return null;
    }
    const grid = this.createMaterial(
      MaterialType.Grid,
      {},
      target
    ) as GridMaterial;
    grid.mainColor = new Color3(1, 1, 1);
    grid.lineColor = new Color3(0.8, 0.8, 0.8);
    /* const grid = this.createMaterial(MaterialType.Standard, {}, target) as StandardMaterial;
    grid.emissiveColor = new Color3(1, 1, 1);
    grid.alpha = 0.8; */
    ground.material = grid;
    ground.name = 'le5le-scene-ground';
  }

  removeGround(target?: string | Scene) {
    const groundName = 'le5le-scene-ground';
    return this.removeMesh(groundName, target);
  }

  dispose() {
    this.activeGizmo = null;
    this.activeScene = null;
    for (const [, scene] of this.sceneMap) {
      this.stopScene(scene);
      this.delete(scene);
    }
  }
}
