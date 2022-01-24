<template>
  <a-form-item
    class="FormItem"
    :labelCol="{ span: 10 }"
    :wrapperCol="{ span: 14 }"
    labelAlign="left"
    :colon="false"
  >
    <template #label>
      <span class="label"
        >{{ t(formItem.name) }}
        <a-tooltip v-if="formItem.tips">
          <template #title> <span v-html="formItem.tips"></span></template>
          <i class="t-icon t-help-circle"></i>
        </a-tooltip>
      </span>
    </template>
    <a-input
      v-if="formItem.type === 'text'"
      :placeholder="formItem.placeholder"
      :value="value"
      @change="onChanged($event.target.value)"
      @blur="onBlur"
      @keypress.enter="onEnter"
    />
    <a-input-number
      v-if="formItem.type === 'number'"
      :value="value"
      :placeholder="t(formItem.placeholder)"
      :min="formItem.min"
      :max="formItem.max"
      @change="onChanged"
      @blur="onBlur"
      @pressEnter="onEnter"
    />
    <a-textarea
      v-if="formItem.type === 'textarea'"
      :value="value"
      :placeholder="formItem.placeholder"
      @change="onChanged($event.target.value)"
      :rows="formItem.rows"
    />
    <a-select
      class="line"
      v-if="formItem.type == 'select'"
      :value="value"
      :placeholder="formItem.placeholder"
      @change="onChanged"
    >
      <a-select-option
        v-for="(option, i) in formItem.options"
        :value="option.value"
        :key="i"
      >
        <div v-html="option.label" class="option"></div> </a-select-option
    ></a-select>
    <a-switch
      v-if="formItem.type == 'switch'"
      :checked="value"
      @change="onChanged"
    />
    <div v-if="formItem.type == 'image'" @click="showImageDrawer">
      <!-- 值不存在，选图片按钮 -->
      <FormOutlined v-if="!value" />

      <!-- 值存在，展示该 img -->
      <template v-else>
        <img :src="value" style="max-width: 50px; max-height: 50px" />
        <i
          class="t-icon t-close"
          @click.stop="onChanged('')"
          :title="t('清除背景图片')"
        ></i>
      </template>
    </div>
    <div v-if="formItem.type == 'icon'" @click="showIconDrawer">
      <template v-if="value">
        <i
          v-if="value"
          class="t-icon"
          :style="{
            fontSize: '16px',
            fontFamily: formItem.iconFamily + '!important',
          }"
        >
          {{ value }}
        </i>
        <i
          v-if="value"
          class="t-icon t-delete ml8"
          @click.stop="onChanged('')"
        ></i>
      </template>
      <FormOutlined v-else />
    </div>
    <template v-if="formItem.type == 'code'">
      <a-textarea
        :value="value"
        @change="onChanged($event.target.value)"
        :placeholder="formItem.placeholder"
        :rows="formItem.rows"
      />
      <a-button @click="showMonaco" type="primary">
        {{ t('新窗口编辑') }}
      </a-button>
    </template>
    <!-- TODO: hex 无法使用 -->
    <el-color-picker
      v-if="formItem.type === 'color'"
      :model-value="value"
      size="mini"
      @active-change="onColorChanged"
      show-alpha
      :predefine="predefineColors"
    />
    <a-slider
      v-if="formItem.type == 'slider'"
      :value="value"
      @change="onChanged"
      :min="formItem.min"
      :max="formItem.max"
    />
  </a-form-item>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';

import { FormOutlined } from '@ant-design/icons-vue';
import { debounce } from 'debounce';

export interface FormItemType {
  key: string; // 唯一标识，目前只用来传到外部
  key2?: string; // 有些属性存在嵌套
  name: string; // 标题
  tips?: string; // 提示
  placeholder?: string; // input placeholder
  type:
    | 'text'
    | 'number'
    | 'color'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'code'
    | 'image'
    | 'icon'
    | 'code'
    | 'slider';
  options?: {
    // 选项
    label: string; // 选项的标题，可以使用 html
    value: any; // 选项的值
  }[];
  min?: number; // 最小值
  max?: number; // 最大值
  rows?: number; // textarea 所需要的行数
  iconFamily?: string; // icon 类型节点需要
  title?: string; // code 类型编辑器需要
  language?: 'javascript' | 'json' | 'markdown'; // code 编辑器需要
}

export default defineComponent({
  name: 'FormItem',
  components: {
    FormOutlined,
  },
  props: ['formItem', 'value'],
  emits: [
    'update:value',
    'enter:value',
    'imageVisible',
    'iconVisible',
    'monacoVisible',
  ],
  setup(props, { emit }) {
    function onChanged(value) {
      emit('update:value', value);
    }

    function onBlur() {
      emit('enter:value');
    }

    function onEnter() {
      emit('enter:value');
    }

    const onColorChanged = debounce((value) => onChanged(value), 200);

    function showImageDrawer() {
      emit('imageVisible', [props.formItem.key, props.formItem.key2]);
    }

    function showIconDrawer() {
      emit('iconVisible', [props.formItem.key, props.formItem.key2]);
    }

    function showMonaco() {
      emit('monacoVisible', [props.formItem.key, props.formItem.key2]);
    }

    // 预置颜色
    const predefineColors = [
      '#ff4500',
      '#ff8c00',
      '#ffd700',
      '#90ee90',
      '#00ced1',
      '#1e90ff',
      '#c71585',
      'rgba(255, 69, 0, 0.68)',
      'rgb(255, 120, 0)',
      'hsv(51, 100, 98)',
      'hsva(120, 40, 94, 0.5)',
      'hsl(181, 100%, 37%)',
      'hsla(209, 100%, 56%, 0.73)',
      '#c7158577',
    ];

    return {
      onChanged,
      onBlur,
      onEnter,
      onColorChanged,
      showImageDrawer,
      showIconDrawer,
      showMonaco,
      predefineColors,
      debounce,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.FormItem {
  margin-bottom: 0;
  margin: 4px 0;
  .label {
    font-size: 12px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    color: #7f838c;
    line-height: 18px;
    letter-spacing: 0px;
  }

  .option {
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>

<style lang="scss">
.FormItem {
  &.ant-row.ant-form-item {
    .ant-form-item-label {
      padding-top: 0 !important;
    }

    .ant-input-number,
    .ant-input,
    .ant-select-selector {
      font-size: 12px;
      width: 100%;
      border: 1px solid transparent;
      box-shadow: none;

      &:hover {
        border: 1px solid #1890ff;
      }
    }

    .ant-slider {
      min-width: inherit;
      margin-right: 15px;
    }
  }
}
</style>