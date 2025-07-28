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

  // 인증번호 전송
  async sendVerificationEmail(email) {
    const { data } = await api.post(`${BASE_URL}/signup/email/send`, { email });
    return data;
  },

  // 인증번호 검증
  async verifyEmailCode(email, code) {
    const { data } = await api.post(`/api/auth/email/verify`, { email, code });
    return data;
  },
};
