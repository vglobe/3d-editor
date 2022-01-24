import {
  Animation,
  Animatable,
  IAnimationKey,
  Scene,
  TransformNode,
} from 'babylonjs';
import { Topology3D } from '../core';
import { AnimationClip, AnimationPlayState } from '../scene';
import { s8, toSecond } from '../utils';
import { setValue } from '../utils/helper';
import {
  getFrameValue,
  transKeyframes,
  getChangedPropertyInfos,
  getInitValues,
} from './service';
import { PropertyInfo } from './data';

interface AnimationItem {
  loop: number;
  initial: boolean;
  totalFrames: number;
  nextTag: string;
  list: {
    property: string;
    keys: IAnimationKey[];
    propertyInfo: PropertyInfo;
    initValue: any;
  }[];
}

export class AnimationManager {
  public root: Topology3D;
  public listStore: Map<string, AnimationItem[]> = new Map();
  public animatableStore: Map<string, Animatable[]> = new Map();
  public listenerStore: Map<string, any> = new Map();
  static FRAME_PER_SECOND = 100;

  constructor(root: Topology3D) {
    this.root = root;
  }

  begin(mesh: TransformNode) {
    if (!mesh) {
      return;
    }
    this.stop(mesh);
    const name = mesh.name;
    const list = this.transAnimationClips(mesh);
    if (!list.length) {
      return;
    }
    this.listStore.set(name, list);
    const animatables: Animatable[] = [];
    let total = list.reduce((total, item) => (total += item.list.length), 0);
    list.forEach((item) => {
      const { loop, initial, totalFrames, nextTag, list } = item;
      if (!list.length) {
        return;
      }
      const animations = list.map((item) => {
        const { property, keys, propertyInfo } = item;
        const animation = new Animation(
          s8(),
          property,
          AnimationManager.FRAME_PER_SECOND,
          propertyInfo.valueType,
          Animation.ANIMATIONLOOPMODE_CYCLE
        );
        animation.setKeys(keys);
        return animation;
      });
      const scene = mesh.getScene();
      animations.forEach((animation) => {
        let times = loop ? loop : Infinity;
        const animatable = scene.beginDirectAnimation(
          mesh,
          [animation],
          0,
          totalFrames,
          true,
          1
        );
        animatable.onAnimationLoop = () => {
          times--;
          if (times < 1) {
            animatable.stop();
          }
        };
        animatable.onAnimationEnd = () => {
          total--;
          if (total < 1) {
            this.stop(mesh);
            if (nextTag) {
              const meshes = this.root.getMeshesByTags(nextTag);
              meshes.forEach((mesh) => {
                this.begin(mesh);
              });
            }
          }
        };
        animatables.push(animatable);
      });
    });
    if (animatables.length) {
      mesh.metadata.animationPlayState = AnimationPlayState.Play;
      mesh.metadata.animationPauseFrame = [];
      this.animatableStore.set(name, animatables);
      this.addAnimationListener(mesh);
    }
  }

  pause(mesh: TransformNode) {
    const name = mesh.name;
    const animatables = this.animatableStore.get(name);
    if (animatables) {
      animatables.forEach((animatable, i) => {
        animatable.pause();
        mesh.metadata.animationPauseFramep[i] = animatable.masterFrame;
      });
      mesh.metadata.animationPlayState = AnimationPlayState.Pause;
      this.removeAnimationListener(mesh);
    }
  }

  restart(mesh: TransformNode) {
    const name = mesh.name;
    const animatables = this.animatableStore.get(name);
    if (animatables) {
      animatables.forEach((animatable) => {
        animatable.restart();
      });
      mesh.metadata.animationPlayState = AnimationPlayState.Play;
      mesh.metadata.animationPauseFrame = [];
      this.addAnimationListener(mesh);
    }
  }

  stop(mesh: TransformNode) {
    const name = mesh.name;
    const animatables = this.animatableStore.get(name);
    const list = this.listStore.get(name);
    if (animatables) {
      animatables.forEach((animatable) => {
        animatable.onAnimationEnd = () => {};
        animatable.stop();
      });
      mesh.metadata.animationPlayState = AnimationPlayState.Finished;
      mesh.metadata.animationPauseFrame = [];
    }
    if (list) {
      list.forEach((item) => {
        const { initial, list } = item;
        // 动画结束后是否恢复属性到初始值
        if (initial) {
          list.forEach((value) => {
            const { property, initValue } = value;
            setValue(mesh, property, initValue);
          });
        }
      });
    }
    this.animatableStore.delete(name);
    this.listStore.delete(name);
  }

  addAnimationListener(mesh: TransformNode) {
    this.removeAnimationListener(mesh);
    // 先执行一次
    this.root.emitter.emit('animating', { mesh });
    const timer = setInterval(() => {
      this.root.emitter.emit('animating', mesh);
    }, 100);
    this.listenerStore.set(mesh.name, timer);
  }

  removeAnimationListener(mesh?: TransformNode) {
    if (this.listenerStore.has(mesh.name)) {
      const timer = this.listenerStore.get(mesh.name);
      clearTimeout(timer);
      // 最后执行一次
      this.root.emitter.emit('animating', mesh);
      this.listenerStore.delete(mesh.name);
    }
  }

  removeAllListener() {
    for (const [, timer] of this.listenerStore) {
      clearTimeout(timer);
    }
    this.listenerStore.clear();
  }

  transAnimationClips(mesh: TransformNode) {
    const clips: AnimationClip[] = mesh.metadata.animationClips || [];
    const list = clips.map((clip) => this.transClip(clip, mesh));
    return list;
  }

  transClip(data: AnimationClip, mesh: TransformNode): AnimationItem {
    const { loop, initial, nextTag, keyframes } = data;
    let totalFrames = 0;
    let list: AnimationItem['list'] = [];
    const filterPropertyInfos = getChangedPropertyInfos(mesh, keyframes);
    const initValues = getInitValues(filterPropertyInfos, mesh);
    const keyframesNew = transKeyframes(keyframes);
    keyframesNew.forEach((keyframe, i) => {
      const { duration, properties } = keyframe;
      const frame = toSecond(duration) * AnimationManager.FRAME_PER_SECOND;
      totalFrames += frame;
      filterPropertyInfos.forEach((propertyInfo, j) => {
        const { key } = propertyInfo;
        const value = properties[key];
        if (i === 0) {
          list.push({
            property: key,
            propertyInfo,
            initValue: initValues[key],
            keys: [
              {
                frame: 0,
                value: initValues[key],
              },
            ],
          });
        }
        const item = list[j];
        const prevKey = item.keys[i];
        item.keys.push({
          frame: totalFrames,
          value: getFrameValue(value, prevKey.value, item.propertyInfo),
        });
      });
    });
    mesh.metadata.animationInitValues = initValues;
    return {
      list,
      loop,
      nextTag,
      initial,
      totalFrames,
    };
  }

  dispose() {
    for (const [, animatables] of this.animatableStore) {
      animatables.forEach((animatable) => animatable.stop());
    }
    this.listStore.clear();
    this.animatableStore.clear();
    this.listenerStore.clear();
  }
}
