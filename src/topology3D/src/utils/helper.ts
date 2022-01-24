/*
 * @Description: 
 * @Author: G
 * @Date: 2021-11-04 14:39:44
 * @LastEditTime: 2021-11-10 10:21:44
 */

import { AbstractMesh, Tools, Vector3 } from "babylonjs";
import { deepClone } from ".";
import { resetMeshRotation } from "../scene";

export function testRepeat(array: any) {
  const map = {};
  const same = [];
  const diff = [];
  array.forEach(item => {
    if (!map[item.name]) {
      map[item.name] = 0;
    } else {
      map[item.name]++;
    }
  });
  Object.keys(map).forEach(name => {
    if (map[name]) {
      same.push(name);
    } else {
      diff.push(name);
    }
  });
  console.log('map: ', map);
  console.log('same: ', same);
  console.log('diff: ', diff);
}

export function obj2Array(obj: any) {
  return Object.keys(obj).map(key => [key, obj[key]]);
}

export function logVector3(v: Vector3) {
  console.log('x: ', v.x, 'y: ', v.y, 'z: ', v.z);
}

export function tryCatch(callback: () => void) {
  try {
    callback && callback();
  } catch (e) {
    console.error(e);
  }
}

export function getValue(obj: any, property: string) {
  if (property.startsWith('rotation')) {
    resetMeshRotation(obj);
  }
  const path = property.split('.');
  let value: any = obj;
  for (const key of path) {
    if (value instanceof Object === false || value === null) {
      return undefined;
    }
    value = value[key];
  }
  return value;
}

export function setValue(obj: any, property: string, value: any) {
  if (property.startsWith('rotation')) {
    resetMeshRotation(obj);
  }
  const path = property.split('.');
  const last = path.splice(path.length - 1, 1)[0];
  let target = obj;
  for (const key of path) {
    if (target instanceof Object === false || target === null) {
      return false;
    }
    target = target[key];
  }
  target[last] = value;
  return true;
}

export function isEmpty(value: any) {
  return value == null || value === '';
}

export function createId(prefix?: string) {
  return `${prefix ? `${prefix}-!-` : ''}${Tools.RandomId()}`;
}

export function testCloneMesh(mesh: AbstractMesh, total: number) {
  for (let i = 0; i < total; i++) {
    const cloneMesh = mesh.clone('clone', null);
    cloneMesh.name = Tools.RandomId();
    const symbol1 = Math.random() >= 0.5;
    const symbol2 = Math.random() >= 0.5;
    const x = Math.random() * 200;
    const z = Math.random() * 200;
    const position = new Vector3(
      symbol1 ? x : -x,
      0,
      symbol2 ? z : -z
    );
    cloneMesh.position = position;
    cloneMesh.metadata = deepClone(mesh.metadata);
  }
}