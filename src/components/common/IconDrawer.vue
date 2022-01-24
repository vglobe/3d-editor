<template>
  <a-drawer
    :title="t('选择字体图标')"
    placement="right"
    :closable="false"
    :visible="visible"
    wrapClassName="IconDrawer"
    @close="close"
  >
    <div class="icons">
      <i
        v-for="(item, index) in icons"
        class="icon"
        :class="item.icon"
        @click="onSelected(item)"
      ></i>
    </div>
  </a-drawer>
</template>
<script lang="ts">
import axios from 'axios';
import { t } from '@/i18n/i18n';
import { getCookie } from '@/services/cookie';
import { addImageUrl } from '@/services/file';
import { message } from 'ant-design-vue';
import { computed, defineComponent, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { addIcons } from '../utils';
export default defineComponent({
  props: {
    visible: Boolean,
  },
  emits: ['chooseIcon', 'update:visible'],
  setup(props, { emit }) {
    function close() {
      emit('update:visible', false);
    }

    const store = useStore();
    const user = computed(() => store.state.user.profile);

    // 实际图标
    const iconUrls = ['http://at.alicdn.com/t/font_1331132_g7tv7fmj6c9.css'];
    const icons = reactive([]);

    iconUrls.forEach(async (url) => {
      const iconList: any = await addIcons(url.replace('.css', '.json'));
      icons.push(...iconList.list);
    });

    function onSelected(item: any) {
      emit('chooseIcon', item);
      close();
    }

    return {
      close,
      icons,
      onSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
.icons {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;

  .icon {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 32px;
  }
}
</style>

<style lang="scss">
.IconDrawer {
  .ant-drawer-body {
    padding: 0;
  }
}
</style>
