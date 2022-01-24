import { AbstractMesh, MeshBuilder, StandardMaterial, Vector3 } from "babylonjs";
import { initMeshMetadata, MeshType } from "..";
import { createId, isEmpty } from "../../utils/helper";

export interface DecalOption {
  position?: Vector3;
  normal?: Vector3;
  size?: Vector3;
  angle?: number;
  captureUVS?: boolean;
  zOffset?: number;
}

export function CreateDecal(mesh: AbstractMesh, option: DecalOption = {}) {
  const { zOffset, ...others } = option;
  const scene = mesh.getScene();
  const decal = MeshBuilder.CreateDecal(MeshType.Decal, mesh, {
    size: new Vector3(1, 1, 1),
    ...others
  });
  decal.name = createId(MeshType.Decal);
  const material = new StandardMaterial(createId(MeshType.Decal + 'Mat'), scene);
  material.zOffset = isEmpty(zOffset) ? -2 : zOffset;
  decal.material = material;
  decal.setParent(mesh);
  initMeshMetadata(decal, MeshType.Decal);
  return decal;
}