import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/aura-light-green/theme.css'

createApp(App)
    .use(PrimeVue)
    .mount('#app')
