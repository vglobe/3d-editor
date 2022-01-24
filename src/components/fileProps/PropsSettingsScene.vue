<template>
  <a-collapse
    v-if="baseData"
    v-model:activeKey="activeKey"
    expand-icon-position="right"
    class="PenProps"
    :bordered="false"
  >
    <a-collapse-panel key="文件" :header="t('文件')">
      <FormEvery
        :configs="FileConfigs"
        :obj="baseData.store"
        @change-value="changeValue"
      />
    </a-collapse-panel>
    <a-collapse-panel key="环境" :header="t('环境')">
      <FormEvery
        :configs="SceneConfigs"
        :obj="baseData"
        @change-value="changeValue"
      />
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  Ref,
  ref,
} from 'vue';
import FormEvery from '../common/FormEvery.vue';
import { FormItemType } from '../common/FormItem.vue';
import { t } from '@/i18n/i18n';
import { FileConfigs, SceneConfigs } from '../defaults';
import { BaseData } from '../utils';
import { Topology3D } from '@topology3D';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'PropsSettingsScene',
  components: {
    FormEvery,
  },
  setup() {
    const activeKey = ref(['文件', '环境']);
    const baseData = inject<Ref<BaseData>>('baseData');

    function changeValue({ value, keys }: { value: any; keys: string[] }) {
      const [k1, k2] = keys;
      if (k1 === 'option') {
        topology3d.store[k1][k2] = value;
      } else if (k1 === 'scene') {
        const scene = topology3d.getScene();
        if (k2.endsWith('Color')) {
          value = Topology3D.StringToColor3(value);
        }
        topology3d.updateProps({
          target: scene,
          update: {
            [k2]: value,
          },
        });
      }
    }

    return {
      baseData,
      activeKey,
      FileConfigs,
      SceneConfigs,
      changeValue,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
</style>
