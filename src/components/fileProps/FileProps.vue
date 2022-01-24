<template>
  <a-tabs v-model:activeKey="activeKey" size="small" class="PropsTabs">
    <a-tab-pane key="场景">
      <template #tab>
        <span class="tabText">{{ t('场景') }}</span>
      </template>
      <PropsSettingsScene />
    </a-tab-pane>
    <!-- <a-tab-pane key="通信">
      <template #tab>
        <span class="tabText">{{ t('通信') }}</span>
      </template>
    </a-tab-pane>
    <a-tab-pane key="布局">
      <template #tab>
        <span class="tabText">{{ t('布局') }}</span>
      </template>
    </a-tab-pane>
    <a-tab-pane key="结构">
      <template #tab>
        <span class="tabText">{{ t('结构') }}</span>
      </template>
      <Tree :items="items" />
    </a-tab-pane> -->
  </a-tabs>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted } from 'vue';
import PropsSettingsScene from './PropsSettingsScene.vue';
import PropsSettingsCamera from './PropsSettingsCamera.vue';
import Tree from '../common/Tree.vue';
import { Topology3D } from '@topology3D';

declare const topology3d: Topology3D;

export interface TreeItem {
  id: string;
  type: number;
  name: string;
  description: string; // 业务字段
  title: string; // markdown 提示
  locked: number;
  visible: boolean;
  children: TreeItem[];
  opened: boolean;
  showInput?: boolean; // 是否展示输入框
}

export default defineComponent({
  name: 'FileProps',
  components: {
    PropsSettingsScene,
    Tree,
  },
  setup() {
    const activeKey = ref('场景');
    const items = ref([]);

    return {
      activeKey,
      items,
    };
  },
});

// Meshes 数据格式转换处理
export function format(meshes: any) {
  const result = [];
  meshes.forEach((mesh) => {
    let children: TreeItem[] = null;
    if (mesh.children && mesh.children.length > 0) {
      // 遍历所有的 children
      children = [];
      children.push(...format(mesh.children));
      if (children && !children.length) {
        children = null;
      }
    }
    result.push({
      id: mesh.mesh.id,
      name: mesh.mesh.name,
      children,
      opened: false,
    });
  });
  return result;
}
</script>

<style scoped>
</style>