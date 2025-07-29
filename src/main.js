import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

import router from "./router";
import App from "./App.vue";

/* ─── 1. 스타일 ─── */
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // optional
import "./assets/main.css";

/* ─── 2. 부트스트랩 JS 번들 ─── */
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/* ─── 3. 앱 생성 ─── */
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const token = localStorage.getItem("accessToken");
if (token) {
  const authStore = useAuthStore();
  authStore.accessToken = token;
}

app.use(router);
app.mount("#app");
