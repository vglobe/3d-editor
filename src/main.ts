import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';

import App from './App.vue';
import router from './router/index';
import store from './store';

import i18n from './i18n/i18n';
import format from '@/services/format';

import '@/styles/index.scss';

import '@/http';

const app = createApp(App);
app.use(i18n);
app.use(format);
app.use(router);
app.use(store);
app.use(Antd);
app.mount('#app');
