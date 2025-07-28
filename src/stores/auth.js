// src/stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken"),
    userId: localStorage.getItem("userId"),
    nickname: localStorage.getItem("nickname"),
  }),
  actions: {
    setAuth(tokenDto) {
      this.accessToken = tokenDto.accessToken;
      this.userId = tokenDto.userId;
      this.nickname = tokenDto.nickname;
      localStorage.setItem("accessToken", tokenDto.accessToken);
      localStorage.setItem("userId", tokenDto.userId);
      localStorage.setItem("nickname", tokenDto.nickname);
    },
    logout() {
      this.accessToken = null;
      this.userId = null;
      this.nickname = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("nickname");
    },
    getToken() {
      return this.accessToken || localStorage.getItem("accessToken");
    },
  },
});
