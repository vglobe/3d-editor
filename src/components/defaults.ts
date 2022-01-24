import { filename } from '@/services/file';
import { MeshEventAction, MeshEventTrigger } from '@topology3D';
import axios from 'axios';

export interface FormItemType {
  key: string; // 唯一标识，目前只用来传到外部
  key2?: string; // 有些属性存在嵌套
  name: string; // 标题
  tips?: string; // 提示
  placeholder?: string; // input placeholder
  type:
    | 'text'
    | 'number'
    | 'color'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'code'
    | 'image'
    | 'icon'
    | 'code'
    | 'slider';
  options?: {
    // 选项
    label: string; // 选项的标题，可以使用 html
    value: any; // 选项的值
  }[];
  min?: number; // 最小值
  max?: number; // 最大值
  rows?: number; // textarea 所需要的行数
  iconFamily?: string; // icon 类型节点需要
  title?: string; // code 类型编辑器需要
  language?: 'javascript' | 'json' | 'markdown'; // code 编辑器需要
}

export const iconMenus = {
  left: [
    {
      name: '文件',
      icon: 't-icon t-folder',
      children: [
        { name: '新建场景', action: 'newFile' },
        { name: '打开JSON文件', action: 'open' },
        { name: '导入.glb模型', action: 'load' },
        {},
        { name: '下载JSON文件', action: 'downloadJson' },
        {},
        { name: '智慧城市示例', action: 'openExampleCity' },
        { name: '室内场景示例', action: 'openExampleRoom' }
      ]
    },
    {
      name: '编辑',
      icon: 't-icon t-edit',
      children: [
        { name: '复制', action: 'copy' },
        { name: '粘贴', action: 'paste' },
        {},
        { name: '撤销', action: 'undo' },
        { name: '恢复', action: 'redo' }
      ]
    }
  ],
  middle: [],
  right: [
    {
      name: '预览',
      icon: 't-icon t-attention',
      action: 'preview'
    }
  ]
};

export const gizmos = [
  {
    name: '选择',
    icon: 't-icon t-xuanzekuang',
    value: 0
  },
  {
    name: '位置',
    icon: 't-icon t-weizhi',
    value: 2
  },
  {
    name: '旋转',
    icon: 't-icon t-xuanzhuan',
    value: 3
  },
  {
    name: '缩放',
    icon: 't-icon t-suofang',
    value: 4
  }
];
export const cameras = [
  {
    name: '环绕',
    icon: 't-icon t-huanraoxiangji',
    value: 'arcRotate'
  },
  {
    name: '跟随',
    icon: 't-icon t-gensuixiangji',
    value: 'follow'
  }
];

export const systemModels = {
  name: '基础模型',
  expand: true,
  show: true,
  list: [
    {
      name: 'box',
      image: '/model/box.svg',
      data: {
        name: 'box',
        option: {
          size: 6,
          yOffset: 3
        }
      }
    },
    {
      name: 'sphere',
      image: '/model/sphere.svg',
      data: {
        name: 'sphere',
        option: {
          diameter: 6,
          yOffset: 3
        }
      }
    }
  ]
};

export async function defalutMaterials() {
  const ret = (await axios.get('/3d/')) as any[];

  const list: any[] = [];
  for (const c of ret) {
    const group = {
      name: c.name,
      expand: true,
      show: true,
      list: []
    };

    const files = (await axios.get('/3d/' + c.name + '/models/')) as any[];
    for (const f of files) {
      const name = filename(f.name);
      group.list.push({
        name,
        image: '/3d/' + c.name + '/png/' + name + '.png',
        data: {
          path: '/3d/' + c.name + '/models/',
          name: f.name,
          scaling: 5
        }
      });
    }

    list.push(group);
  }

  return list;
}

export const FileConfigs: FormItemType[] = [
  {
    key: 'option',
    key2: 'filename',
    type: 'text',
    name: '文件名',
    placeholder: '文件名'
  }
];

export const SceneConfigs: FormItemType[] = [
  {
    key: 'scene',
    key2: 'clearColor',
    type: 'color',
    name: '背景色'
  },
  {
    key: 'scene',
    key2: 'ambientColor',
    type: 'color',
    name: '环境色'
  }
];

export const ArcRotateCameraConfigs: FormItemType[] = [
  {
    key: 'panningSensibility',
    type: 'select',
    name: '平移速度',
    options: [
      {
        label: '非常快',
        value: 50
      },
      {
        label: '快',
        value: 200
      },
      {
        label: '一般',
        value: 350
      },
      {
        label: '慢',
        value: 500
      },
      {
        label: '非常慢',
        value: 1000
      }
    ]
  },
  {
    key: 'zoomToMouseLocation',
    type: 'switch',
    name: '滚动定位焦点'
  }
];
export const FollowCameraConfigs: FormItemType[] = [];

export const LightConfigs: FormItemType[] = [];

export const SizeConfigs: FormItemType[] = [
  {
    key: 'position',
    key2: 'x',
    type: 'number',
    name: '位置X'
  },
  {
    key: 'position',
    key2: 'y',
    type: 'number',
    name: '位置Y'
  },
  {
    key: 'position',
    key2: 'z',
    type: 'number',
    name: '位置Z'
  },
  {
    key: 'size',
    key2: 'x',
    type: 'number',
    name: '尺寸X'
  },
  {
    key: 'size',
    key2: 'y',
    type: 'number',
    name: '尺寸Y'
  },
  {
    key: 'size',
    key2: 'z',
    type: 'number',
    name: '尺寸Z'
  },
  {
    key: 'scaling',
    key2: 'x',
    type: 'number',
    name: '缩放X'
  },
  {
    key: 'scaling',
    key2: 'y',
    type: 'number',
    name: '缩放Y'
  },
  {
    key: 'scaling',
    key2: 'z',
    type: 'number',
    name: '缩放Z'
  },
  {
    key: 'rotation',
    key2: 'x',
    type: 'number',
    name: '旋转X'
  },
  {
    key: 'rotation',
    key2: 'y',
    type: 'number',
    name: '旋转Y'
  },
  {
    key: 'rotation',
    key2: 'z',
    type: 'number',
    name: '旋转Z'
  }
];

export const MeshEventProps: FormItemType[] = [
  {
    key: 'trigger',
    name: '类型',
    type: 'select',
    options: [
      {
        label: '鼠标按下',
        value: MeshEventTrigger.MouseDown
      },
      {
        label: '鼠标弹起',
        value: MeshEventTrigger.MouseUp
      },
      {
        label: '鼠标移入',
        value: MeshEventTrigger.MouseIn
      },
      {
        label: '鼠标移出',
        value: MeshEventTrigger.MouseOut
      },
      {
        label: '双击鼠标',
        value: MeshEventTrigger.Dblclick
      }
    ]
  },
  {
    key: 'action',
    name: '行为',
    type: 'select',
    options: [
      {
        label: '打开链接',
        value: MeshEventAction.Link
      },
      {
        label: '执行动画',
        value: MeshEventAction.BeginAnimation
      },
      {
        label: '暂停动画',
        value: MeshEventAction.PauseAnimation
      },
      {
        label: '继续动画',
        value: MeshEventAction.RestartAnimation
      },
      {
        label: '停止动画',
        value: MeshEventAction.StopAnimation
      }
    ]
  }
];

export const LinkConfigs: FormItemType[] = [
  {
    key: 'params',
    key2: 'url',
    name: '地址',
    type: 'text'
  },
  {
    key: 'params',
    key2: 'blank',
    name: '新窗口',
    type: 'switch'
  }
];

export const BeginAnimationConfigs: FormItemType[] = [
  {
    key: 'params',
    key2: 'beginTags',
    name: '标签',
    type: 'text',
    placeholder: '缺省执行自身动画'
  }
];

export const PauseAnimationConfigs: FormItemType[] = [
  {
    key: 'params',
    key2: 'pauseTags',
    name: '标签',
    type: 'text',
    placeholder: '缺省执行自身动画'
  }
];

export const RestartAnimationConfigs: FormItemType[] = [
  {
    key: 'params',
    key2: 'restartTags',
    name: '标签',
    type: 'text',
    placeholder: '缺省执行自身动画'
  }
];

export const StopAnimationConfigs: FormItemType[] = [
  {
    key: 'params',
    key2: 'stopTags',
    name: '标签',
    type: 'text',
    placeholder: '缺省执行自身动画'
  }
];

export const ClipConfigs: FormItemType[] = [
  {
    key: 'loop',
    name: '播放次数',
    type: 'number',
    placeholder: '0或空为无限循环'
  },
  {
    key: 'initial',
    name: '结束后还原',
    type: 'switch'
  },
  {
    key: 'nextTag',
    name: '下一个标签',
    type: 'text',
    placeholder: '结束后执行标签'
  }
];

export const BaseKeyframeConfigs: FormItemType[] = [
  {
    key: 'duration',
    name: '过渡时间',
    type: 'number',
    placeholder: '默认1000'
  },
  {
    key: 'properties',
    key2: 'position.x',
    name: '位置X',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'position.y',
    name: '位置Y',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'position.z',
    name: '位置Z',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'scaling.x',
    name: '缩放X',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'scaling.y',
    name: '缩放Y',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'scaling.z',
    name: '缩放Z',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'rotation.x',
    name: '旋转X',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'rotation.y',
    name: '旋转Y',
    type: 'number'
  },
  {
    key: 'properties',
    key2: 'rotation.z',
    name: '旋转Z',
    type: 'number'
  }
];

export const MaterialKeyframeConfigs: FormItemType[] = [
  {
    key: 'properties',
    key2: 'material.emissiveColor',
    name: '自发光色',
    type: 'color'
  },
  {
    key: 'properties',
    key2: 'material.diffuseColor',
    name: '漫射光色',
    type: 'color'
  },
  {
    key: 'properties',
    key2: 'material.specularColor',
    name: '高光色',
    type: 'color'
  },
  {
    key: 'properties',
    key2: 'material.ambientColor',
    name: '环境光色',
    type: 'color'
  }
];

export const StandardMaterialProps: FormItemType[] = [
  {
    key: 'emissiveColor',
    name: '自发光色',
    type: 'color'
  },
  {
    key: 'diffuseColor',
    name: '漫射光色',
    type: 'color'
  },
  {
    key: 'specularColor',
    name: '高光色',
    type: 'color'
  },
  {
    key: 'ambientColor',
    name: '环境光色',
    type: 'color'
  }
];
