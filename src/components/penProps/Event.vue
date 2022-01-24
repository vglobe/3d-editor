<template v-if="meshData">
  <div class="buttonDiv">
    <a-button @click="onAddEvent" class="btn full" type="primary" size="small">
      {{ t('添加事件') }}
    </a-button>
  </div>
  <div class="content mt4" v-for="(event, i) in meshData.events" :key="i">
    <div class="title hover" @click="onCollapseEvent(i)">
      {{ t('事件') + (i + 1) }}
      <span>
        <i class="t-icon t-delete mr8" @click.stop="onRemoveEvent(i)"></i>
        <i v-if="!collapseEvent[i]" class="t-icon t-angle-down"></i>
        <i v-else class="t-icon t-angle-top"></i>
      </span>
    </div>
    <div v-if="collapseEvent[i]">
      <FormEvery
        :configs="MeshEventProps"
        :obj="event"
        @change-value="onUpdateEvent"
      />
      <FormEvery
        v-if="event.action === MeshEventAction.Link"
        :configs="LinkConfigs"
        :obj="event"
        @change-value="onUpdateEvent"
      />
      <FormEvery
        v-if="event.action === MeshEventAction.BeginAnimation"
        :configs="BeginAnimationConfigs"
        :obj="event"
        @change-value="onUpdateEvent"
      />
      <FormEvery
        v-if="event.action === MeshEventAction.PauseAnimation"
        :configs="PauseAnimationConfigs"
        :obj="event"
        @change-value="onUpdateEvent"
      />
      <FormEvery
        v-if="event.action === MeshEventAction.RestartAnimation"
        :configs="RestartAnimationConfigs"
        :obj="event"
        @change-value="onUpdateEvent"
      />
      <FormEvery
        v-if="event.action === MeshEventAction.StopAnimation"
        :configs="StopAnimationConfigs"
        :obj="event"
        @change-value="onUpdateEvent"
      />
    </div>
    <a-divider />
  </div>
</template>

<script lang="ts">
import { t } from '@/i18n/i18n';
import {
  MeshEventTrigger,
  MeshEventAction,
  Topology3D,
} from '@topology3D';
import { AbstractMesh } from 'babylonjs';
import { defineComponent, inject, Ref, ref } from 'vue';
import FormEvery from '../common/FormEvery.vue';
import {
  MeshEventProps,
  LinkConfigs,
  BeginAnimationConfigs,
  PauseAnimationConfigs,
  RestartAnimationConfigs,
  StopAnimationConfigs,
} from '../defaults';
import { MeshData } from '../utils';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'PenEvents',
  components: {
    FormEvery,
  },
  setup() {
    const editMesh = inject<Ref<AbstractMesh>>('editMesh');
    const meshData = inject<Ref<MeshData>>('meshData');
    const collapseEvent = ref({});

    const onCollapseEvent = (index: number) => {
      collapseEvent.value[index] = !collapseEvent.value[index];
    };
    const onAddEvent = () => {
      const len = meshData.value.events.push({
        trigger: MeshEventTrigger.MouseDown,
        action: MeshEventAction.Link,
        params: {
          url: '',
          blank: true,
        },
      });
      collapseEvent.value[len - 1] = true;
      onUpdateEvent();
    };
    const onRemoveEvent = (index: number) => {
      meshData.value.events.splice(index, 1);
      collapseEvent[index] = false;
      onUpdateEvent();
    };
    const onChangeEvent = ({ value, keys }, index: number) => {};
    const onUpdateEvent = () => {
      editMesh.value.metadata.events = meshData.value.events;
    };

    return {
      meshData,
      collapseEvent,
      onCollapseEvent,
      onAddEvent,
      onRemoveEvent,
      onChangeEvent,
      onUpdateEvent,
      MeshEventProps,
      LinkConfigs,
      BeginAnimationConfigs,
      PauseAnimationConfigs,
      RestartAnimationConfigs,
      StopAnimationConfigs,
      MeshEventAction,
    };
  },
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';
.buttonDiv {
  padding: 12px;
  .add-button {
    width: 100%;
  }
}
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

.content {
  padding-left: 12px;
  padding-right: 12px;
}

.ant-divider {
  margin: 12px 0;
}
</style>
