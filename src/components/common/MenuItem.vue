<template>
  <div>
    <a-dropdown class="MenuItem" overlayClassName="dropMenu">
      <div
        @click.prevent="action(menuItem.action)"
        :style="{
          cursor: menuItem.action && 'pointer',
          color: active ? '#1890ff' : '',
        }"
      >
        <div class="iconItem">
          <div class="icon">
            <i :class="menuItem.icon"></i>
            <i
              class="abs t-icon t-triangle-down rightIcon"
              v-if="menuItem.children"
            ></i>
          </div>

          <span class="font">{{ t(menuItem.name) }}</span>
        </div>
      </div>
      <template #overlay v-if="menuItem.children">
        <a-menu>
          <template v-for="(subItem, i) in menuItem.children">
            <a-menu-item
              v-if="subItem.name && subItem.action"
              class="menuItem"
              @click="action(subItem.action, subItem.params)"
              :key="subItem.name"
            >
              <div class="nameKeyboard">
                <span>{{ t(subItem.name) }}</span>
              </div>
            </a-menu-item>
            <a
              v-else-if="subItem.name && subItem.url"
              :href="subItem.url"
              :target="subItem.target"
              :key="subItem.name"
            >
              <a-menu-item class="menuItem"> {{ t(subItem.name) }}</a-menu-item>
            </a>
            <a-menu-divider :key="i" v-else />
          </template>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface MenuItemType {
  name: string;
  icon: string;
  action?: string;
  children?: {
    name?: string;
    keyboard?: string;
    action?: string;

    url?: string;
    target?: string;
    params?: any;
  }[];
}

export default defineComponent({
  name: 'MenuItem',
  props: {
    menuItem: {
      type: Object as PropType<MenuItemType>,
      require: true,
    },
    active: {
      type: Boolean,
    },
  },
  emits: ['action'],
  setup(props, { emit }) {
    function action(action?: string, params?: any) {
      // 交由父组件处理，存在 action 才处理
      action && emit('action', action, params);
    }

    return {
      action,
    };
  },
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';
.MenuItem {
  .iconItem {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover {
      color: $color-primary;
    }
    .icon {
      height: 24px;
      line-height: 24px;
      i {
        font-size: 18px;

        &.rightIcon {
          font-size: 10px;
        }
      }

      span.number {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: center;
        line-height: 20px;
      }
    }

    .font {
      height: 18px;
      font-size: 13px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      line-height: 18px;
    }
  }
}
.dropMenu {
  .menuItem {
    padding-left: 28px;

    min-width: 187px;
    height: 40px;
    background: #ffffff;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 14px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    line-height: 14px;
    color: #444649;

    .ant-dropdown-menu-title-content {
      width: 100%;
      .nameKeyboard {
        display: flex;
        align-items: center;
      }

      .arrowIcon {
        font-size: 30px;
      }
    }

    &:hover {
      background: #fff7f0;
      color: #fa6428;
    }
  }

  .scaleView {
    padding: 8px 16px;
    background-color: #fff;
    display: flex;
    align-items: center;

    box-shadow: 0 0 10px rgb(0 0 0 / 30%);

    i {
      cursor: pointer;
    }
  }

  .lineWidthView {
    min-width: 220px;
    padding: 8px;
    background-color: #fff;
    box-shadow: 0 0 10px rgb(0 0 0 / 30%);

    .ant-input-number {
      width: 100%;
    }
  }
}
</style>
