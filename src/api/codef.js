import api from '@/api';

const BASE_URL = `/codef`;

export default {
  // 예/적금 계좌 동기화
  async syncAccounts(bankLoginDto) {
    const { data } = await api.post(`${BASE_URL}/saving/sync`, bankLoginDto);
    // console.log('🔄 Synced Saving Accounts:', data);
    return data;
  },

  // 예/적금 계좌 동기화 (로그인 없이 이전 로그인으로)
  async syncAccountsPre() {
    const { data } = await api.post(`${BASE_URL}/saving/sync/pre`);
    // console.log('🔄 Synced Saving Accounts:', data);
    return data;
  },

  //
  async deleteConnectedId() {
    await api.delete(`${BASE_URL}/connectedId`);
    console.log('connectedId 제거중... ');
  },

  async updateConnectedId(bankLoginDto) {
    await api.put(`${BASE_URL}/connectedId`, bankLoginDto);
    console.log('connectedId 업데이트... ', bankLoginDto);
  },

  //연결된 은행 코드
  async getBankByConnectedId() {
    const { data } = await api.get(`${BASE_URL}/connectedId`);
    console.log('🔄 Bank List:', data);
    return data;
  },
};
