<template>
  <div class="TopologyMaterial">
    <a-tabs v-model:activeKey="activeKey" size="small" class="PropsTabs">
      <a-tab-pane key="系统组件">
        <template #tab>
          <span class="tabText">{{t('系统模型')}}</span>
        </template>
        <SystemPanel :list="list" :type="1" :showList="false"></SystemPanel>
      </a-tab-pane>
      <a-tab-pane key="结构">
        <template #tab>
          <span class="tabText">{{t('结构')}}</span>
        </template>
        <div>
          <Tree
            :items="meshTree.datas"
            :multiple="true"
            @onSelect="onSelectElement"
            @onLock="onLockElement"
            @onShow="onShowElement"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
    <a-modal
      v-model:visible="showModelNewFolder"
      :title="t('新建文件夹')"
      :cancelText="t('取消')"
      :okText="t('确定')"
      @ok="okAdd"
    >
      <a-input v-model:value="newFolder" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, Ref } from 'vue';
import { message } from 'ant-design-vue';

import SystemPanel from './common/SystemPanel.vue';
import { defalutMaterials, systemModels } from './defaults';
import { t } from '@/i18n/i18n';
import Tree from './common/Tree.vue';
import { Topology3D } from '@topology3D';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'TopologyMaterial',
  components: {
    SystemPanel,
    Tree,
  },
  setup() {
    /** 结构 */
    const meshTree = inject<Ref>('meshTree');
    const onSelectElement = ({ item, selected, multiple }) => {
      if (multiple) {
        const index = meshTree.value.selected.findIndex((id) => id === item.id);
        if (index === -1 && selected) {
          meshTree.value.selected.push(item.id);
        } else if (index > -1 && !selected) {
          meshTree.value.selected.splice(index, 1);
        }
      } else {
        meshTree.value.selected = [item.id];
      }
      const meshes = topology3d.getMeshesByNames(meshTree.value.selected);
      topology3d.selectMesh(meshes);
    };
    const onLockElement = ({ item, locked }) => {
      topology3d.lockMesh(item.id, locked);
    };
    const onShowElement = ({ item, visible }) => {
      topology3d.showMesh(item.id, visible);
    };
    /** 结构 end */

    const list = ref([systemModels]);
    const showList = ref<boolean>(false);
    const usersList = ref([]);
    const activeKey = ref('系统组件');
    const showModelNewFolder = ref<boolean>(false);
    const newFolder = ref('');
    const newFolderType = ref(-1);
    (async () => {
      list.value = [systemModels, ...(await defalutMaterials())];
    })();

    const onAdd = (type: number) => {
      newFolderType.value = type;
      showModelNewFolder.value = true;
    };

    const okAdd = () => {
      if (!newFolder.value) {
        return;
      }
      newFolder.value = newFolder.value.trim();
      if (newFolder.value === '') {
        return;
      }

      if (newFolderType.value === 0) {
        //新建图纸文件夹
      } else if (newFolderType.value === 2) {
        //新建‘我的组件’的文件夹
        const folder = usersList.value.find((n) => n.name === newFolder.value);
        if (folder) {
          message.error(t('文件夹已经存在').toString());
          return;
        }
        usersList.value.push({
          name: newFolder.value,
          expand: true,
          show: true,
          list: [],
        });
        //数据发送到后端
      }
      newFolder.value = '';
      showModelNewFolder.value = false;
    };

    const onOpen = () => {};

    return {
      meshTree,
      onSelectElement,
      onLockElement,
      onShowElement,
      list,
      usersList,
      activeKey,
      showList,
      showModelNewFolder,
      newFolder,
      newFolderType,
      onAdd,
      okAdd,
      onOpen,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.TopologyMaterial {
  overflow: auto;

  :deep(.ant-tabs) {
    background: #ffffff;
  }

  &:deep(.ant-tabs-content) {
    .new-fold {
      padding-left: 16px;
      margin-top: 12px;

      .div-sort {
        display: inline-block;
        position: absolute;
        right: 20px;
      }
    }
  }
}
</style>
