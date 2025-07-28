import api from "@/api";

const BASE_URL = "http://localhost:8080/api/user";

export default {
  // 내 정보 조회
  async getMyInfo() {
    const { data } = await api.get(`${BASE_URL}/me`);
    return data;
  },
  // 회원 정보 수정
  async updateUserInfo(updateDto) {
    const { data } = await api.patch(`${BASE_URL}/update`, updateDto);
    return data;
  },
};
