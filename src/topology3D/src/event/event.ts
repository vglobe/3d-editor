import { AbstractMesh, IPointerEvent, PickingInfo, Scene } from 'babylonjs';
import { Topology3D } from '../core';
import {
  GizmoBehavor,
  getRoot,
  MeshType,
  resetMeshRotation,
  isMeshType,
} from '../scene';
import { OperateType, Record } from '../undoRedo';
import { toArray } from '../utils/array';
import { tryCatch } from '../utils/helper';
import { getTargetType, TargetType } from '../utils/type';
import { getShortcut } from './shortcut/service';

type CompareKey = 'ctrlKey' | 'altKey' | 'shiftKey' | 'spaceKey';
const CompareKeys: Array<CompareKey> = [
  'ctrlKey',
  'altKey',
  'shiftKey',
  'spaceKey',
];

export class EventManager {
  public root: Topology3D;
  public canvas: HTMLCanvasElement;
  public ctrlKey: boolean = false;
  public shiftKey: boolean = false;
  public altKey: boolean = false;
  public spaceKey: boolean = false;
  public keyDown: boolean = false;
  public mouseDown = false;
  public mouseButton = -1;
  public code: string = '';
  private readyToCopy: boolean = false;
  private multiSelect: boolean = false;
  private picked: boolean = false;
  private pickActive: boolean = false;
  private moveNum: number = 0;
  private activeMesh: AbstractMesh;
  private activeGizmo: GizmoBehavor;
  private LIMIT_MOVE_NUM = 3;
  private record: Record;

  constructor(root: Topology3D) {
    this.root = root;
    this.canvas = root.canvas;
    this.canvas.addEventListener('dragover', this.onDragOver);
    this.canvas.addEventListener('drop', this.onDrop);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);
  }

  /**
   * 判断当前是否只按下了指定集合中的某(几)个键
   * @param key 被按下的键，不传表示没有按任何键
   * @returns boolean
   */
  pressOnly(keys: Array<CompareKey> = []) {
    return CompareKeys.every((k) => this[k] === keys.includes(k));
  }

  getCode(e: KeyboardEvent) {
    const { key } = e;
    if (key === ' ') {
      return 'space';
    }
    return key.toLocaleLowerCase();
  }

  setKeys(e: KeyboardEvent, isDown = true) {
    this.code = this.getCode(e);
    this.ctrlKey = e.ctrlKey || e.metaKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.keyDown = isDown;
    if (this.code === 'space') {
      this.spaceKey = isDown;
    }
  }

  initRecord(shortcutName: string) {
    if (!this.record) {
      this.record = {
        type: OperateType.Update,
        infos: this.root.getSelectedMeshes().map((mesh) => ({
          target: mesh,
          targetType: TargetType.Mesh,
          props: {},
        })),
      };
    }
    this.record.infos.forEach((info) => {
      const { target, props } = info;
      if (shortcutName.startsWith('MoveMesh')) {
        if (!props['position']) {
          props['position'] = {
            oldValue: target.position.clone(),
            newValue: target.position.clone(),
          };
        }
      } else if (shortcutName.startsWith('ScaleMesh')) {
        if (!props['scaling']) {
          props['scaling'] = {
            oldValue: target.scaling.clone(),
            newValue: target.scaling.clone(),
          };
        }
      } else if (shortcutName.startsWith('RotateMesh')) {
        resetMeshRotation(target);
        if (!props['rotation']) {
          props['rotation'] = {
            oldValue: target.rotation.clone(),
            newValue: target.rotation.clone(),
          };
        }
      }
    });
  }

  setRecord(shortcutName: string) {
    this.record.infos.forEach((info) => {
      const { target, props } = info;
      if (shortcutName.startsWith('MoveMesh')) {
        props['position'].newValue = target.position.clone();
      } else if (shortcutName.startsWith('ScaleMesh')) {
        props['scaling'].newValue = target.position.clone();
      } else if (shortcutName.startsWith('RotateMesh')) {
        props['rotation'].newValue = target.position.clone();
      }
    });
  }

  resetCache() {
    if (this.activeGizmo) {
      this.activeGizmo.forceMoveLock = false;
    }
    this.canvas.style.cursor = 'default';
    this.activeMesh = null;
    this.activeGizmo = null;
    this.readyToCopy = false;
    this.picked = false;
    this.pickActive = false;
    this.multiSelect = false;
    this.moveNum = 0;
  }

  isGlbFile(item) {
    return item.hasOwnProperty('path');
  }

  preventDefault(event: KeyboardEvent, isShortcut: boolean) {
    const code = event.key.toLocaleLowerCase();
    if (isShortcut || code === 'alt') {
      event.preventDefault();
    }
  }

  onMouseDown = (evt: IPointerEvent, scene: Scene) => {
    this.mouseDown = true;
    this.mouseButton = evt.button;
    if (scene !== this.root.sceneManager.activeScene) {
      return;
    }
    /** 按下左键时进行选择操作 */
    if (evt.button === 0) {
      const pickInfo = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh) => !isMeshType(mesh, MeshType.Ground)
      );
      if (!pickInfo.hit) {
        return;
      }
      const root = getRoot(pickInfo.pickedMesh);
      if (root.metadata.unselectable) {
        return;
      }
      this.resetCache();
      const gizmo = this.root.getGizmo(scene);
      const isActive = gizmo.isActiveMesh(root);
      this.picked = true;
      this.activeMesh = root;
      this.activeGizmo = gizmo;
      if (this.pressOnly(['ctrlKey'])) {
        this.multiSelect = true;
        this.activeGizmo.forceMoveLock = true;
      }
      if (isActive) {
        this.pickActive = true;
      } else {
        if (this.multiSelect) {
          this.root.selectMesh([...this.root.getSelectedMeshes(), root]);
        } else {
          this.root.selectMesh(root);
        }
      }
      gizmo.startDrag(root);
    }
    /** 选择操作end */
    /** 按住alt时进行贴图操作 */
    if (this.pressOnly(['altKey'])) {
      if (evt.button === 0) {
        // 左键添加贴图
        const pickInfo = scene.pick(
          scene.pointerX,
          scene.pointerY,
          (mesh) =>
            !isMeshType(mesh, MeshType.Decal) &&
            !isMeshType(mesh, MeshType.Ground)
        );
        if (!pickInfo.hit) {
          return;
        }
        this.root.addDecal(pickInfo);
      } else if (evt.button === 2) {
        // 右键移除贴图
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) =>
          isMeshType(mesh, MeshType.Decal)
        );
        if (!pickInfo.hit) {
          return;
        }
        this.root.removeDecal(pickInfo.pickedMesh);
      }
    }
    /** 贴图操作end */
  };

  onMouseMove = (evt: IPointerEvent, scene: Scene) => {
    if (scene !== this.root.sceneManager.activeScene) {
      return;
    }
    if (this.picked) {
      this.moveNum++;
    }
    if (
      this.ctrlKey &&
      this.picked &&
      this.moveNum > this.LIMIT_MOVE_NUM &&
      !this.root.getLocked()
    ) {
      this.readyToCopy = true;
      this.canvas.style.cursor = 'copy';
    }
  };

  onMouseUp = (evt: IPointerEvent, scene: Scene) => {
    this.mouseDown = false;
    this.mouseButton = -1;
    if (scene !== this.root.sceneManager.activeScene) {
      return;
    }
    if (this.pickActive && this.moveNum <= this.LIMIT_MOVE_NUM) {
      if (this.multiSelect) {
        this.root.selectMesh(
          this.root
            .getSelectedMeshes()
            .filter((mesh) => mesh.name !== this.activeMesh.name)
        );
      } else {
        this.root.selectMesh(this.activeMesh);
      }
    }
    if (this.readyToCopy && !this.root.getLocked()) {
      const position = this.activeGizmo.dragPlanePoint.clone();
      const diff = position.subtract(this.activeMesh.position);
      diff.y = 0;
      const meshes = this.root.getSelectedMeshes();
      const copyMeshes = this.root.cloneMesh(meshes);
      copyMeshes.forEach((mesh) => {
        mesh.position.addInPlace(diff);
        this.root.addNodes(mesh);
      });
      this.readyToCopy = false;
      this.root.undoRedoManager.add({
        type: OperateType.Add,
        infos: copyMeshes.map((mesh) => ({
          target: mesh,
          targetType: getTargetType(mesh),
        })),
      });
    }
    this.resetCache();
  };

  onKeyDown = (e: KeyboardEvent) => {
    this.setKeys(e);
    if (
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'TEXTAREA'
    ) {
      return;
    }
    const shortcut = getShortcut(this);
    if (shortcut) {
      if (!this.root.getLocked()) {
        this.initRecord(shortcut.name);
        shortcut.info.callback(this.root, this);
        this.setRecord(shortcut.name);
      }
    }
    if (this.ctrlKey && this.picked && !this.root.getLocked()) {
      this.activeGizmo.forceMoveLock = true;
      if (this.moveNum > this.LIMIT_MOVE_NUM) {
        this.canvas.style.cursor = 'copy';
      }
    }
    this.preventDefault(e, !!shortcut);
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (this.ctrlKey && this.picked) {
      this.activeGizmo.forceMoveLock = false;
      this.canvas.style.cursor = 'default';
      this.readyToCopy = false;
    }
    this.setKeys(e, false);
    if (
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'TEXTAREA'
    ) {
      return;
    }
    if (this.record) {
      this.root.undoRedoManager.add(this.record);
      this.record = null;
    }
    const shortcut = getShortcut(this);
    if (shortcut) {
      if (!this.root.getLocked() || shortcut.name === 'DeselectMesh') {
        shortcut.info.callback(this.root, this);
      }
    }
    this.preventDefault(e, false);
  };

  onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!this.root.getScene()) {
      return;
    }
    tryCatch(() => {
      const json =
        e.dataTransfer.getData('Topology') || e.dataTransfer.getData('Text');
      if (!json || this.root.getLocked()) {
        return;
      }
      const { offsetX, offsetY } = e;
      let obj = JSON.parse(json);
      obj = toArray(obj);
      obj.forEach(async (item) => {
        const pickInfo = this.root.getScene().pick(offsetX, offsetY);
        if (!pickInfo.hit) {
          return;
        }
        const position = pickInfo.pickedPoint;
        if (this.isGlbFile(item)) {
          const scaling = {
            x: item.scaling || 1,
            y: item.scaling || 1,
            z: item.scaling || 1,
          };
          await this.root.loadMesh({
            meshNames: '',
            rootUrl: item.path,
            file: item.name,
            scaling,
            position,
          });
        } else {
          const rootMesh = this.root.addMesh(item.name, {
            ...item.option,
            position,
          });
          rootMesh.position.y += item.option.yOffset || 0;
        }
      });
    });
  };

  onResize = () => {
    this.root.engine.resize();
  };

  dispose = () => {
    this.canvas.removeEventListener('dragover', this.onDragOver);
    this.canvas.removeEventListener('drop', this.onDrop);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
  };
}
