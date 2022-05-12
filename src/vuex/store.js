import ModuleCollection from "./module/module-collection";
import { forEach } from "./utils";

export let _Vue;

function installModule(store, rootState, path, module) {
  let namespace = store._modules.getNamespace(path);// 命名空间计算
  console.log(namespace, "======");
  if (path.length > 0) {
    // 子模块
    let parent = path.slice(0, -1).reduce((memo, curr) => {
      return memo[curr];
    }, rootState);
    _Vue.set(parent, path[path.length - 1], module.state);//保证新增的数据是响应式的
  }
  module.forEachMutation((mutation, type) => {
    // 不同的模块可能会有相同名称的mutation，用数组存储
    store._mutations[namespace + type] =
      store._mutations[namespace + type] || [];
    store._mutations[namespace + type].push((payload) => {
      mutation.call(store, module.state, payload);
    });
  });
  module.forEachAction((action, type) => {
    store._actions[namespace + type] = store._actions[namespace + type] || [];
    store._actions[namespace + type].push((payload) => {
      action.call(store, store, payload);
    });
  });
  module.forEachGetter((getter, type) => {
    // getters重名会覆盖
    store._wrappedGetters[namespace + type] = () => {
      return getter(module.state);
    };
  });
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });
}

function resetStoreVm(store, state) {
  const wrappedGetters = store._wrappedGetters;
  const computed = {};
  store.getters = {};
  let oldVm = store._vm;
  forEach(wrappedGetters, (fn, key) => {
    computed[key] = () => {
      return fn();
    };
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
    });
  });
  store._vm = new _Vue({
    data: {
      $$state: state,
    },
    computed,
  });
  if (oldVm) {
    // 如果有老的实例将老的销毁掉，动态注册会重复执行此方法
    _Vue.nextTick(() => {
      oldVm.$destroy();
    });
  }
}

export class Store {
  constructor(options) {
    // 将用户传入的模块格式化成树形结构，后续更好操作
    this._modules = new ModuleCollection(options);
    // console.log(this._modules, "========");
    let state = this._modules.root.state;
    this._mutations = {};
    this._actions = {};
    this._wrappedGetters = {};
    installModule(this, state, [], this._modules.root);
    resetStoreVm(this, state);
    // console.log(
    //   this._mutations,
    //   this._actions,
    //   this._wrappedGetters,
    //   state,
    //   "========"
    // );
    // this.getters = {};
    // const getters = options.getters;
    // const computed = {};
    // forEach(getters, (fn, key) => {
    //   computed[key] = () => {
    //     return fn(this.state);
    //   };
    //   Object.defineProperty(this.getters, key, {
    //     get: () => this._vm[key],
    //   });
    // });
    // this.state = options.state
    // this._vm = new _Vue({
    //   data() {
    //     return {
    //       $$state: options.state,
    //     };
    //   },
    //   computed,
    // });
    // mutations
    // this._mutations = {};
    // forEach(options.mutations, (fn, key) => {
    //   this._mutations[key] = (payload) => fn.call(this, this.state, payload);
    // });
    //actions
    // this._actions = {};
    // forEach(options.actions, (fn, key) => {
    //   this._actions[key] = (payload) => fn.call(this, this, payload);
    // });
  }
  commit = (type, payload) => {
    // this._mutations[type](payload);
    this._mutations[type].forEach((fn) => fn(payload));
  };
  dispatch = (type, payload) => {
    // this._actions[type](payload)
    this._actions[type].forEach((fn) => fn(payload));
  };
  get state() {
    return this._vm._data.$$state;
  }
  registerModule(path, rawModule) {
    if (typeof path === "string") path = [path];
    // 模块注册
    this._modules.register(path, rawModule);
    installModule(this, this.state, path, rawModule.newModule);
    resetStoreVm(this, this.state);//计算属性需要重新定义getters
  }
}

export const install = (Vue) => {
  _Vue = Vue;
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        this.$store = this.$options.store;
      } else {
        if (this.$parent && this.$parent.$store) {
          this.$store = this.$parent.$store;
        }
      }
    },
  });
};
