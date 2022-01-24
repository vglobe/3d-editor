<template>
  <div class="flex TopologyMenu">
    <router-link class="logo" to="/">
      <img src="/img/logo.png" />
      {{ t('le5le') }}
    </router-link>
    <div class="flex menus" v-if="baseData">
      <div class="flex">
        <MenuItem
          class="leftItem mr30"
          v-for="(leftItem, index) in menus.left"
          :menuItem="leftItem"
          @action="action"
          :key="index"
        />
      </div>
      <div class="flex">
        <!-- 锁住 -->
        <a-dropdown
          class="MenuItem mr30"
          overlayClassName="dropMenu"
          v-if="baseData.store"
        >
          <div @click.prevent="onLock">
            <div class="iconItem">
              <div
                class="icon"
                :class="baseData.store.data.locked && 'warning'"
              >
                <i
                  class="t-icon"
                  :class="{
                    't-lock': baseData.store.data.locked,
                    't-unlock': !baseData.store.data.locked,
                  }"
                ></i>
              </div>
              <span
                class="font"
                :class="baseData.store.data.locked && 'warning'"
                >{{ t('锁住') }}</span
              >
            </div>
          </div>
        </a-dropdown>
        <a-dropdown class="MenuItem mr30" overlayClassName="dropMenu">
          <div @click.prevent>
            <div class="iconItem">
              <!-- 数据 -->
              <div class="icon">
                <i :class="activeGizmo.icon"></i>
              </div>
              <span class="font">{{ t('控制器') }}</span>
            </div>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="menuItem"
                v-for="gizmo in gizmos"
                @click="switchGizmoType(gizmo)"
                :key="gizmo.value"
              >
                <i :class="gizmo.icon" class="drop-icon"></i>
                <span>{{ t(gizmo.name) }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-dropdown class="MenuItem mr30" overlayClassName="dropMenu">
          <div @click.prevent>
            <div class="iconItem" @click="switchCamera(activeCamera)">
              <!-- 数据 -->
              <div class="icon">
                <i :class="activeCamera.icon"></i>
              </div>
              <span class="font">{{ t('相机') }}</span>
            </div>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="menuItem"
                v-for="camera in cameras"
                @click="switchCamera(camera)"
                :key="camera.value"
              >
                <i :class="camera.icon" class="drop-icon"></i>
                <span>{{ t(camera.name) }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- 右 -->
      <div>
        <a-dropdown class="MenuItem" overlayClassName="dropMenu">
          <div @click.prevent>
            <div class="iconItem">
              <div class="icon">
                <i class="t-icon t-yuyan"></i>
              </div>
              <span class="font">{{ t(localeDesc) }}</span>
            </div>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="menuItem"
                v-for="item in localeList"
                @click="onLocale(item.id)"
                :key="item.id"
              >
                <span>{{ item.text }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- <div class="flex">
        <template v-for="rightItem in menus.right">
          <MenuItem
            v-if="rightItem.action === 'share'"
            :active="shared"
            class="rightItem mr30 shared-menu"
            :menuItem="rightItem"
            @action="action"
            :key="rightItem.name"
          />
          <MenuItem
            v-else
            class="rightItem mr30"
            :class="{
              'shequ-menu': rightItem.name === '社区',
            }"
            :menuItem="rightItem"
            @action="action"
            :key="rightItem.icon"
          />
        </template>
        <a-dropdown class="MenuItem" overlayClassName="dropMenu">
          <div @click.prevent>
            <div class="iconItem">
              <div class="icon">
                <i class="t-icon t-yuyan"></i>
              </div>
              <span class="font">{{ t(localeDesc) }}</span>
            </div>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="menuItem"
                v-for="(item, index) in localeList"
                :key="index"
                @click="onLocale(item.id)"
              >
                <span>{{ item.text }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onUnmounted,
  ref,
  inject,
  Ref,
} from 'vue';
import { useStore } from 'vuex';
import { localeList } from '@/store/i18n';

import { iconMenus, gizmos, cameras } from './defaults';
import axios from 'axios';
import MenuItem from './common/MenuItem.vue';
import { Topology3D } from '@topology3D';
import { BaseData, isGLBFile, isJSONFile } from './utils';
import { t } from '@/i18n/i18n';

declare const topology3d: Topology3D;
declare const window: any;
declare const JSZip: any;

export default defineComponent({
  name: 'TopologyMenu',
  components: {
    MenuItem,
  },
  setup: () => {
    const store = useStore();
    const actions: any = {};
    const baseData = inject<Ref<BaseData>>('baseData');

    const onLocale = (id: string) => {
      store.commit('locale', id);
    };

    // 菜单项点击事件
    const action = (action: string, params?: any) => {
      if (!action) {
        return;
      }

      if (actions[action]) {
        // 调用当前定义的函数
        actions[action](params);
      } else {
        console.log('暂无该方法！');
      }
    };

    actions.newFile = () => {
      topology3d.open();
    };

    actions.open = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (event) => {
        const elem: any = event.target;
        if (elem.files && elem.files[0]) {
          const file = elem.files[0];
          if (isJSONFile(file)) {
            topology3d.open(file);
          }
        }
      };
      input.click();
    };

    actions.load = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (event) => {
        const elem: any = event.target;
        if (elem.files && elem.files[0]) {
          const file = elem.files[0];
          console.log(file);
          if (isGLBFile(file)) {
            topology3d.loadMesh({ file });
          }
        }
      };
      input.click();
    };

    actions.downloadJson = () => {
      topology3d.download();
    };

    actions.copy = () => {
      const meshes = topology3d.getSelectedMeshes();
      topology3d.copyMesh(meshes);
    };

    actions.paste = () => {
      topology3d.pasteMesh();
    };

    actions.undo = () => {
      topology3d.undo();
    };

    actions.redo = () => {
      topology3d.redo();
    };

    actions.openExampleCity = () => {
      topology3d.showLoading(t('正在加载场景文件，请稍候......'));
      axios.get('/json/city.json').then(async (json) => {
        await topology3d.openJSON(json);
      }).finally(() => topology3d.hideLoading());
    };

    actions.openExampleRoom = () => {
      topology3d.showLoading(t('正在加载场景文件，请稍候......'));
      axios.get('/json/room.json').then(async (json) => {
        await topology3d.openJSON(json);
      }).finally(() => topology3d.hideLoading());
    };

    function onLock() {
      const _locked = topology3d.getLocked() === 0 ? 1 : 0;
      baseData.value.store.data.locked = _locked;
      topology3d.lock(_locked);
    }

    const activeGizmo = ref(gizmos[0]);
    const switchGizmoType = (gizmo) => {
      topology3d.switchGizmoType(gizmo.value);
      activeGizmo.value = gizmo;
    };

    const activeCamera = ref(cameras[0]);
    const switchCamera = (camera) => {
      topology3d.switchCamera(camera.value);
      activeCamera.value = camera;
    };

    const onCombine = () => {
      const meshes = topology3d.getSelectedMeshes();
      const { parent } = topology3d.combine(meshes);
      if (parent) {
        topology3d.selectMesh(parent);
      }
    };
    const onUncombine = () => {
      const meshes = topology3d.getSelectedMeshes();
      const result = topology3d.uncombine(meshes);
      if (result.length) {
        topology3d.selectMesh(
          result.reduce((arr, item) => [...arr, ...item.children], [])
        );
      }
    };

    return {
      onLocale,
      locale: computed(() => store.state.locale),
      localeDesc: computed(() => store.getters.localeDesc),
      localeList,
      menus: iconMenus,
      action,
      baseData,
      onLock,
      gizmos,
      activeGizmo,
      switchGizmoType,
      cameras,
      activeCamera,
      switchCamera,
      onCombine,
      onUncombine,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

@media screen and (max-width: 1280px) {
  .TopologyMenu {
    // 隐藏部分元素

    .shared-menu,
    .shequ-menu {
      display: none;
    }
  }
}

.drop-icon {
  font-size: 16px;
  margin-right: 10px;
}

.TopologyMenu {
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px #dad7d7;
  align-items: center;

  .mr30 {
    margin-right: 30px;
  }

  .menus {
    flex-grow: 1;
    // TODO: 50 可能需要调小点
    padding: 0 50px;
    justify-content: space-between;
    align-items: center;
  }

  .userArea {
    margin-right: 26px;
  }

  .loginArea {
    margin-right: 26px;

    > :first-child {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      color: #474e59;
      line-height: 20px;
      margin-right: 21px;
    }

    button {
      width: 80px;
      height: 30px;
      background: #437be7;
      border-radius: 2px;
      border: none;

      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: center;
      color: #ffffff;
      line-height: 20px;

      cursor: pointer;
    }
  }
}

:deep(.ant-dropdown-menu-item) {
  border-top: 2px solid transparent;
}

:deep(.border-top) {
  border-top: 2px solid $color-primary;
}
</style>
