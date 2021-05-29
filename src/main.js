import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Notifications from 'vue-notification'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueRouter)
Vue.use(Notifications)


import Home from './components/home.vue'
import _404 from './components/_404.vue'
import BPark from './components/bPark.vue'

const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/bletchleypark', component: BPark},
    { path: '*', component: _404},
  ]
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
