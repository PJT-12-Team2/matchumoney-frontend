import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const instance = axios.create({
  baseURL: '/api', // ✅ Vite 프록시 경로로 설정
  timeout: 300000,
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

export default instance;
