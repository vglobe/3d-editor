import { Vector3 } from "babylonjs";
import { Point3D } from "../core";

export function abs(num: number, percent: number | string): number {
  if (+percent) {
    return +percent;
  }

  if (!percent || percent[(percent as string).length - 1] !== '%') {
    return 0;
  }

  percent = (percent as string).substr(0, (percent as string).length - 1);

  return (num * +percent) / 100;
}

export function toRadian(angle: number) {
  return angle * Math.PI / 180;
}

export function toAngle(radian: number) {
  return radian * 180 / Math.PI;
}

export function toSecond(millisecond: number) {
  return millisecond / 1000;
}

export function getAngleFromRotation(rotate: Point3D) {
  const { x = 0, y = 0, z = 0 } = rotate;
  return {
    x: toAngle(x),
    y: toAngle(y),
    z: toAngle(z),
  };
}

export function getRotationFromAngle(angle: Point3D) {
  const { x = 0, y = 0, z = 0 } = angle;
  return {
    x: toRadian(x),
    y: toRadian(y),
    z: toRadian(z),
  };
}

export function toSize(scaling: Point3D, initSize: Point3D = { x: 1, y: 1, z: 1 }) {
  return {
    x: (initSize.x || 1) * scaling.x,
    y: (initSize.y || 1) * scaling.y,
    z: (initSize.z || 1) * scaling.z,
  };
}

export function toScaling(size: Point3D, initSize: Point3D = { x: 1, y: 1, z: 1 }) {
  return {
    x: initSize.x ? size.x / initSize.x : 0,
    y: initSize.y ? size.y / initSize.y : 0,
    z: initSize.z ? size.z / initSize.z : 0
  };
}