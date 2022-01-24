import { Material, MultiMaterial, Scene, StandardMaterial, Tools } from "babylonjs";
import { GridMaterial } from "babylonjs-materials";
import { createId } from "../../utils/helper";

export enum MaterialType {
  Grid = 'grid',
  Standard = 'standard',
  Multi = 'multi'
}

export function CreateMaterial(name: string, scene: Scene, option: any = {}): Material {
  let material: Material;
  switch (name) {
    case MaterialType.Grid:
      const grid = new GridMaterial(name, scene);
      material = grid;
      break;
    case MaterialType.Standard:
      const standard = new StandardMaterial(name, scene);
      material = standard;
      break;
    case MaterialType.Multi:
      const multi = new MultiMaterial(name, scene);
      material = multi;
      break;
  }
  if (material) {
    material.name = createId(name);
    material.metadata = getMaterialsMetadata(name);
  }
  return material;
}

export function getMaterialsMetadata(type: string) {
  return {
    type
  }
}