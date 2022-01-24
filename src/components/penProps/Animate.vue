<template>
  <a-collapse
    v-model:activeKey="activeKeys"
    expand-icon-position="right"
    class="PenProps"
    :bordered="false"
  >
    <a-collapse-panel key="动画" :header="t('动画')" v-if="meshData && meshData.animationClips && meshData.animationClips[0]">
      <div class="btns">
        <a-button @click="onBegin" class="btn" type="primary" size="small">
          {{ t('播放') }}
        </a-button>
        <a-button @click="onPause" class="btn" type="primary" size="small">
          {{ t('暂停') }}
        </a-button>
        <a-button @click="onRestart" class="btn" type="primary" size="small">
          {{ t('继续') }}
        </a-button>
        <a-button @click="onStop" class="btn" type="primary" size="small">
          {{ t('停止') }}
        </a-button>
      </div>
      <FormEvery
        :configs="ClipConfigs"
        :obj="meshData.animationClips[0]"
        @change-value="onChangeClip()"
      />
      <div>
        <a-button
          @click="onAddKeyframe(meshData.animationClips[0])"
          class="btn full"
          type="primary"
          size="small"
        >
          {{ t('添加帧') }}
        </a-button>
      </div>
      <div
        class="content mt4"
        v-for="(keyframe, j) in meshData.animationClips[0].keyframes"
        :key="j"
      >
        <div class="title hover" @click="onCollapseKeyframe(j)">
          {{ t('帧') + (j + 1) }}
          <span>
            <i
              class="t-icon t-delete mr8"
              @click.stop="onDelKeyframe(meshData.animationClips[0], j)"
            ></i>
            <i v-if="!collapseKeyframe[j]" class="t-icon t-angle-down"></i>
            <i v-else class="t-icon t-angle-top"></i>
          </span>
        </div>
        <FormEvery
          v-if="collapseKeyframe[j]"
          :configs="BaseKeyframeConfigs"
          :obj="keyframe"
          @change-value="onChangeKeyframe"
        />
        <FormEvery
          v-if="collapseKeyframe[j] && meshData.material"
          :configs="MaterialKeyframeConfigs"
          :obj="keyframe"
          @change-value="onChangeKeyframe"
        />
        <a-divider />
      </div>
      <!-- </div> -->
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  Ref,
  ref,
  toRaw,
  watch,
} from 'vue';
import { t } from '@/i18n/i18n';
import FormEvery from '../common/FormEvery.vue';
import { FormItemType } from '../common/FormItem.vue';

import CustomAnimation from './CustomAnimation.vue';
import { Topology3D } from '@topology3D';
import { AnimationClip } from '@topology3D/src/scene';
import { Mesh } from 'babylonjs';
import { AnimateProps } from '@topology3D/src/animation';
import {
  ClipConfigs,
  BaseKeyframeConfigs,
  MaterialKeyframeConfigs,
} from '../defaults';
import { AbstractMesh } from 'babylonjs/Meshes/abstractMesh';
import { MeshData } from '../utils';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'PenAnimate',
  components: {
    FormEvery,
  },
  setup() {
    const activeKeys = ref(['动画']);
    const collapseClip = ref({});
    const collapseKeyframe = ref({ 0: true });
    const mesh = inject<Ref<AbstractMesh>>('editMesh');
    const meshData = inject<Ref<MeshData>>('meshData');

    const onBegin = () => {
      topology3d.beginMeshAnimation(mesh.value);
    };
    const onPause = () => {
      topology3d.pauseMeshAnimation(mesh.value);
    };
    const onRestart = () => {
      topology3d.restartMeshAnimation(mesh.value);
    };
    const onStop = () => {
      topology3d.stopMeshAnimation(mesh.value);
    };
    const onAddClip = () => {
      meshData.value.animationClips.push({
        loop: 0,
        initial: true,
        nextTag: '',
        keyframes: [],
      });
    };
    const onCollapseClip = () => {};
    const onDelClip = (i: number) => {
      meshData.value.animationClips.splice(i, 1);
    };
    const onChangeClip = () => {};
    const onAddKeyframe = (clip: AnimationClip) => {
      const newKeyframe = { duration: 1000, properties: {} };
      [...BaseKeyframeConfigs, ...MaterialKeyframeConfigs].forEach((config) => {
        if (config.key === 'properties') {
          newKeyframe.properties[config.key2] = '';
        }
      });
      clip.keyframes.push(newKeyframe);
      collapseKeyframe.value[clip.keyframes.length - 1] = true;
    };
    const onCollapseKeyframe = (index: number) => {
      collapseKeyframe.value[index] = !collapseKeyframe.value[index];
    };
    const onDelKeyframe = (clip: AnimationClip, i: number) => {
      clip.keyframes.splice(i, 1);
    };
    const onChangeKeyframe = () => {};

    return {
      activeKeys,
      collapseClip,
      collapseKeyframe,
      meshData,
      onBegin,
      onPause,
      onRestart,
      onStop,
      onAddClip,
      onCollapseClip,
      onDelClip,
      onChangeClip,
      onAddKeyframe,
      onCollapseKeyframe,
      onDelKeyframe,
      onChangeKeyframe,
      ClipConfigs,
      BaseKeyframeConfigs,
      MaterialKeyframeConfigs,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.full {
  width: 100%;
}

.title {
  font-size: 12px;
  color: #262626;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  user-select: none;
}
.t-icon {
  font-size: 12px;
}

.btns {
  display: flex;
  justify-content: space-between;
}

.buttons {
  width: 100%;

  .animateButton {
    flex: 1;
    padding: 0;
  }
}

.FormItem {
  font-size: 10px;
  margin-bottom: 0;
  margin: 4px 0;
  a {
    margin-left: 8px;
  }
}

.ant-divider {
  margin: 12px 0;
}
</style>
