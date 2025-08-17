// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

import router from './router';
import App from './App.vue';

// 1) 글로벌 스타일
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/main.css';

// 2) Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 3) 앱 생성
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// 로그인 상태 복원
const token = localStorage.getItem('accessToken');
if (token) {
  const authStore = useAuthStore();
  authStore.accessToken = token;
}

app.use(router);
app.mount('#app');

// 4) FCM 초기화 (service로 분리)
import { initFCM } from '@/firebase/fcmService';
window.addEventListener('app:login', () => {
  initFCM();
});
