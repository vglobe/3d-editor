declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// error TS2304: Cannot find name 'XMLHttpRequestBodyInit'
declare interface XMLHttpRequestBodyInit {}
