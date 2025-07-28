import api from "@/api";

const BASE_URL = "http://localhost:8080/api/auth";

export default {
  // 로그인
  async login(loginDto) {
    const { data } = await api.post(`${BASE_URL}/login`, loginDto, {
      withCredentials: true,
    });
    return data;
  },

  // 회원가입
  async signup(signupDto) {
    const { data } = await api.post(`${BASE_URL}/signup`, signupDto);
    return data;
  },

  // // 내 정보 조회
  // async getMyInfo() {
  //   const { data } = await api.get(`${BASE_URL}/me`);
  //   return data;
  // },
};
