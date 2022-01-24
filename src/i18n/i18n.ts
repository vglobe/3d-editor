
import { ref } from 'vue';

import zh from './langs/zh';
import en from './langs/en';
import { getCookie } from '@/services/cookie';

const messages: any = {
  en,
  zh
};

export const locale = ref<string>(getCookie('i18n') || localStorage.i18n || 'zh');

export const t = (key: string) => {
  if (!messages[locale.value]) {
    return key;
  }

  return messages[locale.value][key] || key;
};

export default {
  install: (app: any) => {
    app.config.globalProperties.t = t;
  }
};
