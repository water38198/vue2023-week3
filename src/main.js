import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@unocss/reset/eric-meyer.css'
import 'sweetalert2/dist/sweetalert2.min.css';
import 'virtual:uno.css'
import './assets/main.scss'
const app = createApp(App)
app.use(router)
app.mount('#app')
