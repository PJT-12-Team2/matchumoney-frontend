import api from '@/api';

//임시 설정
const BASE_URL = 'http://localhost:8080/api/user/me/savings';

export default {
  // 적금 리스트 조회
  async getList() {
    const { data } = await api.get(`${BASE_URL}`);
    // console.log('💰 Saving List:', data);
    return data;
  },

  // 적금 계좌 동기화 (예: 은행 로그인 후)
  async syncAccounts(bankLoginDto) {
    const { data } = await api.post(`${BASE_URL}/sync`, bankLoginDto);
    // console.log('🔄 Synced Saving Accounts:', data);
    return data;
  },

  // 적금 계좌 동기화 (예: 은행 로그인 후)
  async getRecommendSavings(id) {
    const { data } = await api.get(`${BASE_URL}/${id}/recommend`);
    // console.log('💰 Recommend Saving List:', data);
    return data;
  },
};
