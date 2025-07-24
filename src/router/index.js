import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
<<<<<<< HEAD
import RecommendDeposit from "@/pages/deposit/RecommendDeposit.vue";
import SignupPage from "@/pages/auth/SignupPage.vue";
import LoginPage from "@/pages/auth/LoginPage.vue";
=======
import MyPage from "@/pages/user/MyPage.vue";
import RecommendDeposit from "@/pages/deposit/RecommendDeposit.vue";
import UpdateUserInfoPage from "@/pages/user/UpdateUserInfoPage.vue";
import UpdatePasswordPage from "@/pages/user/UpdatePasswordPage.vue";
>>>>>>> b785d0540aa512f444b222260e259c14cff0bb8d

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
<<<<<<< HEAD
=======
    path: "/mypage",
    name: "mypage",
    component: MyPage,
  },
  {
>>>>>>> b785d0540aa512f444b222260e259c14cff0bb8d
    path: "/api/deposits/recommendations/history",
    name: "RecommendDeposit",
    component: RecommendDeposit,
  },
  {
<<<<<<< HEAD
    path: "/signup",
    name: "Signup",
    component: SignupPage,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
=======
    path: "/mypage/update",
    name: "updateUserInfo",
    component: UpdateUserInfoPage,
  },
  {
    path: "/mypage/update/password",
    name: "updatePassword",
    component: UpdatePasswordPage,
>>>>>>> b785d0540aa512f444b222260e259c14cff0bb8d
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
