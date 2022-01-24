import { Vector3 } from 'babylonjs';
import { EventManager } from '..';
import { Topology3D } from '../../core';
import { GizmoType } from '../../scene';

interface ButtonInfo {
  code: string; // code为event.key的小写
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  spaceKey?: boolean;
  keyDown?: boolean;
}

interface ShortcutInfo {
  buttons: ButtonInfo | ButtonInfo[];
  callback(instance: Topology3D, event: EventManager): void;
}

type ShortcutsObj = {
  [name: string]: ShortcutInfo;
};

const Shortcuts: ShortcutsObj = {
  DeselectMesh: {
    buttons: [
      {
        code: 'escape',
        keyDown: false,
      },
    ],
    callback(instance) {
      instance.selectMesh([]);
    },
  },
  DeleteMesh: {
    buttons: [
      {
        code: 'delete',
        keyDown: false,
      },
      {
        code: 'backspace',
        keyDown: false,
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.deleteMesh(meshes);
    },
  },
  CopyMesh: {
    buttons: [
      {
        code: 'c',
        ctrlKey: true,
        keyDown: false,
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.copyMesh(meshes);
    },
  },
  CutMesh: {
    buttons: [
      {
        code: 'x',
        ctrlKey: true,
        keyDown: false,
      },
    ],
    callback(instance) {},
  },
  PasteMesh: {
    buttons: [
      {
        code: 'v',
        ctrlKey: true,
        keyDown: false,
      },
    ],
    callback(instance) {
      instance.pasteMesh();
    },
  },
  MoveMeshYUp: {
    buttons: [
      {
        code: 'pageup',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(0, instance.MOVE_DIFF, 0), meshes);
    },
  },
  MoveMeshYDown: {
    buttons: [
      {
        code: 'pagedown',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(0, -instance.MOVE_DIFF, 0), meshes);
    },
  },
  MoveMeshXDown: {
    buttons: [
      {
        code: 'arrowleft',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(-instance.MOVE_DIFF, 0, 0), meshes);
    },
  },
  MoveMeshXUp: {
    buttons: [
      {
        code: 'arrowright',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(instance.MOVE_DIFF, 0, 0), meshes);
    },
  },
  MoveMeshZUp: {
    buttons: [
      {
        code: 'arrowup',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(0, 0, instance.MOVE_DIFF), meshes);
    },
  },
  MoveMeshZDown: {
    buttons: [
      {
        code: 'arrowdown',
      },
    ],
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.moveMesh(new Vector3(0, 0, -instance.MOVE_DIFF), meshes);
    },
  },
  ScaleMeshXUp: {
    buttons: {
      code: 'arrowright',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(instance.SCALE_DIFF, 0, 0), meshes);
    },
  },
  ScaleMeshXDown: {
    buttons: {
      code: 'arrowleft',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(-instance.SCALE_DIFF, 0, 0), meshes);
    },
  },
  ScaleMeshZUp: {
    buttons: {
      code: 'arrowup',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(0, 0, instance.SCALE_DIFF), meshes);
    },
  },
  ScaleMeshZDown: {
    buttons: {
      code: 'arrowdown',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(0, 0, -instance.SCALE_DIFF), meshes);
    },
  },
  ScaleMeshYUp: {
    buttons: {
      code: 'pageup',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(0, instance.SCALE_DIFF, 0), meshes);
    },
  },
  ScaleMeshYDown: {
    buttons: {
      code: 'pagedown',
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.scaleMesh(new Vector3(0, -instance.SCALE_DIFF, 0), meshes);
    },
  },
  RotateMeshXUp: {
    buttons: {
      code: 'arrowright',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(instance.ROTATE_DIFF, 0, 0), meshes);
    },
  },
  RotateMeshXDown: {
    buttons: {
      code: 'arrowleft',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(-instance.ROTATE_DIFF, 0, 0), meshes);
    },
  },
  RotateMeshZUp: {
    buttons: {
      code: 'arrowup',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(0, 0, instance.ROTATE_DIFF), meshes);
    },
  },
  RotateMeshZDown: {
    buttons: {
      code: 'arrowdown',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(0, 0, -instance.ROTATE_DIFF), meshes);
    },
  },
  RotateMeshYUp: {
    buttons: {
      code: 'pageup',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(0, instance.ROTATE_DIFF, 0), meshes);
    },
  },
  RotateMeshYDown: {
    buttons: {
      code: 'pagedown',
      altKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      instance.rotateMesh(new Vector3(0, -instance.ROTATE_DIFF, 0), meshes);
    },
  },
  Undo: {
    buttons: {
      code: 'z',
      ctrlKey: true,
    },
    callback(instance) {
      instance.undo();
    },
  },
  Redo: {
    buttons: {
      code: 'z',
      ctrlKey: true,
      shiftKey: true,
    },
    callback(instance) {
      instance.redo();
    },
  },
  SwitchGizmo: {
    buttons: [
      {
        code: 'q',
      },
      {
        code: 'w',
      },
      {
        code: 'e',
      },
      {
        code: 'r',
      },
    ],
    callback(instance, event) {
      const type = {
        q: GizmoType.None,
        w: GizmoType.Position,
        e: GizmoType.Rotation,
        r: GizmoType.Scaling,
      }[event.code];
      instance.switchGizmoType(type);
    },
  },
  Combine: {
    buttons: {
      code: 'b',
      ctrlKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      const { parent } = instance.combine(meshes);
      if (parent) {
        instance.selectMesh(parent);
      }
    },
  },
  Uncombine: {
    buttons: {
      code: 'b',
      ctrlKey: true,
      shiftKey: true,
    },
    callback(instance) {
      const meshes = instance.getSelectedMeshes();
      const result = instance.uncombine(meshes);
      if (result.length) {
        instance.selectMesh(
          result.reduce((arr, item) => [...arr, ...item.children], [])
        );
      }
    },
  },
};

export { Shortcuts, ButtonInfo, ShortcutInfo };
