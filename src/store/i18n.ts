import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';
import { locale } from '@/i18n/i18n';
import { setCookie } from '@/services/cookie';

export const localeList = [
  {
    id: 'zh',
    text: '中文'
  },
  {
    id: 'en',
    text: 'English'
  }
];

const i18n = {
  state: () => ({}),
  mutations: {
    locale(state: any, payload: any) {
      locale.value = payload;
      setCookie('i18n', payload, {
        domain: document.domain
          .split('.')
          .slice(-2)
          .join('.')
      });
      localStorage.i18n = payload;
      moment.locale(payload);
    }
  },
  getters: {
    locale() {
      return locale.value;
    },

    antdvLocale() {
      return locale.value === 'zh' ? zhCN : enUS;
    },

    localeDesc() {
      const ret = localeList.find((item: any) => item.id === locale.value);
      if (ret) {
        return ret.text;
      }

      return '';
    }
  }
};

export default i18n;
