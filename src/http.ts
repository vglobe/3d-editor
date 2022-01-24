import { message } from 'ant-design-vue';
import axios from 'axios';
import router from '@/router/index';

import { t } from '@/i18n/i18n';
import { getCookie } from './services/cookie';

// axios 配置
axios.defaults.timeout = 90000;
axios.defaults.withCredentials = false;

// http request 拦截器
axios.interceptors.request.use(
  (config: any) => {
    config.headers.Authorization = getCookie('token') || '';
    return config;
  },
  (err: any) => Promise.reject(err)
);

// http response 拦截器
axios.interceptors.response.use(
  (response: any) => {
    if (response && response.data && response.data.error) {
      message.error(response.data.error);
    }
    if (response) {
      return response.data;
    }
    return null;
  },
  (error: any) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          break;
        case 403:
          router.go(-1);
          break;
        case 404:
          message.error(t('访问数据不存在，请检查后重试！'));
          break;
        case 500:
          message.error(t('请求服务错误，请稍后重试'));
          break;
        case 504:
          message.error(t('网络超时，请检测你的网络'));
          break;
        default:
          message.error(t('未知网络错误'));
          break;
      }
    }

    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default axios;
