<template>
  <div class="tree">
    <div
      class="item"
      v-for="(item, i) in items"
      :key="i"
      :class="{ gray: item.visible === false }"
    >
      <div
        class="content"
        :class="{ active: item.selected }"
        :title="`id: ${item.id} name: ${item.name} ${
          item.description ? 'description: ' + item.description : ''
        }
          ${item.title ? 'title: ' + item.title : ''}`"
      >
        <div class="text" @click="onSelectItem($event, item)">
          <CaretRightOutlined
            v-if="item.children && !item.opened"
            class="mr12 pointer"
            @click.stop="onOpenItem(item, true)"
          />
          <CaretDownOutlined
            v-if="item.children && item.opened"
            class="mr12 pointer"
            @click.stop="onOpenItem(item, false)"
          />

          <CaretDownOutlined
            v-if="!item.children"
            class="mr12"
            style="opacity: 0"
          />

          <FundOutlined v-if="!item.type && !item.children" />

          <FolderOutlined v-if="!item.type && item.children && !item.opened" />

          <FolderOpenOutlined
            v-if="!item.type && item.children && item.opened"
          />
          <RiseOutlined v-if="item.type" />

          <label
            ><span v-if="!item.showInput" @dblclick="showInput(item, true)">{{
              item.description || item.title || item.name
            }}</span>
            <a-input
              autoFocus
              v-if="item.showInput"
              v-model:value="item.description"
              @change="onChanged(item, 'description')"
              @blur="showInput(item, false)"
            ></a-input
          ></label>
        </div>
        <div class="state">
          <span class="mr8">
            <a-tooltip placement="top" v-if="!item.locked">
              <template #title>
                <span>{{ t('可编辑') }}</span>
              </template>
              <UnlockOutlined @click.stop="onLock(item, 1)" />
            </a-tooltip>
            <a-tooltip placement="top" v-if="item.locked === 1">
              <template #title>
                <span>{{ t('被锁定') }}</span>
              </template>
              <LockOutlined @click.stop="onLock(item, 0)" />
            </a-tooltip>
            <!-- <a-tooltip placement="top" v-if="item.locked > 1">
              <template #title>
                <span>{{ t('被禁用') }}</span>
              </template>
              <StopOutlined @click.stop="onLock(item, 0)" />
            </a-tooltip> -->
          </span>
          <span>
            <a-tooltip placement="top" v-if="item.visible !== false">
              <template #title>
                <span>{{ t('显示') }}</span>
              </template>
              <EyeOutlined @click.stop="onVisible(item, false)" />
            </a-tooltip>
            <a-tooltip placement="top" v-else>
              <template #title>
                <span>{{ t('隐藏') }}</span>
              </template>
              <EyeInvisibleOutlined @click.stop="onVisible(item, true)" />
            </a-tooltip>
          </span>
        </div>
      </div>

      <Tree
        v-if="item.children && item.opened"
        :items="item.children"
        :multiple="multiple"
        @onSelect="onSelectItem"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, toRaw, watch } from 'vue';
import { Topology3D } from '@topology3D';

import {
  EyeOutlined,
  EyeInvisibleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  FundOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  RiseOutlined,
  UnlockOutlined,
  LockOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';

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
  selected?: boolean;
  showInput?: boolean; // 是否展示输入框
}

export default defineComponent({
  name: 'Tree',
  components: {
    EyeOutlined,
    EyeInvisibleOutlined,
    CaretRightOutlined,
    CaretDownOutlined,
    FundOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    RiseOutlined,
    UnlockOutlined,
    LockOutlined,
    StopOutlined,
  },
  props: {
    items: {
      type: Array as PropType<TreeItem[]>,
      require: true,
    },
    multiple: {
      type: Boolean,
    },
  },
  emits: ['onSelect', 'onOpen', 'onLock', 'onShow'],
  setup(props, { emit }) {
    //  2D version codes
    function showInput(item: TreeItem, show: boolean) {
      item.showInput = show;
    }

    function onSelectItem(e, item) {
      if (e.ctrlKey && props.multiple) {
        item.selected = !item.selected;
      } else {
        item.selected = true;
      }
      emit('onSelect', {
        item,
        selected: item.selected,
        multiple: e.ctrlKey && props.multiple,
      });
    }

    function onOpenItem(item: TreeItem, open: boolean) {
      item.opened = open;
    }

    function onChanged(item: TreeItem, key: string) {}

    function onLock(item: TreeItem, locked: number) {
      item.locked = locked;
      emit('onLock', { item, locked });
    }

    function onVisible(item: TreeItem, visible: boolean) {
      item.visible = visible;
      emit('onShow', { item, visible });
    }

    return {
      showInput,
      onSelectItem,
      onOpenItem,
      onChanged,
      onLock,
      onVisible,
    };
  },
});

export function getSelectedIds(treeData: TreeItem[], ids: string[] = []) {
  treeData.forEach((data) => {
    if (data.selected) {
      ids.push(data.id);
    }
    if (data.children) {
      getSelectedIds(data.children);
    }
  });
  return ids;
}

export function selectTreeNode(
  treeData: TreeItem[],
  keys: string[],
  openParent = true
) {
  let openFlag = false;
  treeData.forEach((data) => {
    if (keys.includes(data.id)) {
      data.selected = true;
      openParent && (openFlag = true);
    } else {
      data.selected = false;
    }
    if (data.children) {
      const opened = selectTreeNode(data.children, keys, openParent);
      if (opened) {
        data.opened = true;
      }
    }
  });
  return openFlag;
}

export function deselectTreeNode(
  treeData: TreeItem[],
  key: string | string[] = null
) {
  const keys = key ? (typeof key === 'string' ? [key] : key) : null;
  treeData.forEach((data) => {
    if (data.selected && (keys === null || keys.includes(data.id))) {
      data.selected = false;
    }
    if (data.children) {
      deselectTreeNode(data.children, keys);
    }
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.tree {
  margin-top: 16px;

  & > .item {
    position: relative;
    margin: 10px;

    & > .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      &:hover {
        color: $color-primary-hover;
      }
      &.active {
        color: $color-primary;
      }
    }

    .text {
      display: flex;
      align-items: center;

      label {
        margin-right: 10px;
        cursor: pointer;
        span {
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          word-break: break-all;
          word-break: break-word;
          -webkit-line-clamp: 1;
          line-height: 1;
          height: 16px;
          padding-right: 8px;
        }
      }

      & > .anticon {
        margin-right: 8px;
      }
    }

    .state {
      white-space: nowrap;
    }
  }

  .tree {
    margin-top: 0;
    margin-left: 12px;
    & > .item {
      margin-right: 0;
    }
  }
}
</style>
