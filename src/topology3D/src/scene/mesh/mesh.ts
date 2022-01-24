import {
  AbstractMesh,
  ActionManager,
  BoundingInfo,
  Color3,
  ExecuteCodeAction,
  Geometry,
  HighlightLayer,
  Mesh,
  MeshBuilder,
  Scene,
  TransformNode,
  Vector3,
} from 'babylonjs';
import { Emitter } from 'mitt';
import { Point3D } from '../../core';
import { getAngleFromRotation, toRadian } from '../../utils';
import { toArray } from '../../utils/array';
import { createId, tryCatch } from '../../utils/helper';

export enum MeshType {
  Ground = 'ground',
  Import = 'import',
  Box = 'box',
  Sphere = 'sphere',
  Combine = 'combine',
  Decal = 'decal',
  TransformNode = 'transformNode',
}

export enum MeshEventTrigger {
  MouseDown,
  MouseUp,
  MouseIn,
  MouseOut,
  Dblclick,
}

export enum MeshEventAction {
  Link,
  BeginAnimation,
  PauseAnimation,
  RestartAnimation,
  StopAnimation,
  Javascript,
  Function,
  Custom,
}

export interface AnimationClip {
  loop: number;
  initial: boolean;
  nextTag: string;
  keyframes: {
    duration: number;
    properties: {
      [property: string]: any;
    };
  }[];
}

export enum AnimationPlayState {
  Finished,
  Play,
  Pause,
}

export interface MeshEventParams {
  [MeshEventAction.Link]: {
    url: string;
    blank: boolean;
  };
  [MeshEventAction.BeginAnimation]: {
    beginTags: string;
  };
  [MeshEventAction.PauseAnimation]: {
    pauseTags: string;
  };
  [MeshEventAction.RestartAnimation]: {
    restartTags: string;
  };
  [MeshEventAction.StopAnimation]: {
    stopTags: string;
  };
  [MeshEventAction.Javascript]: {};
  [MeshEventAction.Function]: {};
  [MeshEventAction.Custom]: {};
}

export interface MeshEvent {
  trigger: MeshEventTrigger;
  action: MeshEventAction;
  params: MeshEventParams[MeshEvent['action']];
}

export interface Metadata {
  type: MeshType;
  animationClips: AnimationClip[];
  animationPlayState: AnimationPlayState;
  animationPauseFrame: number[];
  animationInitValues: { [property: string]: any };
  events: MeshEvent[];
  initSize: Point3D;
  unselectable?: boolean;
  unmovable?: boolean;
  unscalable?: boolean;
  unrotatable?: boolean;
  uncopyable?: boolean;
}

export function CreateMesh(
  name: MeshType,
  scene: Scene,
  option: any = {}
): Mesh {
  let mesh: Mesh;
  let opt: any = {};
  switch (name) {
    case MeshType.Ground:
      opt = {
        width: 100,
        height: 100,
        sideOrientation: Mesh.DOUBLESIDE,
        ...option,
      };
      mesh = MeshBuilder.CreatePlane(name, opt, scene);
      mesh.visibility = 0.5;
      mesh.rotation.x = toRadian(90);
      break;
    case MeshType.Box:
      opt = {
        ...option,
      };
      mesh = MeshBuilder.CreateBox(name, opt, scene);
      break;
    case MeshType.Sphere:
      mesh = MeshBuilder.CreateSphere(name, option, scene);
      break;
  }
  if (mesh) {
    mesh.name = createId(name);
    initMeshMetadata(mesh, name);
  }
  return mesh;
}

export function resetName(target: TransformNode | Geometry | Mesh) {
  if (target.hasOwnProperty('name')) {
    target['name'] = createId(target['name']);
  } else if (target.hasOwnProperty('id')) {
    target['id'] = createId(target['id']);
  }
}

export function getRoot(target: AbstractMesh): AbstractMesh {
  if (target.parent) {
    return getRoot(target.parent as AbstractMesh);
  }
  return target;
}

export function getSubChild(mesh: AbstractMesh) {
  return mesh.getChildMeshes(true)[0];
}

export function getChildren(mesh: AbstractMesh) {
  return mesh.getChildMeshes(false);
}

export function getBoundingBoxInfo(rootMesh: AbstractMesh | AbstractMesh[]) {
  const rootMeshes = toArray(rootMesh);
  let min: Vector3, max: Vector3;
  rootMeshes.forEach((rootMesh) => {
    const children = getChildren(rootMesh);
    [rootMesh, ...children].forEach((mesh) => {
      const { minimum, maximum } = mesh.getBoundingInfo().boundingBox;
      if (!min) {
        min = minimum;
      } else {
        min = Vector3.Minimize(min, minimum);
      }
      if (!max) {
        max = maximum;
      } else {
        max = Vector3.Maximize(max, maximum);
      }
    });
  });
  return { min, max };
}

export function setBoundingBoxInfo(mesh: AbstractMesh) {
  const { min, max } = getBoundingBoxInfo(mesh);
  const boundingInfo = new BoundingInfo(min, max);
  return mesh.setBoundingInfo(boundingInfo);
}

export function addHighlight(
  mesh: AbstractMesh,
  highlightLayer: HighlightLayer
) {
  const children = getChildren(mesh);
  [mesh, ...children].forEach((mesh) => {
    tryCatch(() =>
      highlightLayer.addMesh(mesh as Mesh, Color3.FromHexString('#1890ff'))
    );
  });
}

export function removeHighlight(
  mesh: AbstractMesh,
  highlightLayer: HighlightLayer
) {
  const children = getChildren(mesh);
  [mesh, ...children].forEach((mesh) => {
    tryCatch(() => highlightLayer.removeMesh(mesh as Mesh));
  });
}

export function resetMeshRotation(mesh: TransformNode) {
  if (mesh.rotationQuaternion) {
    mesh.rotation = mesh.rotationQuaternion.toEulerAngles();
    mesh.rotationQuaternion = null;
  }
}

export function getRotation(mesh: TransformNode) {
  resetMeshRotation(mesh);
  return mesh.rotation.clone();
}

export function getRotateAngle(mesh: TransformNode) {
  const rotation = getRotation(mesh);
  return getAngleFromRotation(rotation);
}

export function initMeshMetadata(
  mesh: TransformNode,
  type: MeshType
): Metadata {
  if (!mesh.metadata) {
    mesh.metadata = {};
  }
  const metadata: Metadata = mesh.metadata;
  if (!metadata.type) {
    metadata.type = type;
  }
  if (!metadata.animationClips) {
    metadata.animationClips = [
      {
        loop: 0,
        initial: true,
        nextTag: '',
        keyframes: [],
      },
    ];
  }
  if (!metadata.animationPlayState) {
    metadata.animationPlayState = AnimationPlayState.Finished;
  }
  if (!metadata.animationPauseFrame) {
    metadata.animationPauseFrame = [];
  }
  if (!metadata.animationInitValues) {
    metadata.animationInitValues = {};
  }
  if (!metadata.events) {
    metadata.events = [];
  }
  if (!metadata.initSize && metadata.type !== MeshType.TransformNode) {
    const { max, min } = getBoundingBoxInfo(mesh as AbstractMesh);
    metadata.initSize = {
      x: max.x - min.x,
      y: max.y - min.y,
      z: max.z - min.z,
    };
  }
  if (metadata.type === MeshType.Ground) {
    metadata.uncopyable = true;
    metadata.unmovable = true;
    metadata.unrotatable = true;
    metadata.unscalable = true;
    metadata.unselectable = true;
  }
  return metadata;
}

export function registerEvents(mesh: AbstractMesh, emitter: Emitter) {
  const scene = mesh.getScene();
  if (mesh.actionManager) {
    mesh.actionManager.dispose();
    mesh.actionManager = null;
  }
  mesh.actionManager = new ActionManager(scene);
  mesh.actionManager.hoverCursor = 'default';
  [
    ActionManager.OnPickDownTrigger,
    ActionManager.OnPickUpTrigger,
    ActionManager.OnPointerOverTrigger,
    ActionManager.OnPointerOutTrigger,
    ActionManager.OnDoublePickTrigger,
  ].forEach((trigger) => {
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger,
          parameter: 'r',
        },
        () => {
          switch (trigger) {
            case ActionManager.OnPickDownTrigger:
              emitter.emit('mouseDownMesh', mesh);
              break;
            case ActionManager.OnPickUpTrigger:
              emitter.emit('mouseUpMesh', mesh);
              break;
            case ActionManager.OnPointerOverTrigger:
              emitter.emit('mouseInMesh', mesh);
              break;
            case ActionManager.OnPointerOutTrigger:
              emitter.emit('mouseOutMesh', mesh);
              break;
            case ActionManager.OnDoublePickTrigger:
              emitter.emit('dblclickMesh', mesh);
              break;
          }
        }
      )
    );
  });
}

export function getMeshCenter(mesh: TransformNode | TransformNode[]) {
  const meshes = toArray(mesh);
  if (meshes.length === 1) {
    return meshes[0].position;
  }
  const [first, ...others] = meshes;
  return Vector3.Center(first.position, getMeshCenter(others));
}

export function isMeshType(mesh: AbstractMesh, type: MeshType) {
  return mesh.metadata?.type === type;
}
