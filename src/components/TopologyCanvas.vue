<template>
  <div class="TopologyCanvas">
    <div class="topology">
      <canvas id="topology"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Topology3D, testCloneMesh } from '@topology3D';
import { defineComponent, onMounted } from 'vue';

declare const Stats: any;
declare const topology3d: Topology3D;

export default defineComponent({
  name: 'Home',
  setup() {
    onMounted(() => {
      // var stats = new Stats();
      // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      // document.body.appendChild(stats.dom);
      // function animate() {
      //   stats.begin();
      //   // monitored code goes here
      //   stats.end();
      //   requestAnimationFrame(animate);
      // }
      // requestAnimationFrame(animate);
    });

    const add = (num: number) => {
      const meshes = topology3d.getSelectedMeshes();
      if (meshes[0]) {
        testCloneMesh(meshes[0], num);
      }
    };
    return {
      add,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.TopologyCanvas {
  & > .topology {
    position: relative;
    width: 100%;
    height: 100%;
    .Topology-test-tools {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  #topology {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
    overflow: hidden;
  }
}
</style>
