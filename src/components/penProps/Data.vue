<template>
  <div class="PenData" v-if="meshData">
    <FormItem
      class="idFormItem"
      :value="meshData.id"
      :form-item="{
        key: 'id',
        type: 'text',
        name: `Id`,
      }"
      @update:value="changeName($event)"
    />
    <a-collapse
      v-model:activeKey="activeKeys"
      expand-icon-position="right"
      class="PenProps"
      :bordered="false"
    >
      <a-collapse-panel key="tags" :header="`${t('标签')}`">
        <div class="tags">
          <a-tag
            v-for="(tag, index) in meshData.tags"
            closable
            @close="onDelTag(index)"
            :key="index"
          >
            {{ tag }}
          </a-tag>
        </div>

        <a-input
          :placeholder="t('按回车添加')"
          v-model:value="tag"
          @pressEnter="onAddTag"
        />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  Ref,
  ref,
} from 'vue';
import FormEvery from '../common/FormEvery.vue';
import FormItem from '../common/FormItem.vue';
import { Topology3D } from '@topology3D';
import { AbstractMesh } from 'babylonjs';
import { MeshData } from '../utils';

export default defineComponent({
  name: 'PenData',
  components: { FormEvery, FormItem },
  setup() {
    const activeKeys = ref(['tags']);
    const tag = ref('');
    const editMesh = inject<Ref<AbstractMesh>>('editMesh');
    const meshData = inject<Ref<MeshData>>('meshData');

    const changeName = (newId: string) => {
      meshData.value.id = newId;
      editMesh.value.id = newId;
    };
    const onAddTag = () => {
      if (!tag.value) {
        return;
      }
      const newTag = tag.value.replace(' ', '');
      meshData.value.tags.push(newTag);
      Topology3D.AddTagsTo(editMesh.value, [newTag]);
      tag.value = '';
    };
    const onDelTag = (index: number) => {
      const tag = meshData.value.tags[index];
      Topology3D.RemoveTagsFrom(editMesh.value, [tag]);
      meshData.value.tags.splice(index, 1);
    };

    return {
      meshData,
      activeKeys,
      tag,
      changeName,
      onAddTag,
      onDelTag,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.PenData {
  .idFormItem {
    padding: 8px 12px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin: 8px 0;
    .ant-tag {
      margin-top: 8px;
    }
  }

  .topButton {
    width: 100%;
  }

  .singleOption {
    margin-top: 5px;
    position: relative;
    background-color: #edeef0;
    border-radius: 6px;
    padding: 5px;
    padding-top: 20px;
    .oneKey {
      display: flex;
      margin-top: 5px;
      margin-bottom: 5px;
      justify-content: space-around;

      .key {
        width: 90px;
      }
      .value {
        width: 90px;
      }
    }

    .buttons {
      display: flex;
      align-items: center;
      height: 50px;
      justify-content: space-around;
    }

    .delIcon {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
}
</style>
