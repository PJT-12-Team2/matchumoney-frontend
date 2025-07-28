// src/stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    userId: null,
    nickname: null,
  }),
  actions: {
    setAuth(tokenDto) {
      this.accessToken = tokenDto.accessToken;
      this.userId = tokenDto.userId;
      this.nickname = tokenDto.nickname;
      localStorage.setItem("accessToken", tokenDto.accessToken);
    },
    logout() {
      this.accessToken = null;
      this.userId = null;
      this.nickname = null;
      localStorage.removeItem("accessToken");
    },
  },
});
