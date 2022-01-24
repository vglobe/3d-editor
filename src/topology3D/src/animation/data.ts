import { Animation } from 'babylonjs';
import { ValueType } from '../utils/type';

interface PropertyInfo {
  key: string;
  title: string;
  valueType: number;
  isAdd: boolean;
  inputType: string;
  hidden?: boolean;
}

const AnimateProps: PropertyInfo[] = [
  {
    title: '位置X',
    key: 'position.x',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    title: '位置Y',
    key: 'position.y',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    title: '位置Z',
    key: 'position.z',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    title: '缩放X',
    key: 'scaling.x',
    valueType: ValueType.Number,
    isAdd: false,
    inputType: 'number',
  },
  {
    title: '缩放Y',
    key: 'scaling.y',
    valueType: ValueType.Number,
    isAdd: false,
    inputType: 'number',
  },
  {
    title: '缩放Z',
    key: 'scaling.z',
    valueType: ValueType.Number,
    isAdd: false,
    inputType: 'number',
  },
  {
    title: '旋转X',
    key: 'rotation.x',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    title: '旋转Y',
    key: 'rotation.y',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    title: '旋转Z',
    key: 'rotation.z',
    valueType: ValueType.Number,
    isAdd: true,
    inputType: 'number',
  },
  {
    key: 'rotation',
    title: '旋转',
    inputType: '',
    isAdd: true,
    valueType: ValueType.Vector3,
    hidden: true,
  },
  {
    key: 'material.emissiveColor',
    title: '自发光色',
    inputType: 'color',
    isAdd: false,
    valueType: ValueType.Color4,
  },
  {
    key: 'material.diffuseColor',
    title: '漫射光色',
    inputType: 'color',
    isAdd: false,
    valueType: ValueType.Color4,
  },
  {
    key: 'material.specularColor',
    title: '高光色',
    inputType: 'color',
    isAdd: false,
    valueType: ValueType.Color4,
  },
  {
    key: 'material.ambientColor',
    title: '环境光色',
    inputType: 'color',
    isAdd: false,
    valueType: ValueType.Color4,
  },
];

export { AnimateProps, PropertyInfo };
