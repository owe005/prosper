import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

/* Import FontAwesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChartLine, faReceipt, faWallet } from '@fortawesome/free-solid-svg-icons'

/* Add icons to the library */
library.add(faChartLine, faReceipt, faWallet)

const app = createApp(App)
const pinia = createPinia()

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(router)
app.mount('#app')
