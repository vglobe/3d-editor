import { createStore } from 'vuex';

import i18n from './i18n';
import user from './user';

const store = createStore({
  modules: {
    i18n,
    user
  },
  state: () => ({}),
  mutations: {}
});

export default store;
