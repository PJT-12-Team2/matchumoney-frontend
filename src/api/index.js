import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // ✅ Vite 프록시 경로로 설정
  timeout: 300000,
});
instance.interceptors.request.use(
  (config) => {
    // const { getToken } = useAuthStore();
    // const token = getToken();
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoZW9uZ3Nlb2IxMUBnbWFpbC5jb20iLCJpYXQiOjE3NTM2ODg0MzgsImV4cCI6MTc1MzY4ODczOH0.u5n5Dvb0GiJiWOe1r2EzUQmNZnXJ1Zwami1bmDjlXQk';
    //실제 로그인 토큰 값으로 변경
    //현재 프론트 로그인 미구현으로 임시 이용

    //토큰 값 있으면 헤더에 자동 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
