import api from '@/api';

const BASE_URL = `auth`;

export default {
  // 로그인
  async login(loginDto) {
    const { data } = await api.post(`${BASE_URL}/login`, loginDto, {
      withCredentials: true,
    });
    return data;
  },

  // 카카오 로그인
  async kakaoLogin(code) {
    const { data } = await api.post(`${BASE_URL}/kakao-login`, { code });
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

  // 비밀번호 재설정 인증번호 전송
  async sendResetVerificationEmail(email) {
    const { data } = await api.post(`${BASE_URL}/reset/email/send`, { email });
    return data;
  },

  // 인증번호 검증
  async verifyEmailCode(email, code) {
    const { data } = await api.post(`${BASE_URL}/email/verify`, {
      email,
      code,
    });
    return data;
  },

  // 비밀번호 재설정
  async resetPassword(resetDto) {
    const { data } = await api.patch(`${BASE_URL}/reset/password`, resetDto);
    return data;
  },
  async verifyPassword(password) {
    const { data } = await api.post(
      `${BASE_URL}/verify/password`,
      { password },
      { withCredentials: true } // 쿠키 쓰면 유지, 아니면 빼도 OK
    );
    return data; // 보통 { result: true/false, ... } 형태
  },
};
