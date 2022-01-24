<template>
  <div>
    <template v-for="config in configs" :key="config.key">
      <FormItem
        v-if="config.key2"
        v-model:value="obj[config.key][config.key2]"
        :formItem="config"
        @imageVisible="showImage"
        @iconVisible="showIcon"
        @monacoVisible="showMonaco"
        @update:value="updateValue($event, [config.key, config.key2])"
        @enter:value="
          enterValue(obj[config.key][config.key2], [config.key, config.key2])
        "
      />
      <FormItem
        v-else
        v-model:value="obj[config.key]"
        :formItem="config"
        @imageVisible="showImage"
        @iconVisible="showIcon"
        @monacoVisible="showMonaco"
        @update:value="updateValue($event, [config.key, config.key2])"
        @enter:value="enterValue(obj[config.key], [config.key, config.key2])"
      />
    </template>

    <ImageDrawer
      v-if="existImage"
      v-model:visible="imageVisible"
      @chooseImage="chooseImage"
    />
    <IconDrawer
      v-if="existIcon"
      v-model:visible="iconVisible"
      @chooseIcon="chooseIcon"
    />

    <EditorModal
      v-if="existEditor"
      v-model:visible="monacoVisible"
      :code="currentCode"
      :title="currentConfig.title"
      :language="currentConfig.language"
      @changeCode="changeCode"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import FormItem, { FormItemType } from '../common/FormItem.vue';
import ImageDrawer from '../common/ImageDrawer.vue';
import IconDrawer from '../common/IconDrawer.vue';
import EditorModal from '../common/EditorModal.vue';

export default defineComponent({
  name: 'FormEvery',
  components: {
    FormItem,
    ImageDrawer,
    IconDrawer,
    EditorModal,
  },
  props: {
    configs: Array as PropType<FormItemType[]>,
    obj: Object,
  },
  // 该 emit 向父组件发一个消息，表明某个值已经修改
  emits: ['changeValue', 'enterValue'],
  setup(props, { emit }) {
    const imageVisible = ref(false);

    let currentKey = ''; // 当前若选择 image/icon 类型的 key 打开 图片选择面板
    let currentKey2 = ''; // key2 存在时使用
    function showImage(keys?: string[]) {
      imageVisible.value = true;
      currentKey = keys[0];
      currentKey2 = keys[1];
    }

    function chooseImage(image: string) {
      if (currentKey2) {
        props.obj[currentKey][currentKey2] = image;
      } else if (currentKey) {
        props.obj[currentKey] = image;
      }
      updateValue(image, [currentKey, currentKey2]);
    }

    const iconVisible = ref(false);
    function showIcon(keys?: string[]) {
      iconVisible.value = true;
      currentKey = keys[0];
      currentKey2 = keys[1];
    }

    function chooseIcon(item: any) {
      if (currentKey2) {
        props.obj[currentKey][currentKey2] = item.data.icon;
      } else if (currentKey) {
        props.obj[currentKey] = item.data.icon;
      }
      // iconFamily 也传出
      updateValue(item.data, [currentKey, currentKey2]);
      // TODO: 更改该值用以显示图标
      props.configs.find((item) => item.key === currentKey).iconFamily =
        item.data.iconFamily;
    }

    const monacoVisible = ref(false);
    let currentConfig = ref<FormItemType | any>({});
    const currentCode = ref('');
    function showMonaco(keys?: string[]) {
      currentKey = keys[0];
      currentKey2 = keys[1];
      if (currentKey2) {
        currentCode.value = props.obj[currentKey][currentKey2];
      } else if (currentKey) {
        currentCode.value = props.obj[currentKey];
      }

      currentConfig.value =
        props.configs.find((config) => config.key === currentKey) ?? {};
      monacoVisible.value = true;
    }

    function changeCode(code: string) {
      if (currentKey2) {
        props.obj[currentKey][currentKey2] = code;
      } else if (currentKey) {
        props.obj[currentKey] = code;
      }
      updateValue(code, [currentKey, currentKey2]);
    }

    function updateValue(value: any, keys: string[]) {
      emit('changeValue', { value, keys });
    }

    function enterValue(value: any, keys: string[]) {
      emit('enterValue', { value, keys });
    }

    // 减少 ImageDrawer IconDrawer EditorModal 等渲染
    const existImage = computed(() => {
      return props.configs.some((config) => config.type === 'image');
    });
    const existIcon = computed(() => {
      return props.configs.some((config) => config.type === 'icon');
    });
    const existEditor = computed(() => {
      return props.configs.some((config) => config.type === 'code');
    });

    return {
      imageVisible,
      showImage,
      chooseImage,
      showIcon,
      iconVisible,
      chooseIcon,
      monacoVisible,
      showMonaco,
      currentKey,
      currentConfig,
      changeCode,
      currentCode,
      updateValue,
      enterValue,
      existImage,
      existIcon,
      existEditor,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
</style>
