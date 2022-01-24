import axios from 'axios';
import router from '@/router/index';
import { setCookie } from '@/services/cookie';

const user = {
  namespaced: true,
  state: () => ({
    profile: null
  }),
  mutations: {
    profile(state: any, payload: any) {
      state.profile = payload;
      if (payload.token !== undefined && payload.token !== null) {
        setCookie('token', payload.token);
      }
    },

    logout(state: any) {
      state.profile = null;
      // TODO: 目前设置一个伪退出，即不退出页面
      // setCookie('token', '');
    }
  },
  actions: {
    async profile({ commit }: any) {
      /* const user = await axios.get('/api/user/profile');
      commit('profile', user); */
    }
  },
  getters: {}
};

export default user;
