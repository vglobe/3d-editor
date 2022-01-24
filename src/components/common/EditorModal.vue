<template>
  <a-modal
    forceRender
    :visible="visible"
    :title="title"
    width="900px"
    @ok="handleOk"
    @cancel="cancel"
    wrapClassName="editorModal"
  >
    <div ref="monacoDom" class="monaco"></div>
  </a-modal>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
  watch,
} from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
import 'monaco-editor/esm/vs/editor/editor.all.js';

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

export default defineComponent({
  name: 'EditorModal',
  props: {
    visible: {
      type: Boolean,
      require: true,
    },
    title: {
      type: String,
      default: () => {
        return 'JavaScript';
      },
    },
    code: {
      type: String,
      default: () => {
        return '';
      },
    },
    language: {
      type: String,
      default: () => {
        return 'javascript';
      },
      validator: (value: string) => {
        // 这个值必须匹配下列字符串中的一个
        return ['javascript', 'json', 'markdown'].includes(value);
      },
    },
  },
  emits: ['update:visible', 'changeCode'],
  setup(props, { emit }) {
    function handleOk() {
      // 按下确认以后修改外界值
      const code = editor.getValue();
      emit('changeCode', code);
      emit('update:visible', false);
    }

    function cancel() {
      emit('update:visible', false);
    }

    const curTheme = 'vs-dark'; // 暗主题
    const monacoDom = ref(null);

    let editor = null;
    nextTick(() => {
      editor = monaco.editor.create(monacoDom.value, {
        theme: curTheme,
        automaticLayout: true,
        language: props.language,
      });
    });

    watch(
      () => props.visible,
      (newV) => {
        if (newV) {
          // 可见状态
          editor.setValue(props.code);
          monaco.editor.setModelLanguage(editor.getModel(), props.language);
        }
      }
    );

    onUnmounted(() => {
      editor.dispose();
    });

    return { handleOk, monacoDom, cancel };
  },
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.editorModal {
  .ant-modal-body {
    padding: 0;
    .monaco {
      height: 400px;
    }
  }
}
</style>
