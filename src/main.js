import { createApp } from "vue";
import { createPinia } from "pinia";
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
app.use(createPinia());
app.use(router);
app.mount("#app");
