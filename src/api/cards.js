import api from "@/api";

const BASE_URL = `users/me`;

export default {
  // 사용자 카드 정보 동기화 (KB카드 마이데이터 API 호출)
  async syncKbCards(syncData) {
    // console.log("🔄 카드 동기화 요청:", syncData);
    const { data } = await api.post(`${BASE_URL}/cards`, syncData);
    // console.log("✅ 카드 동기화 응답:", data);
    return data;
  },

  // 사용자 카드 목록 조회
  async getUserCards(userId) {
    // console.log("📋 카드 목록 조회 요청:", userId);
    const { data } = await api.get(`${BASE_URL}/${userId}/cards`);
    // console.log("✅ 카드 목록 응답:", data);
    return data;
  },

  // 카드 거래 내역 동기화
  async syncCardTransactions(holdingId, transactionData) {
    // console.log("🔄 거래내역 동기화 요청:", { holdingId, transactionData });
    const { data } = await api.post(
      `${BASE_URL}/cards/${holdingId}/transactions`,
      transactionData
    );
    // console.log("✅ 거래내역 동기화 응답:", data);
    return data;
  },

  // 저장된 카드 거래 내역 조회
  async getStoredCardTransactions(holdingId, userId) {
    // console.log("📋 저장된 거래내역 조회:", { holdingId, userId });
    const { data } = await api.get(
      `${BASE_URL}/cards/${holdingId}/transactions`,
      {
        params: { userId },
      }
    );
    // console.log("✅ 저장된 거래내역 응답:", data);
    return data;
  },
};
