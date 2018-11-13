import Vue from 'vue';
import APP from './APP.vue';

import './assets/css/reset.css';
import './assets/css/base.css';

new Vue({
    render: h => h(APP)
}).$mount('#app');