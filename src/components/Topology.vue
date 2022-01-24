<template>
  <div class="le5le-topology">
    <TopologyMenu v-if="!preview" class="menu" />
    <div class="editor">
      <TopologyMaterial v-if="!preview" class="material" />
      <TopologyCanvas class="canvas" />
      <TopologyProps v-if="!preview" class="props" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, provide, ref } from 'vue';
import TopologyMenu from './TopologyMenu.vue';
import TopologyMaterial from '../components/TopologyMaterial.vue';
import TopologyCanvas from '../components/TopologyCanvas.vue';
import TopologyProps from '../components/TopologyProps.vue';
import { MeshEventTrigger, Topology3D } from '@topology3D';
import { selectTreeNode } from './common/Tree.vue';
import {
  BaseData,
  executeCode,
  EditType,
  getMeshData,
  MeshData,
  transTreeData,
  initTopology3DData,
} from './utils';
import { AbstractMesh } from 'babylonjs';
import axios from 'axios';
import { t } from '@/i18n/i18n';

declare const topology3d: Topology3D;

export default defineComponent({
  name: 'Home',
  components: {
    TopologyMenu,
    TopologyMaterial,
    TopologyCanvas,
    TopologyProps,
  },
  props: {
    preview: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  setup() {
    // meshes的树型结构
    const meshTree = ref({ datas: [], selected: [], opened: [] });
    // 当前需要右侧需要展示的内容
    const editType = ref(EditType.Canvas);
    const baseData = ref<BaseData>(null);
    const meshData = ref<MeshData>(null);
    const editMesh = ref<AbstractMesh>(null);
    provide('meshTree', meshTree);
    provide('editType', editType);
    provide('baseData', baseData);
    provide('meshData', meshData);
    provide('editMesh', editMesh);

    const initState = () => {
      const data = initTopology3DData(topology3d);
      meshTree.value = data.meshTree;
      editType.value = data.editType;
      baseData.value = data.baseData;
      meshData.value = data.meshData;
      editMesh.value = data.editMesh;
    };

    onMounted(() => {
      const topology3d = new Topology3D('topology');
      initState();

      topology3d.showLoading(t('正在加载场景文件，请稍候......'));
      axios.get('/json/city.json').then(async (json) => {
        await topology3d.openJSON(json);
      }).finally(() => topology3d.hideLoading());

      topology3d.on('open', () => {
        console.log('open');
        initState();
      });

      /* 监听选中与否 */
      topology3d.on('selectMesh', ({ meshes }) => {
        const mesh = meshes[meshes.length - 1];
        if (mesh) {
          editType.value = EditType.Pen;
          editMesh.value = mesh;
          meshData.value = getMeshData(mesh, topology3d);
        } else {
          editType.value = EditType.Canvas;
        }
        meshTree.value.selected = meshes.map((mesh) => mesh.name);
        selectTreeNode(meshTree.value.datas, meshTree.value.selected);
      });

      /* 监听 Mesh移动 */
      topology3d.on('moveMesh', ({ meshes }) => {
        const mesh = meshes[0];
        meshData.value.position = {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
        };
      });

      /*监听 Mesh 的 旋转 */
      topology3d.on('rotateMesh', ({ meshes }) => {
        const mesh = meshes[0];
        // 设置旋转的参数
        meshData.value.rotation = topology3d.getRotateAngle(mesh);
      });

      /*监听 Mesh 的 缩放 */
      topology3d.on('scaleMesh', ({ meshes }) => {
        const mesh = meshes[0];
        meshData.value.size = topology3d.getSizeFromScaling(mesh);
        meshData.value.scaling = {
          x: mesh.scaling.x,
          y: mesh.scaling.y,
          z: mesh.scaling.z,
        };
      });

      topology3d.on('addMesh', () => {
        meshTree.value.datas = transTreeData(
          topology3d.getMeshTree(),
          meshTree.value.selected,
          meshTree.value.opened
        );
      });
      topology3d.on('loadMesh', async () => {
        setTimeout(() => {
          meshTree.value.datas = transTreeData(
            topology3d.getMeshTree(),
            meshTree.value.selected,
            meshTree.value.opened
          );
        }, 0);
      });

      topology3d.on('copyMesh', () => {
        meshTree.value.datas = transTreeData(
          topology3d.getMeshTree(),
          meshTree.value.selected,
          meshTree.value.opened
        );
      });

      topology3d.on('deleteMesh', () => {
        meshTree.value.datas = transTreeData(
          topology3d.getMeshTree(),
          meshTree.value.selected,
          meshTree.value.opened
        );
      });

      topology3d.on('mouseDownMesh', (mesh) => {
        if (!topology3d.getLocked()) {
          return;
        }
        mesh.metadata?.events
          .filter((event) => event.trigger === MeshEventTrigger.MouseDown)
          .forEach((event) => executeCode(event, mesh, topology3d));
      });

      topology3d.on('mouseUpMesh', (mesh) => {
        if (!topology3d.getLocked()) {
          return;
        }
        mesh.metadata?.events
          .filter((event) => event.trigger === MeshEventTrigger.MouseUp)
          .forEach((event) => executeCode(event, mesh, topology3d));
      });

      topology3d.on('mouseInMesh', (mesh) => {
        if (!topology3d.getLocked()) {
          return;
        }
        mesh.metadata?.events
          .filter((event) => event.trigger === MeshEventTrigger.MouseIn)
          .forEach((event) => executeCode(event, mesh, topology3d));
      });

      topology3d.on('mouseOutMesh', (mesh) => {
        if (!topology3d.getLocked()) {
          return;
        }
        mesh.metadata?.events
          .filter((event) => event.trigger === MeshEventTrigger.MouseOut)
          .forEach((event) => executeCode(event, mesh, topology3d));
      });

      topology3d.on('dblclickMesh', (mesh) => {
        if (!topology3d.getLocked()) {
          return;
        }
        mesh.metadata?.events
          .filter((event) => event.trigger === MeshEventTrigger.Dblclick)
          .forEach((event) => executeCode(event, mesh, topology3d));
      });
    });

    onUnmounted(() => {
      topology3d && topology3d.destroy();
    });
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.le5le-topology {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  text-align: left;

  .menu {
    position: sticky;
    top: 0px;
    height: 50px;
    background: #fff;
    z-index: 2;
    flex-shrink: 0;
  }

  & > .editor {
    flex-grow: 1;
    overflow: auto;
    display: flex;

    .material {
      width: 200px;
      height: 100%;
      outline: 1px solid #ddd;
    }

    & > * {
      flex-shrink: 0;
    }

    .canvas {
      flex-grow: 1;
    }

    .props {
      width: 240px;
      height: 100%;
      outline: 1px solid #ddd;
    }
  }
}
</style>