import { Tools } from 'babylonjs';

export interface Topology3dData {
  locked?: number;
  websocket?: string;
  mqtt?: string;
  mqttOptions?: {
    clientId?: string;
    username?: string;
    password?: string;
    customClientId?: boolean;
  };
  mqttTopics?: string;
  background?: string;
  socketCbJs?: string;
  socketCbFn?: string;
  initJs?: string;
}

export interface Options {
  filename?: string;
  decalSizeX?: number;
  decalSizeY?: number;
  decalSizeZ?: number;
  /**
   * decalImage: url or base64
   */
  decalImage?: string;
  decalZOffset?: number;
}

const defaultData: Topology3dData = {
  locked: 0
};

const defaultOptions: Options = {
  filename: 'le5le-topology3d',
  decalSizeX: 1,
  decalSizeY: 1,
  decalSizeZ: 1,
  decalImage: '/img/sight.png',
  decalZOffset: -2
};

export interface Topology3dStore {
  id?: string;
  data: Topology3dData,
  option: Options
}

export const globalStore: { [id: string]: Topology3dStore } = {};

export const createStore = (id = Tools.RandomId()): Topology3dStore => {
  return {
    id,
    data: { ...defaultData },
    option: { ...defaultOptions },
  };
};

export const clearStore = (store: Topology3dStore) => {
  store.data = { ...defaultData };
};

// Return a data store, if not exists will create a store.
export const useStore = (id = 'default') => {
  if (!globalStore[id]) {
    globalStore[id] = createStore(id);
  }

  return globalStore[id];
};