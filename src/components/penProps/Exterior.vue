<template>
  <a-collapse
    v-if="meshData"
    v-model:activeKey="activeKey"
    expand-icon-position="right"
    class="PenProps"
    :bordered="false"
  >
    <a-collapse-panel key="布局" :header="t('布局')">
      <FormEvery
        :configs="SizeConfigs"
        :obj="meshData"
        @change-value="onChangeValue"
        @enter-value="onEnterValue"
      />
    </a-collapse-panel>
    <a-collapse-panel key="材质" :header="t('材质')">
      <div v-if="!meshData.material">
        <a-button
          @click="onAddMaterial"
          class="btn full"
          type="primary"
          size="small"
        >
          {{ t('创建标准材质') }}
        </a-button>
      </div>
      <FormEvery
        v-if="meshData.material"
        :configs="StandardMaterialProps"
        :obj="meshData.material"
        @change-value="onChangeMaterial"
      />
      <a-row :gutter="16" v-if="meshData.material">
        <a-col class="gutter-row" :span="16">
          <div class="gutter-box">
            <a-button
              @click="onRemoveMaterial"
              class="btn full"
              type="primary"
              size="small"
            >
              {{ t('更换') }}
            </a-button>
          </div>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <div class="gutter-box">
            <a-button
              @click="onRemoveMaterial"
              class="btn full"
              type="danger"
              size="small"
            >
              {{ t('删除') }}
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import { t } from '@/i18n/i18n';
import { defineComponent, inject, Ref, ref } from 'vue';
import FormEvery from '../common/FormEvery.vue';
import {
  Topology3D,
  MaterialType,
  getRotationFromAngle,
} from '@topology3D';
import { AbstractMesh, StandardMaterial } from 'babylonjs';
import { getMaterialProps, MeshData } from '../utils';
import { SizeConfigs, StandardMaterialProps } from '../defaults';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'PenExterior',
  components: {
    FormEvery,
  },
  setup() {
    const activeKey = ref(['布局', '材质', '设置']);
    const editMesh = inject<Ref<AbstractMesh>>('editMesh');
    const meshData = inject<Ref<MeshData>>('meshData');

    /** 布局 */
    const onChangeValue = ({ value, keys }: { value: any; keys: string[] }) => {
      const [key1, key2] = keys;
      if (key2) {
        meshData.value[key1][key2] = value;
        if (key1 === 'size') {
          const scaling = topology3d.getScalingFromSize(
            meshData.value.size,
            editMesh.value
          );
          meshData.value.scaling = scaling;
        } else if (key1 === 'scaling') {
          const size = topology3d.getSizeFromScaling(
            editMesh.value,
            meshData.value.scaling
          );
          meshData.value.size = size;
        }
      } else {
        meshData.value[key1] = value;
      }
    };
    const onEnterValue = ({ value, keys }: { value: any; keys: string[] }) => {
      const [property, axis] = keys;
      if (property === 'rotation') {
        const rotation = getRotationFromAngle(meshData.value.rotation);
        topology3d.updateProps({
          target: editMesh.value,
          update: {
            [`rotation.${axis}`]: rotation[axis],
          },
        });
      } else if (property === 'size') {
        const scaling = topology3d.getScalingFromSize(
          meshData.value.size,
          editMesh.value
        );
        topology3d.updateProps({
          target: editMesh.value,
          update: {
            [`scaling.${axis}`]: scaling[axis],
          },
        });
      } else if (property === 'scaling') {
        topology3d.updateProps({
          target: editMesh.value,
          update: {
            [`scaling.${axis}`]: value,
          },
        });
      } else {
        topology3d.updateProps({
          target: editMesh.value,
          update: {
            [`position.${axis}`]: value,
          },
        });
      }
    };

    /** 材质 */
    const onAddMaterial = () => {
      const material = topology3d.addMaterial(
        editMesh.value,
        MaterialType.Standard
      ) as StandardMaterial;
      meshData.value.material = getMaterialProps(material);
    };
    const onRemoveMaterial = () => {
      topology3d.removeMaterial(editMesh.value);
      meshData.value.material = null;
    };
    const onChangeMaterial = ({ value, keys }) => {
      const key = keys[1] ? keys.join('.') : keys[0];
      if (
        key === 'emissiveColor' ||
        key === 'diffuseColor' ||
        key === 'specularColor' ||
        key === 'ambientColor'
      ) {
        const preColor = editMesh.value.material[key];
        const color = Topology3D.StringToColor3(value);
        if (!preColor.equals(color)) {
          topology3d.updateProps({
            target: editMesh.value,
            update: {
              [`material.${key}`]: color,
            },
          });
        }
      }
      meshData.value.material[key] = value;
    };

    return {
      activeKey,
      meshData,
      SizeConfigs,
      onChangeValue,
      onEnterValue,
      onAddMaterial,
      onRemoveMaterial,
      onChangeMaterial,
      StandardMaterialProps,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.collapseTitle {
  i {
    margin-left: 4px;
    font-weight: 500;
  }
}
</style>
