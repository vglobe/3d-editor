<template>
  <section class="TopologyProps">
    <FileProps v-show="editType === 0" />
    <PenProps v-show="editType === 1" />
  </section>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import PenProps from './penProps/PenProps.vue';
import FileProps from './fileProps/FileProps.vue';

export default defineComponent({
  name: 'TopologyProps',
  components: {
    PenProps,
    FileProps,
  },

  setup() {
    const editType = inject('editType');
    return {
      editType,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.TopologyProps {
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px #dad7d7;
}
</style>

<style lang="scss">
.PropsTabs {
  height: 100%;
  .ant-tabs-bar {
    margin-bottom: 0;

    .ant-tabs-nav-wrap {
      .ant-tabs-tab {
        margin-right: 0;
        margin-left: 16px;

        padding-top: 20px;
        padding-bottom: 10px;
        padding-left: 0;
        padding-right: 0;

        .tabText {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          color: #7f838c;
        }

        &.ant-tabs-tab-active {
          .tabText {
            font-family: PingFangSC, PingFangSC-Medium;
            font-weight: 500;
            color: #171b27;
          }
        }
      }

      .ant-tabs-ink-bar {
        background: #000000;
      }
    }
  }

  .ant-tabs-content {
    // TODO: 60px 可能不标准
    height: calc(100% - 60px);
    .ant-tabs-tabpane {
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>

<style lang="scss">
.PenProps {
  background-color: #fff;
  .ant-collapse-item {
    padding: 8px 12px;
    .ant-collapse-header {
      padding-left: 0;
      padding-top: 0;
      padding-bottom: 0;
      font-size: 12px;
      color: #262626;
      font-weight: 600;
    }

    .ant-collapse-content-box {
      padding: 0;
    }
  }
}
</style>
