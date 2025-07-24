import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import RecommendDeposit from "@/pages/deposit/RecommendDeposit.vue";
import SignupPage from "@/pages/auth/SignupPage.vue";
import LoginPage from "@/pages/auth/LoginPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/api/deposits/recommendations/history",
    name: "RecommendDeposit",
    component: RecommendDeposit,
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignupPage,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
