import Vue from "vue";
import Vuex from "../vuex/index";

Vue.use(Vuex);

function persists(store) {
  console.log(store);
  let tmpstate = localStorage.getItem('VUEX:STATE')
  if(tmpstate) {
    store.replaceState(JSON.parse(tmpstate))
  }
  store.subscribe((mutains,state)=>{
    localStorage.setItem('VUEX:STATE',JSON.stringify(state))
  })
}

let store = new Vuex.Store({
  plugins:[persists],
  state: {
    age: 20,
  },
  getters: {
    getAge(state) {
      return state.age + 3;
    },
  },
  mutations: {
    changeAge(state, payload) {
      state.age += payload;
    },
  },
  actions: {
    changeAgeAction({ commit }, payload) {
      setTimeout(() => {
        commit("changeAge", payload);
      }, 1000);
    },
  },
  modules: {
    a: {
      namspaced: true,
      state: {
        b: 123,
      },
      mutations: {
        changeAge(state, payload) {
          state.b += payload;
          console.log("a模块changeage");
        },
      },
      actions:{
        changeAgeAction({ commit }, payload) {
          setTimeout(() => {
            commit("a/changeAge", payload);
          }, 1000);
        }
      },
      modules: {
        bb: {
          namspaced: true,
          state: {
            bb: "bb",
          },
        },
      },
    },
    b: {
      state: {
        b: 456,
      },
      mutations: {
        changeAge(state, payload) {
          console.log("b模块changeage");
        },
      },
    },
  },
});

//模块注册
store.registerModule(["e"], {
  namspaced:true,
  state: {
    eage: 125,
  },
});

export default store;
