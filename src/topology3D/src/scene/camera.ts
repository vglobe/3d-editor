import {
  ArcRotateCamera,
  Camera,
  FollowCamera,
  Scene,
  Tags,
  Vector3,
} from 'babylonjs';
import { s8 } from '../utils';
import { createId } from '../utils/helper';

export enum CameraType {
  ArcRotate = 'arcRotate',
  Follow = 'follow',
}

export function CreateCamera(
  name: string,
  scene: Scene,
  option: any = {}
): Camera {
  let camera: Camera;
  switch (name) {
    case CameraType.ArcRotate:
      option = {
        alpha: 0,
        beta: 0,
        radius: 0,
        target: Vector3.Zero(),
        ...option,
      };
      const arcRotateCamera = new ArcRotateCamera(
        name,
        option.alpha,
        option.beta,
        option.radius,
        option.target,
        scene
      );
      arcRotateCamera.zoomToMouseLocation = true;
      arcRotateCamera.lowerRadiusLimit = 2;
      arcRotateCamera.allowUpsideDown = false;
      arcRotateCamera.panningSensibility = 200;
      arcRotateCamera.speed = 1;
      arcRotateCamera.wheelPrecision = 5;
      arcRotateCamera.keysDown = [];
      arcRotateCamera.keysUp = [];
      arcRotateCamera.keysLeft = [];
      arcRotateCamera.keysRight = [];
      camera = arcRotateCamera;
      break;
    case CameraType.Follow:
      option = {
        position: Vector3.Zero(),
        lockedTarget: null,
        ...option,
      };
      const followCamera = new FollowCamera(
        name,
        option.position,
        scene,
        option.lockedTarget
      );
      camera = followCamera;
      break;
  }
  if (camera) {
    camera.name = createId(name);
    Tags.AddTagsTo(camera, name);
    camera.metadata = getCameraMetadata(name);
  }
  return camera;
}

export function getCameraMetadata(type: string) {
  return {
    type,
  };
}
