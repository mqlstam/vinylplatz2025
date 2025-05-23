import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';
import router from './app/router';
import './styles.css';
import './app/interceptors/axios.interceptor';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#root');
