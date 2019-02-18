// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App.vue'

import './components/tree/assets/index.scss'

Vue.config.productionTip = false;

new Vue({
    el: '#app',
    render: h => h(App)
}).$mount('#app');

