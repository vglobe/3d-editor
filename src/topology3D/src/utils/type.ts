import {
  AbstractMesh,
  Camera,
  Color3,
  Color4,
  Light,
  Matrix,
  Quaternion,
  Scene,
  Size,
  TransformNode,
  Vector2,
  Vector3,
} from 'babylonjs';

// 枚举可操作对象的类型
export enum TargetType {
  Mesh,
  TransformNode,
  Scene,
  Camera,
  Light,
}

/**
 * @description 枚举所有可能的属性值类型
 * 顺序不能变，动画值类型设置依赖此枚举值
 */
export enum ValueType {
  Number,
  Vector3,
  Quaternion,
  Matrix,
  Color3,
  Vector2,
  Size,
  Color4,
  String,
  Boolean,
  Null,
  Void,
  Unknown,
}

export function getTargetType(target: any) {
  if (target instanceof AbstractMesh) {
    return TargetType.Mesh;
  } else if (target instanceof TransformNode) {
    return TargetType.TransformNode;
  } else if (target instanceof Scene) {
    return TargetType.Scene;
  } else if (target instanceof Light) {
    return TargetType.Light;
  } else if (target instanceof Camera) {
    return TargetType.Camera;
  }
}

export function getValueType(value: any) {
  if (typeof value === 'number') {
    return ValueType.Number;
  } else if (typeof value === 'string') {
    return ValueType.String;
  } else if (typeof value === 'boolean') {
    return ValueType.Boolean;
  } else if (value === null) {
    return ValueType.Null;
  } else if (value === undefined) {
    return ValueType.Void;
  } else if (value instanceof Vector3) {
    return ValueType.Vector3;
  } else if (value instanceof Color4) {
    return ValueType.Color4;
  } else if (value instanceof Color3) {
    return ValueType.Color3;
  } else if (value instanceof Quaternion) {
    return ValueType.Quaternion;
  } else if (value instanceof Vector2) {
    return ValueType.Vector2;
  } else if (value instanceof Size) {
    return ValueType.Size;
  } else if (value instanceof Matrix) {
    return ValueType.Matrix;
  }
  return ValueType.Unknown;
}

export function cloneValue(value: any, type: ValueType = getValueType(value)) {
  switch (type) {
    case ValueType.Number:
    case ValueType.String:
    case ValueType.Boolean:
    case ValueType.Null:
    case ValueType.Void:
    case ValueType.Unknown:
      return value;
    case ValueType.Vector3:
    case ValueType.Quaternion:
    case ValueType.Color4:
    case ValueType.Color3:
    case ValueType.Vector2:
    case ValueType.Size:
    case ValueType.Matrix:
      return value.clone();
  }
}

export function equalsValue(
  v1: any,
  v2: any,
  v1Type: ValueType = getValueType(v1),
  v2Type: ValueType = getValueType(v2)
) {
  if (v1Type !== v2Type) {
    return false;
  }
  switch (v1Type) {
    case ValueType.Number:
    case ValueType.String:
    case ValueType.Boolean:
    case ValueType.Null:
    case ValueType.Void:
    case ValueType.Unknown:
      return v1 === v2;
    case ValueType.Vector3:
    case ValueType.Quaternion:
    case ValueType.Color4:
    case ValueType.Color3:
    case ValueType.Vector2:
    case ValueType.Size:
    case ValueType.Matrix:
      return v1.equals(v2);
  }
}

export function jsonValueToValue(value: any, valueType: ValueType) {
  switch (valueType) {
    case ValueType.Number:
    case ValueType.String:
    case ValueType.Boolean:
    case ValueType.Null:
    case ValueType.Void:
    case ValueType.Unknown:
      return value;
    case ValueType.Vector3:
      return new Vector3(value.x, value.y, value.z);
    case ValueType.Quaternion:
      return new Quaternion(value.x, value.y, value.z, value.w);
    case ValueType.Color4:
      return new Color4(value.r, value.g, value.b, value.a);
    case ValueType.Color3:
      return new Color3(value.r, value.g, value.b);
    case ValueType.Vector2:
      return new Vector2(value.x, value.y);
    case ValueType.Size:
      return new Size(value.width, value.height);
    case ValueType.Matrix:
      return new Matrix();
  }
}
