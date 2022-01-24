import { AbstractMesh, Animation, TransformNode, Vector3 } from 'babylonjs';
import { Topology3D } from '../core';
import { AnimationClip, getRotateAngle, getRotation } from '../scene';
import { toRadian } from '../utils';
import { getValue, isEmpty } from '../utils/helper';
import {
  cloneValue,
  equalsValue,
  jsonValueToValue,
  ValueType,
} from '../utils/type';
import { PropertyInfo, AnimateProps } from './data';

function getPropertyInfo(name: string): PropertyInfo {
  return AnimateProps.find((item) => item.key === name);
}

function getFrameValue(value: any, prevValue: any, propertyInfo: PropertyInfo) {
  if (isEmpty(value)) {
    return prevValue;
  }
  const { isAdd, valueType } = propertyInfo;
  switch (valueType) {
    case Animation.ANIMATIONTYPE_FLOAT:
      value = Number(value);
      break;
    case Animation.ANIMATIONTYPE_VECTOR3:
      value = new Vector3(value.x, value.y, value.z);
      break;
    case Animation.ANIMATIONTYPE_COLOR3:
    case Animation.ANIMATIONTYPE_COLOR4:
      value = Topology3D.StringToColor4(value);
      break;
  }
  if (isAdd) {
    switch (valueType) {
      case Animation.ANIMATIONTYPE_FLOAT:
        return value + prevValue;
      case Animation.ANIMATIONTYPE_VECTOR3:
      case Animation.ANIMATIONTYPE_COLOR3:
      case Animation.ANIMATIONTYPE_COLOR4:
        return prevValue.add(value);
    }
  }
  return value;
}

function isRotationProperty(property: string) {
  return property.startsWith('rotation');
}

function getPropertyInitValue(mesh: TransformNode, property: string) {
  let initValue: any;
  if (isRotationProperty(property)) {
    const [, axis] = property.split('.');
    const rotation = getRotateAngle(mesh);
    initValue = rotation[axis];
  } else {
    initValue = getValue(mesh, property);
  }
  return initValue;
}

function isPropertyChanged(mesh: TransformNode, property: string, value: any) {
  const info = getPropertyInfo(property);
  const initValue = getPropertyInitValue(mesh, property);
  if (isEmpty(value)) {
    return false;
  }
  if (info.isAdd) {
    return value !== 0;
  }
  return !equalsValue(value, initValue);
}

function getChangedPropertyInfos(
  mesh: TransformNode,
  keyframes: AnimationClip['keyframes']
) {
  const changedProperties: { [name: string]: true } = {};
  const infos: PropertyInfo[] = [];
  keyframes.forEach((keyframe) => {
    /**
     * 过滤掉没有被设置或者值没有变化的属性
     */
    const { properties } = keyframe;
    Object.keys(properties).forEach((property) => {
      const key = isRotationProperty(property) ? 'rotation' : property;
      if (changedProperties[key]) {
        return;
      }
      if (isPropertyChanged(mesh, property, properties[property])) {
        changedProperties[key] = true;
        infos.push(getPropertyInfo(key));
      }
    });
  });
  return infos;
}

function transKeyframes(keyframes: AnimationClip['keyframes']) {
  const newKeyframes: AnimationClip['keyframes'] = [];
  keyframes.forEach((keyframe, i) => {
    const { duration, properties } = keyframe;
    const newKeyframe = { duration, properties: { ...properties } };

    /** rotation */
    const rotation = {
      x: toRadian(properties['rotation.x'] || 0),
      y: toRadian(properties['rotation.y'] || 0),
      z: toRadian(properties['rotation.z'] || 0),
    };
    newKeyframe.properties.rotation = rotation;
    /** rotation end */

    newKeyframes.push(newKeyframe);
  });
  return newKeyframes;
}

function getInitValues(propertiyInfos: PropertyInfo[], mesh: TransformNode) {
  const initValues: { [property: string]: any } = {};
  propertiyInfos.reduce((values, info) => {
    let value: any;
    if (info.key === 'rotation') {
      value = getRotation(mesh);
    } else {
      value = getValue(mesh, info.key);
    }
    values[info.key] = cloneValue(value);
    return values;
  }, initValues);
  return initValues;
}

function metadataInitValueToBabylonValue(property: string, value: any) {
  const propertyInfo = getPropertyInfo(property);
  const { valueType } = propertyInfo;
  return jsonValueToValue(value, valueType);
}

export {
  getPropertyInfo,
  getFrameValue,
  getChangedPropertyInfos,
  transKeyframes,
  getInitValues,
  metadataInitValueToBabylonValue,
};
