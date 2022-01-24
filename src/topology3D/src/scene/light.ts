import { HemisphericLight, Light, Scene, Tools, Vector3 } from "babylonjs";
import { createId } from "../utils/helper";

export enum LightType {
  Hemispheric = 'hemispheric'
}

export function CreateLight(name: string, scene: Scene, option: any = {}): Light {
  let light: Light;
  switch (name) {
    case LightType.Hemispheric:
      const opt = {
        direction: Vector3.Zero(),
        ...option
      }
      const hemispheric = new HemisphericLight(name, opt.direction, scene);
      light = hemispheric;
      break;
  }
  if (light) {
    light.name = createId(name);
    light.metadata = getLightMetadata(name);
  }
  return light;
}

export function getLightMetadata(type: string) {
  return {
    type
  }
}