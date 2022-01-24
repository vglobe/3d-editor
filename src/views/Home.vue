<template>
  <div class="Home">
    <Topology />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Topology from '@/components/Topology.vue';

declare const Stats: any;
declare const topology3d: any;

export default defineComponent({
  name: 'Home',
  components: {
    Topology,
  },
  setup: () => {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.Home {
  height: 100vh;

  .buttons {
    position: fixed;
    top: 60px;
    right: 240px;
    z-index: 10;

    display: flex;
    flex-direction: column;
  }
}
</style>
