import api from "@/api";

const BASE_URL = `/users/me`;

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

  // 저장된 카드 거래 내역 조회 (holdingId 방식)
  async getStoredCardTransactions(holdingId, userId) {
    // console.log("📋 holdingId로 저장된 거래내역 조회:", { holdingId, userId });
    const { data } = await api.get(
      `${BASE_URL}/cards/${holdingId}/transactions`,
      {
        params: { userId },
      }
    );
    return data;
  },

  // 저장된 카드 거래 내역 조회 (finId 방식)
  async getStoredCardTransactionsByFinId(finId, userId) {
    // console.log("📋 finId로 저장된 거래내역 조회:", { finId, userId });
    const { data } = await api.get(
      `${BASE_URL}/cards/finId/${finId}/transactions`,
      {
        params: { userId },
      }
    );
    return data;
  },

  // 디버그: 사용자의 모든 거래내역 상태 조회
  async debugUserTransactions(userId) {
    // console.log("🔍 디버그: 사용자 거래내역 상태 조회:", { userId });
    const { data } = await api.get(`${BASE_URL}/debug/transactions/${userId}`);
    return data;
  },

  // 카드 추천 관련 API
  // 특정 카드 혜택 조회
  async getCardBenefits(cardId) {
    // console.log("💰 카드 혜택 조회 요청:", cardId);
    const { data } = await api.get(
      `/v1/card-recommendation/cards/${cardId}/benefits`
    );
    // console.log("✅ 카드 혜택 응답:", data);
    return data;
  },

  // 더 나은 카드 추천 조회
  async getCardRecommendations(cardId) {
    // console.log("🎯 카드 추천 조회 요청:", cardId);
    const { data } = await api.get(
      `/v1/card-recommendation/cards/${cardId}/recommendations`
    );
    // console.log("✅ 카드 추천 응답:", data);
    return data;
  },

  // 사용자 보유 카드 전체 혜택 조회
  async getMyCardsBenefits() {
    // console.log("📊 보유 카드 혜택 조회 요청");
    const { data } = await api.get(`/v1/card-recommendation/my-cards/benefits`);
    // console.log("✅ 보유 카드 혜택 응답:", data);
    return data;
  },

  // 저장된 추천 카드 조회
  async getSavedRecommendations(cardId) {
    // console.log("💾 저장된 추천 조회 요청:", cardId);
    const { data } = await api.get(
      `/v1/card-recommendation/cards/${cardId}/saved-recommendations`
    );
    // console.log("✅ 저장된 추천 응답:", data);
    return data;
  },

  // 모든 저장된 추천 카드 조회
  async getAllSavedRecommendations() {
    // console.log("📋 모든 저장된 추천 조회 요청");
    const { data } = await api.get(
      `/v1/card-recommendation/saved-recommendations`
    );
    // console.log("✅ 모든 저장된 추천 응답:", data);
    return data;
  },

  // 저장된 추천 카드 삭제
  async deleteSavedRecommendations(cardId) {
    // console.log("🗑️ 저장된 추천 삭제 요청:", cardId);
    const { data } = await api.delete(
      `/v1/card-recommendation/cards/${cardId}/saved-recommendations`
    );
    // console.log("✅ 저장된 추천 삭제 응답:", data);
    return data;
  },
};
