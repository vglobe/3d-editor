<template>
  <a-config-provider :locale="antdvLocale">
    <router-view />
  </a-config-provider>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore();

    store.dispatch('user/profile');

    return {
      antdvLocale: computed(() => store.getters.antdvLocale),
      user: computed(() => store.state.user.profile)
    };
  }
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
