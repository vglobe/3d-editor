<template>
  <div class="content">
    <a-collapse
      v-model:activeKey="activeKey"
      expandIconPosition="left"
      :bordered="false"
    >
      <template #expandIcon="{ isActive }">
        <icon-font v-if="isActive" type="t-folder-open" />
        <icon-font v-else type="t-folder" />
      </template>
      <a-collapse-panel
        v-for="(item, index) in list"
        :key="index + ''"
        :header="
          type !== 1
            ? item.name.length <= item.end
              ? t(item.name)
              : item.name.slice(0, item.end) + '...'
            : t(item.name) + '(' + item.list.length + ')'
        "
        :style="customStyle"
        @mouseover="panelMouseenter(item)"
        @mouseleave="panelMouseleave(item)"
      >
        <div class="thumbs" v-if="item.expand">
          <div
            v-if="type == 1"
            class="thumb flex"
            v-for="(menu, index) in item.list"
            :key="index"
            v-show="!menu.hidden"
            :draggable="true"
            @dragstart="onDrag($event, menu)"
            @click="onTouchstart($event, menu)"
            @touchstart="onTouchstart($event, menu)"
          >
            <div
              class="center hover"
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 38px;
              "
              :title="t(menu.name)"
            >
              <i v-if="menu.icon" class="icon-size" :class="menu.icon"></i>
              <img v-if="menu.image" :src="menu.image" />
            </div>
          </div>

          <div
            v-else
            class="flex"
            style="min-height: 25px"
            :class="{ thumbunone: !showList, list: showList }"
            v-for="(userItem, indexItem) in item.list"
            :key="indexItem"
            v-show="!item.hidden"
            :draggable="true"
            @dragstart="onDrag($event, userItem)"
            @click="onTouchstart($event, userItem)"
            @touchstart="onTouchstart($event, userItem)"
          >
            <div class="center rel hover" :title="userItem.name">
              <div class="image">
                <img :src="userItem.image" />
              </div>
              <i
                class="t-icon t-edit"
                v-if="item.component"
                @click="onOpen(userItem)"
              ></i>
              <div class="text" v-if="type === 0">{{ t(item.name) }}</div>
              <a-popconfirm
                placement="topLeft"
                :title="t('确定删除吗')"
                @confirm="removeItem(userItem, index, indexItem)"
              >
                <i class="t-icon t-delete" @click.stop></i>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref } from 'vue';
import { createFromIconfontCN } from '@ant-design/icons-vue';

declare const topology: any;
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2030495_z79a3qjw7ro.js',
});
export default defineComponent({
  name: 'SystemPanel',
  props: {
    list: {
      type: Array as PropType<any[]>,
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
    showList: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    IconFont,
  },
  setup(props) {
    const activeKey = ref(['0']);

    const uploadUrl = ref<string>('');
    const fileList = ref([]);
    const uploadName = ref('');
    const uploadHeaders = ref('');
    const onDrag = (event: DragEvent, node: any, fn?: boolean) => {
      // console.log(node.data);
      // topology.addPen(node.data);
      if (!node || !event.dataTransfer) {
        return;
      }
      event.dataTransfer.setData(
        'Topology',
        JSON.stringify(node.componentData || node.data)
      );
    };
    const onTouchstart = (event: any, node: any, fn?: boolean) => {
      topology.touchedNode = node.componentData || node.data;
    };
    const customStyle =
      'background: #ffffff;border-radius: 4px;border: 0;overflow: hidden';

    watch(activeKey, (val) => {
      // console.log(val);
    });

    const removeName = (item: any, index: number) => {};
    const onAddTopology = (item: any, event: any) => {};

    const panelMouseenter = (item: any) => {
      if (props.type == 0) {
        item.end = 5;
      } else if (props.type == 2) {
        item.end = 4;
      }
    };
    const panelMouseleave = (item: any) => {
      item.end = item.name.length;
    };
    const onOpen = (item: any) => {};
    const removeItem = (item: any, index: number, indexItem: any) => {};
    const imageChange = (e: Event, name: string) => {
      console.log('上传图片处理');

      e.stopPropagation();
    };
    return {
      activeKey,
      // list,
      onDrag,
      onTouchstart,
      customStyle,
      removeName,
      onAddTopology,
      panelMouseenter,
      panelMouseleave,
      onOpen,
      removeItem,
      uploadUrl,
      fileList,
      uploadName,
      uploadHeaders,
      imageChange,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.content {
  &:deep(.ant-collapse) {
    .ant-collapse-item {
      .ant-collapse-header {
        text-overflow: ellipsis;
        .ant-collapse-extra {
          display: flex;

          margin-top: 4px;
          .add {
            display: none;
          }

          .delete {
            //  pointer-events:none;
            display: none;
          }
          .upload-image {
            display: none;
          }
        }

        &:hover {
          color: #1890ff;
          cursor: pointer;
          // text-overflow: ellipsis;
          .ant-collapse-extra {
            .add {
              position: absolute;
              display: block;
              right: 54px;
            }

            .delete {
              position: absolute;
              display: block;
              right: 32px;
            }
            .upload-image {
              position: absolute;
              display: inline-block;
              // line-height: 46px;
              right: 76px;
              top: 16px;
              z-index: 2;
            }
            .collapse {
            }
          }
        }
      }

      .ant-collapse-content {
        .thumbs {
          display: flex;
          flex-wrap: wrap;
          margin-left: 8px;

          .thumb {
            width: 25%;

            & > div {
              width: 100%;
            }

            .icon-size {
              font-size: 25px !important;
              width: 25px;
            }

            img {
              max-width: 25px;
              max-height: 25px;
              margin: 4px;
            }

            &:hover {
              background: #f2f3f5;
            }
          }
          .thumbunone {
            margin-top: 8px;
            width: 48%;
            cursor: pointer;

            & > div {
              width: 100%;
            }

            .image {
              padding: 5px;
              border-radius: 2px;
              border: 1px solid #f4f4f4;
            }

            img {
              height: 64px;
            }

            &:hover {
              .image {
                border-color: $color-primary;
              }

              .t-edit {
                display: block;
              }

              .t-delete {
                display: block;
              }
            }

            .text {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin: 4px 0;
            }

            .t-edit {
              position: absolute;
              right: 24px;
              top: 4px;
              display: none;
              color: $color-primary;
              cursor: pointer;
            }

            .t-delete {
              position: absolute;
              right: 4px;
              top: 4px;
              display: none;
              color: $color-primary;
              cursor: pointer;
            }
          }

          .list {
            width: 100%;
            margin: 4px 0;
            & > div {
              display: flex;
              align-items: center;
              width: 100%;
              text-align: left;
            }
            img {
              width: 16px;
              height: 16px;
              margin-right: 4px;
            }

            .text {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1;
            }
          }
        }
      }
    }
  }
}
</style>
