import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const instance = axios.create({
  withCredentials: true, // 쿠키를 포함한 요청
  timeout: 300000, //30초
  //  codef 적금 불러오기 시간초과 발생 방지를 위해 길게 설정
  baseURL: '/api', // ✅ Vite 프록시 경로로 
});
instance.interceptors.request.use(
  (config) => {
    // 토큰을 Pinia 스토어에서 가져오기
    const token = useAuthStore().getToken();

    //토큰 값 있으면 헤더에 자동 추가
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (response && response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // console.log("📦 응답 헤더 전체:", response.headers);
      const newAccessToken = response.headers["authorization"];
      // console.log("🔄 새 accessToken이 재발급되어 반영됩니다:", newAccessToken);

      if (newAccessToken) {
        const tokenOnly = newAccessToken.startsWith("Bearer ") ? newAccessToken.slice(7) : newAccessToken;
        authStore.setToken(tokenOnly);
        originalRequest.headers["Authorization"] = `Bearer ${tokenOnly}`;
        return instance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
