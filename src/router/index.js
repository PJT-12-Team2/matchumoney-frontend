import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import MyPage from "@/pages/MyPage.vue";
import RecommendDeposit from "@/pages/deposit/RecommendDeposit.vue";
import UpdateUserInfoPage from "@/pages/UpdateUserInfoPage.vue";
import UpdatePasswordPage from "@/pages/UpdatePasswordPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/mypage",
    name: "mypage",
    component: MyPage,
  },
  {
    path: "/api/deposits/recommendations/history",
    name: "RecommendDeposit",
    component: RecommendDeposit,
  },
  {
    path: "/mypage/update",
    name: "updateUserInfo",
    component: UpdateUserInfoPage,
  },
  {
    path: "/mypage/update/password",
    name: "updatePassword",
    component: UpdatePasswordPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
