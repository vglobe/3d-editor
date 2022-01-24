<template>
  <a-tabs v-model:activeKey="activeKey" size="small" class="PropsTabs">
    <a-tab-pane key="外观">
      <template #tab>
        <span class="tabText">
          {{ t('外观') }}
        </span>
      </template>
      <PenExterior />
    </a-tab-pane>
    <a-tab-pane key="事件">
      <template #tab>
        <span class="tabText">
          {{ t('事件') }}
        </span>
      </template>
      <penEvent />
    </a-tab-pane>
    <a-tab-pane key="动效">
      <template #tab>
        <span class="tabText">
          {{ t('动效') }}
        </span>
      </template>
      <PenAnimate />
    </a-tab-pane>
    <a-tab-pane key="数据">
      <template #tab>
        <span class="tabText">
          {{ t('数据') }}
        </span>
      </template>
      <PenData />
    </a-tab-pane>
  </a-tabs>
</template>


<script lang="ts">
import PenExterior from './Exterior.vue';
import PenEvent from './Event.vue';
import PenAnimate from './Animate.vue';
import PenData from './Data.vue';
import Tree from '../common/Tree.vue';
import { defineComponent, ref } from 'vue';
import FileProps from '@/components/fileProps/FileProps.vue';
import { Topology3D } from '@topology3D';

export default defineComponent({
  name: 'PenProps',
  components: {
    PenExterior,
    PenEvent,
    PenData,
    PenAnimate,
    Tree,
    FileProps,
  },
  setup() {
    const activeKey = ref('外观');

    return {
      activeKey
    };
  },
});
</script>

<style scoped>
</style>