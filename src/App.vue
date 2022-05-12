<template>
  <div id="app">
    <div id="nav">
      <Test></Test>
      年龄：{{ $store.state.age }} 我的年龄：{{ $store.getters.getAge }}
      {{$store.state.a.b}}========{{$store.state.b.b}}
      <button @click="$store.commit('changeAge', 2)">dd</button>
      <button @click="$store.dispatch('changeAgeAction', 3)">异步修改</button>
      <hr/>
      <button @click="$store.commit('a/changeAge', 2)">dd</button>
      <button @click="$store.dispatch('a/changeAgeAction', 3)">异步修改</button>
      <hr/>
      {{$store.state.e.eage}}
    </div>
    <router-view />
  </div>
</template>
<script>
import Test from "@/components/test.vue";
export default {
  components: {
    Test,
  },
};
</script>
<style lang="scss"></style>
