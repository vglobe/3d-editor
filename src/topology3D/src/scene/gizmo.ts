/*
 * @Description:
 * @Author: G
 * @Date: 2021-11-08 16:32:45
 * @LastEditTime: 2021-11-11 17:53:50
 */
import { Color3, Vector3, PointerDragBehavior, Scene, Mesh, BoundingBoxGizmo, PositionGizmo, RotationGizmo, ScaleGizmo, AbstractMesh } from 'babylonjs';
import { Topology3D } from '../core';
import { OperateType, Record } from '../undoRedo';
import { TargetType } from '../utils/type';
import { getRotation } from './mesh';

export enum GizmoType {
  None,
  BoudingBox,
  Position,
  Rotation,
  Scaling
}

export class GizmoBehavor {
  public root: Topology3D;
  public scene: Scene;
  public pointerDragBehavior: PointerDragBehavior;
  public activeGizmoType: GizmoType = GizmoType.None;
  public activeMeshes: AbstractMesh[] = [];
  public activeGizmos: (BoundingBoxGizmo | PositionGizmo | RotationGizmo | ScaleGizmo)[] = [];
  public startPoint: Vector3;
  public dragPlanePoint: Vector3;
  public moveLocked: boolean = false;
  public forceMoveLock: boolean = false;
  public dragNum: number = 0;
  private dragRecord: Record;

  constructor(root: Topology3D, scene: Scene,) {
    this.root = root;
    this.scene = scene;
    this.pointerDragBehavior = this.createPointerDragBehavior();
  }

  createPointerDragBehavior() {
    // 默认的拖动平面为水平面
    const pointerDragBehavior = new PointerDragBehavior({});
    pointerDragBehavior.detachCameraControls = true;
    pointerDragBehavior.dragDeltaRatio = 0.5;
    pointerDragBehavior.moveAttached = false;
    pointerDragBehavior.onDragStartObservable.add(this.onDragStart);
    pointerDragBehavior.onDragObservable.add(this.onDrag);
    pointerDragBehavior.onDragEndObservable.add(this.onDragEnd);
    return pointerDragBehavior;
  }

  createBoundingBoxGizmo() {
    const gizmo = new BoundingBoxGizmo(Color3.FromHexString('#1890ff'));
    gizmo.attachedMesh = null;
    gizmo.scaleBoxSize = 0.2;
    gizmo.onDragStartObservable.add(() => {
      this.dragRecord = {
        type: OperateType.Update,
        infos: this.activeMeshes.map(mesh => {
          return {
            target: mesh,
            targetType: TargetType.Mesh,
            props: {
              rotation: {
                oldValue: getRotation(mesh),
                newValue: getRotation(mesh)
              },
              scaling: {
                oldValue: mesh.scaling.clone(),
                newValue: mesh.scaling.clone()
              }
            }
          };
        })
      };
    });
    const dragEnd = () => {
      this.dragRecord.infos.forEach(info => {
        const { target, props } = info;
        props['rotation'].newValue = getRotation(target);
        props['scaling'].newValue = target.scaling.clone();
      });
      this.root.undoRedoManager.add(this.dragRecord);
      this.dragRecord = null;
    }
    gizmo.onRotationSphereDragEndObservable.add(dragEnd);
    gizmo.onScaleBoxDragEndObservable.add(dragEnd);
    return gizmo;
  }

  createPositionGizmo() {
    const gizmo = new PositionGizmo();
    gizmo.attachedMesh = null;
    /* gizmo.updateScale = false;
    gizmo.xGizmo.updateScale = false;
    gizmo.yGizmo.updateScale = false;
    gizmo.zGizmo.updateScale = false; */
    gizmo.onDragStartObservable.add(() => {
      this.dragRecord = {
        type: OperateType.Update,
        infos: this.activeMeshes.map(mesh => ({
          target: mesh,
          targetType: TargetType.Mesh,
          props: {
            position: {
              oldValue: mesh.position.clone(),
              newValue: mesh.position
            }
          }
        }))
      };
    });
    gizmo.onDragEndObservable.add(() => {
      this.root.undoRedoManager.add(this.dragRecord);
      this.dragRecord = null;
    });
    return gizmo;
  }

  createRotationGizmo() {
    const gizmo = new RotationGizmo();
    gizmo.attachedMesh = null;
    return gizmo;
  }

  createScaleGizmo() {
    const gizmo = new ScaleGizmo();
    gizmo.attachedMesh = null;
    return gizmo;
  }

  toggleLock() {
    this.activeGizmos.forEach(gizmo => {
      switch (this.activeGizmoType) {
        case GizmoType.BoudingBox:
          this.toggleLockBoundingBoxGizmo(gizmo as BoundingBoxGizmo);
          break;
        case GizmoType.Position:
        case GizmoType.Scaling:
        case GizmoType.Rotation:
          this.toggleLockOtherGizmo(gizmo as PositionGizmo);
          break;
      }
    });
  }

  isActiveMesh(target: AbstractMesh) {
    return this.findActiveMeshIndex(target) > -1;
  }

  findActiveMeshIndex(target: AbstractMesh) {
    return this.activeMeshes.findIndex((mesh) => target.name === mesh.name);
  }

  attechMesh(meshes: AbstractMesh[]) {
    let hasAtteched = false;
    meshes.forEach((mesh) => {
      if (mesh.metadata.unselectable) {
        return;
      }
      const index = this.findActiveMeshIndex(mesh);
      let selectedMesh: AbstractMesh;
      if (index > -1) {
        selectedMesh = this.activeMeshes[index];
      } else {
        selectedMesh = mesh;
        const gizmo = this.getGizmo(this.activeGizmoType);
        gizmo.attachedMesh = selectedMesh;
        // this.setGizmoScaleRotio(selectedMesh);
        this.activeMeshes.push(selectedMesh);
        this.activeGizmos.push(gizmo);
        hasAtteched = true;
      }
    });
    return hasAtteched;
  }

  detechMesh(meshes?: AbstractMesh[] | null) {
    if (meshes) {
      let hasDeteched = false;
      meshes.forEach((mesh) => {
        const index = this.findActiveMeshIndex(mesh);
        if (index > -1) {
          const gizmo = this.activeGizmos[index];
          this.disposeGizmo(gizmo);
          this.activeMeshes.splice(index, 1);
          this.activeGizmos.splice(index, 1);
          if (this.pointerDragBehavior.attachedNode) {
            this.pointerDragBehavior.detach();
          }
          hasDeteched = true;
        }
      });
      return hasDeteched;
    } else {
      return this.detechMesh([...this.activeMeshes] as Mesh[]);
    }
  }

  switchGizmoType(type: GizmoType) {
    if (type === this.activeGizmoType) {
      return;
    }
    this.activeGizmos.forEach((gizmo, i) => {
      const newGizmo = this.getGizmo(type);
      newGizmo.attachedMesh = gizmo.attachedMesh;
      this.disposeGizmo(gizmo);
      this.activeGizmos[i] = newGizmo;
    });
    this.activeGizmoType = type;
  }

  getGizmo(type: GizmoType) {
    let gizmo: BoundingBoxGizmo | PositionGizmo | RotationGizmo | ScaleGizmo;
    switch (type) {
      case GizmoType.None:
        gizmo = this.createBoundingBoxGizmo();
        gizmo.setEnabledRotationAxis('');
        gizmo.setEnabledScaling(false);
        break;
      case GizmoType.BoudingBox:
        gizmo = this.createBoundingBoxGizmo();
        this.toggleLockBoundingBoxGizmo(gizmo);
        break;
      case GizmoType.Position:
        gizmo = this.createPositionGizmo();
        this.toggleLockOtherGizmo(gizmo);
        break;
      case GizmoType.Rotation:
        gizmo = this.createRotationGizmo();
        this.toggleLockOtherGizmo(gizmo);
        break;
      case GizmoType.Scaling:
        gizmo = this.createScaleGizmo();
        this.toggleLockOtherGizmo(gizmo);
        break;
    }
    return gizmo;
  }

  toggleLockBoundingBoxGizmo(gizmo: BoundingBoxGizmo) {
    if (this.root.getLocked()) {
      gizmo.setEnabledRotationAxis('');
      gizmo.setEnabledScaling(false);
    } else {
      gizmo.setEnabledRotationAxis('xyz');
      gizmo.setEnabledScaling(true);
    }
  }

  toggleLockOtherGizmo(gizmo: PositionGizmo | ScaleGizmo | RotationGizmo) {
    if (this.root.getLocked()) {
      gizmo.xGizmo.isEnabled = false;
      gizmo.yGizmo.isEnabled = false;
      gizmo.zGizmo.isEnabled = false;
    } else {
      gizmo.xGizmo.isEnabled = true;
      gizmo.yGizmo.isEnabled = true;
      gizmo.zGizmo.isEnabled = true;
    }
  }

  disposeGizmo(gizmo: BoundingBoxGizmo | PositionGizmo | RotationGizmo | ScaleGizmo) {
    gizmo.attachedMesh = null;
    gizmo.dispose();
  }

  setGizmoScaleRotio(mesh: AbstractMesh) {
    const { x, y, z } = this.root.getSizeFromScaling(mesh);

  }

  moveOnlyX() {
    return this.root.eventManager.altKey;
  }

  moveOnlyZ() {
    return this.root.eventManager.spaceKey;
  }

  startDrag(mesh: AbstractMesh) {
    const index = this.findActiveMeshIndex(mesh);
    if (index > -1) {
      const selectBox = this.activeMeshes[index];
      this.pointerDragBehavior.attach(selectBox);
      // attach后不会触发drag事件，这里手动触发，但是在dragStart和第一次drag时，坐标会有问题。
      this.dragNum = 0;
      this.pointerDragBehavior.startDrag(1);
    }
  }

  onDragStart = ({ dragPlanePoint }: { dragPlanePoint: Vector3 }) => {
    this.dragPlanePoint = null;
    this.startPoint = null;
    if (this.moveLocked || this.forceMoveLock || this.root.getLocked()) {
      return;
    }
    this.root.moveMeshStart(this.activeMeshes);
  };

  onDrag = ({ dragPlanePoint }: { dragPlanePoint: Vector3 }) => {
    // 在调用startDrag后，dragStart和第一次drag获取的planePoint有问题
    // 因此引入dragNum辅助变量，废弃第一次触发drag的坐标，从第二次开始设置偏移量
    this.dragNum++;
    this.dragPlanePoint = dragPlanePoint;
    if (this.dragNum === 2) {
      this.startPoint = dragPlanePoint;
      this.dragRecord = {
        type: OperateType.Update,
        infos: this.activeMeshes.map(mesh => ({
          target: mesh,
          targetType: TargetType.Mesh,
          props: {
            position: {
              oldValue: mesh.position.clone(),
              newValue: mesh.position
            }
          }
        }))
      };
    }
    if (this.moveLocked || this.forceMoveLock || this.root.getLocked()) {
      return;
    }
    if (this.dragNum > 2) {
      const diff = dragPlanePoint.subtract(this.startPoint);
      diff.y = 0;
      this.startPoint = dragPlanePoint;
      this.root.moveMesh(diff, this.activeMeshes);
    }
  };

  onDragEnd = () => {
    if (this.dragRecord && this.dragNum > 2) {
      this.root.undoRedoManager.add(this.dragRecord);
    }
    this.startPoint = null;
    this.dragRecord = null;
    this.dragNum = 0;
    if (this.moveLocked || this.forceMoveLock || this.root.getLocked()) {
      return;
    }
    this.root.moveMeshEnd(this.activeMeshes);
  };

  dispose() {
    this.detechMesh();
    if (this.pointerDragBehavior.attachedNode) {
      this.pointerDragBehavior.detach();
    }
    this.pointerDragBehavior = null;
  }
}
