import {
  AnimationClip,
  MeshEvent,
  MeshEventAction,
  MeshEventParams,
  Point3D,
  Topology3D
} from '@topology3D';
import { Topology3dStore } from '@topology3D/src/store';
import { StandardMaterial, AbstractMesh, ArcRotateCamera } from 'babylonjs';
import { StandardMaterialProps } from './defaults';

export enum EditType {
  Canvas, // 画布
  Pen // 单画笔
}

export interface BaseData {
  store: Topology3dStore;
  scene: {
    clearColor: string;
    ambientColor: string;
  };
  camera: {
    panningSensibility: number;
    zoomToMouseLocation: boolean;
  };
}

export interface MeshMaterial {
  emissiveColor: string;
  diffuseColor: string;
  specularColor: string;
  ambientColor: string;
}

export interface MeshData {
  id: string;
  name: string;
  position: Point3D;
  scaling: Point3D;
  size: Point3D;
  rotation: Point3D;
  material: null | MeshMaterial;
  events: MeshEvent[];
  animationClips: AnimationClip[];
  tags: string[];
}

export function addIcons(url: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          const iconfont = JSON.parse(xhr.responseText);
          const iconGroup: any = {
            name: iconfont.name,
            expand: true,
            loaded: true,
            list: []
          };

          iconfont.glyphs.forEach((item: any) => {
            iconGroup.list.push({
              name: item.name,
              icon:
                iconfont.font_family +
                ' ' +
                iconfont.css_prefix_text +
                item.font_class,
              data: {
                rect: {
                  width: 100,
                  height: 100
                },
                name: 'image',
                iconFamily: iconfont.font_family,
                icon: String.fromCharCode(item.unicode_decimal)
              }
            });
          });
          resolve(iconGroup);
        } catch (error) {
          reject(error);
        }
      }
    };
  });
}

export const isJSONFile = (file: File) => {
  return file.type === 'application/json';
};

export const isGLBFile = (file: File) => {
  return file.name.endsWith('.glb');
};

export const initTopology3DData = (topology3d: Topology3D) => {
  const meshTree = {
    datas: getMeshTree(topology3d, [], []),
    selected: [],
    opened: []
  };
  const editType = EditType.Canvas;
  const baseData = getBaseData(topology3d);
  const meshData = null;
  const editMesh = null;
  return { meshTree, editType, baseData, meshData, editMesh };
};

export const getMeshTree = (
  topology3d: Topology3D,
  selected: string[],
  opened: string[]
) => {
  return transTreeData(topology3d.getMeshTree(), selected, opened);
};

export function getBaseData(topology3d: Topology3D): BaseData {
  const scene = topology3d.getScene();
  const camera = topology3d.getCamera() as ArcRotateCamera;
  return {
    store: topology3d.store,
    scene: {
      clearColor: scene.clearColor?.toHexString(),
      ambientColor: scene.ambientColor?.toHexString()
    },
    camera: {
      panningSensibility: camera.panningSensibility,
      zoomToMouseLocation: camera.zoomToMouseLocation
    }
  };
}

export function getMeshData(
  mesh: AbstractMesh,
  topology3d: Topology3D
): MeshData {
  const { id, name, metadata = {}, position, scaling, material } = mesh;

  return {
    id,
    name,
    position: {
      x: position.x,
      y: position.y,
      z: position.z
    },
    scaling: {
      x: scaling.x,
      y: scaling.y,
      z: scaling.z
    },
    size: topology3d.getSizeFromScaling(mesh),
    rotation: topology3d.getRotateAngle(mesh),
    material: getMaterialProps(material as StandardMaterial),
    events: metadata.events || [],
    animationClips: metadata.animationClips || [],
    tags: Topology3D.GetTags(mesh)
  };
}

export function getMaterialProps(material: StandardMaterial) {
  if (!material) {
    return null;
  }
  return StandardMaterialProps.reduce<MeshMaterial>(
    (obj, item) => {
      const { key } = item;
      switch (key) {
        case 'emissiveColor':
        case 'diffuseColor':
        case 'specularColor':
        case 'ambientColor':
          obj[key] = material[key]?.toHexString();
          break;
      }
      return obj;
    },
    { emissiveColor: '', diffuseColor: '', specularColor: '', ambientColor: '' }
  );
}

export function transTreeData(
  datas: any,
  selected: string[] = [],
  opened: string[] = []
) {
  return datas.map(item => ({
    id: item.mesh.name,
    name: item.mesh.id,
    visible: item.mesh.isEnabled(),
    locked: item.mesh.metadata.unmovable ? 1 : 0,
    selected: selected.includes(item.mesh.name),
    opened: opened.includes(item.mesh.name),
    children: item.children.length
      ? transTreeData(item.children, selected, opened)
      : null
  }));
}

export function executeCode(
  event: MeshEvent,
  mesh: AbstractMesh,
  topology3d: Topology3D
) {
  const { action, params } = event;
  let _params: any;
  let meshes: AbstractMesh[];
  switch (action) {
    case MeshEventAction.Link:
      _params = params as MeshEventParams[MeshEventAction.Link];
      window.open(_params.url, _params.blank ? '_blank' : '_self');
      break;
    case MeshEventAction.BeginAnimation:
      _params = params as MeshEventParams[MeshEventAction.BeginAnimation];
      meshes = topology3d.getMeshesByTags(_params.beginTags);
      if (meshes.length === 0) {
        meshes = [mesh];
      }
      topology3d.beginMeshAnimation(meshes);
      break;
    case MeshEventAction.PauseAnimation:
      _params = params as MeshEventParams[MeshEventAction.PauseAnimation];
      meshes = topology3d.getMeshesByTags(_params.pauseTags);
      if (meshes.length === 0) {
        meshes = [mesh];
      }
      topology3d.pauseMeshAnimation(meshes);
      break;
    case MeshEventAction.RestartAnimation:
      _params = params as MeshEventParams[MeshEventAction.RestartAnimation];
      meshes = topology3d.getMeshesByTags(_params.restartTags);
      if (meshes.length === 0) {
        meshes = [mesh];
      }
      topology3d.restartMeshAnimation(meshes);
      break;
    case MeshEventAction.StopAnimation:
      _params = params as MeshEventParams[MeshEventAction.StopAnimation];
      meshes = topology3d.getMeshesByTags(_params.stopTags);
      if (meshes.length === 0) {
        meshes = [mesh];
      }
      topology3d.stopMeshAnimation(meshes);
      break;
    case MeshEventAction.Javascript:
      _params = params as MeshEventParams[MeshEventAction.Javascript];
      break;
    case MeshEventAction.Function:
      _params = params as MeshEventParams[MeshEventAction.Function];
      break;
    case MeshEventAction.Custom:
      _params = params as MeshEventParams[MeshEventAction.Custom];
      break;
  }
}
