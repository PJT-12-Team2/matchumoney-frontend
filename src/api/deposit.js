import api from '@/api';

const BASE_URL = `/deposits`;

export default {
  // 사용자 계좌 목록 조회
  async getUserAccounts(userId) {
    const { data } = await api.get(`${BASE_URL}/accounts/${userId}`);
    // console.log('💳 User Accounts:', data);
    return data;
  },

  // 잔액 기반 상품 추천
  async getProductsByBalance(requestData) {
    const { data } = await api.post(
      `${BASE_URL}/recommendations/byBalance`,
      requestData
    );
    // console.log('💰 Recommended Products:', data);
    return data;
  },

  // 계좌 연결 (은행 로그인)
  async connectAccount(connectData) {
    const { data } = await api.post(`${BASE_URL}/connect`, connectData);
    // console.log('🔗 Account Connected:', data);
    return data;
  },

  // 모든 예금 상품 조회
  async getAllProducts() {
    const { data } = await api.get(`${BASE_URL}/recommendations/allProducts`);
    // console.log('📋 All Deposit Products:', data);
    return data;
  },

  // KB국민은행 상품 조회
  async getKBProducts() {
    const { data } = await api.get(`${BASE_URL}/recommendations/kb-products`);
    // console.log('🏛️ KB Bank Products:', data);
    return data;
  },
};
