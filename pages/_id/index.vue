<template>
  <div>
    <h1>Dog</h1>
    <img :src="dog">
    <button @click="$store.commit('increment')">{{ $store.state.counter }}</button>
  </div>
</template>
<script>
export default {
  async asyncData({ app }) {
    // const dataStr = await app.$axios.get('/dog')
    // const {
    //   data: { message: dog }
    // } = dataStr
    return {
      dog: 'https://images.dog.ceo/breeds/sheepdog-english/n02105641_5980.jpg'
    }
  },
  mounted() {
    //其实这不应该用22这种明文参数，用也得用guid或者md5,接口采用redis存储方式
    this.$get('VStore/VStoreInfo/22', {})
      .then(res => {
        console.log('then')
        console.dir(res)
      })
      .catch(err => {
        console.log('catch')
      })
      .finally(() => {
        console.log('finally')
      })
  }
}
</script>
