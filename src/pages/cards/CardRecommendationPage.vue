<template>
  <div class="card-recommendation-page">
    <!-- 헤더 -->
    <div class="page-header">
      <h1 class="page-title">카드 추천</h1>
      <p class="page-subtitle">
        거래 내역을 분석하여 더 나은 혜택의 카드를 추천해드립니다
      </p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <BaseSpinner />
      <p>추천 카드를 분석하고 있습니다...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>데이터를 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <BaseButton @click="loadRecommendations" class="retry-btn">
          다시 시도
        </BaseButton>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else class="content">
      <!-- 카드 선택 -->
      <div class="card-selector-section">
        <h2>분석할 카드를 선택하세요</h2>
        <div class="card-selector">
          <select
            v-model="selectedCardId"
            @change="onCardChange"
            class="card-select"
          >
            <option value="">카드를 선택하세요</option>
            <option
              v-for="card in userCards"
              :key="card.holdingId || card.cardId"
              :value="card.cardId"
            >
              {{ card.cardName || card.name }} ({{
                card.issuer || card.issuerName
              }})
            </option>
          </select>
        </div>
      </div>

      <!-- 분석 결과 -->
      <div v-if="recommendationData" class="analysis-results">
        <!-- 소비 패턴 분석 -->
        <div class="analysis-section">
          <SpendingCategoryChart
            :categoryStats="recommendationData.categoryStats"
            :totalSpendAmount="recommendationData.totalSpendAmount"
          />
        </div>

        <!-- 추천 카드 목록 -->
        <div class="recommendations-section">
          <div class="section-header">
            <h2>추천 카드</h2>
            <p class="section-subtitle">{{ recommendationData.message }}</p>
          </div>

          <div
            v-if="recommendationData.recommendedCards.length === 0"
            class="no-recommendations"
          >
            <div class="empty-state">
              <h3>추천할 카드가 없습니다</h3>
              <p>현재 사용 중인 카드가 해당 소비 패턴에 가장 적합합니다.</p>
            </div>
          </div>

          <div v-else class="recommendations-list">
            <RecommendedCardItem
              v-for="(card, index) in recommendationData.recommendedCards"
              :key="card.cardId"
              :card="card"
              class="recommendation-rank"
              :class="`rank-${index + 1}`"
            >
              <template #rank>
                <div class="rank-badge">{{ index + 1 }}</div>
              </template>
            </RecommendedCardItem>
          </div>
        </div>

        <!-- 추천 요약 -->
        <div class="recommendation-summary">
          <div class="summary-card">
            <h3>분석 요약</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">분석 기간</span>
                <span class="stat-value">최근 {{ ANALYSIS_PERIOD_DAYS }}일</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">총 소비금액</span>
                <span class="stat-value"
                  >{{
                    formatCurrency(recommendationData.totalSpendAmount)
                  }}원</span
                >
              </div>
              <div class="stat-item">
                <span class="stat-label">추천 카드 수</span>
                <span class="stat-value"
                  >{{ recommendationData.recommendedCards.length }}개</span
                >
              </div>
              <div
                class="stat-item"
                v-if="recommendationData.recommendedCards.length > 0"
              >
                <span class="stat-label">최대 예상 혜택</span>
                <span class="stat-value benefit">
                  {{
                    formatCurrency(
                      recommendationData.recommendedCards[0]?.estimatedBenefit
                    )
                  }}원
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 처음 상태 -->
      <div v-else class="empty-state-main">
        <div class="empty-content">
          <h3>카드를 선택해주세요</h3>
          <p>거래 내역을 분석하여 더 나은 카드를 추천해드립니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import RecommendedCardItem from "@/components/cards/RecommendedCardItem.vue";
import SpendingCategoryChart from "@/components/cards/SpendingCategoryChart.vue";
import cardsApi from "@/api/cards.js";

export default {
  name: "CardRecommendationPage",
  components: {
    BaseSpinner,
    BaseButton,
    RecommendedCardItem,
    SpendingCategoryChart,
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      loading: false,
      error: null,
      selectedCardId: "",
      userCards: [],
      recommendationData: null,
      ANALYSIS_PERIOD_DAYS: 30, // 분석 기간 상수
    };
  },
  async mounted() {
    await this.loadUserCards();

    // URL 파라미터에서 cardId 가져오기
    const cardId = this.$route.params.cardId || this.$route.query.cardId;
    if (cardId) {
      this.selectedCardId = parseInt(cardId);
      await this.loadRecommendations();
    }
  },
  methods: {
    async loadUserCards() {
      try {
        this.loading = true;
        this.error = null;

        const userId = this.authStore.getUserId;
        if (!userId) {
          this.error = "로그인이 필요합니다.";
          this.$router.push("/login");
          return;
        }

        console.log("📋 사용자 카드 목록 조회 시작, userId:", userId);
        const response = await cardsApi.getUserCards(userId);
        console.log("✅ 사용자 카드 응답:", response);

        // API 응답 구조에 맞게 처리
        this.userCards = response.result || response.data || response || [];

        if (this.userCards.length === 0) {
          this.error =
            "등록된 카드가 없습니다. 먼저 마이데이터에서 카드를 연동해주세요.";
        } else {
          console.log(`💡 ${this.userCards.length}개의 카드를 불러왔습니다.`);
        }
      } catch (error) {
        console.error("❌ 사용자 카드 로딩 실패:", error);

        if (error.response?.status === 401) {
          this.error = "인증이 만료되었습니다. 다시 로그인해주세요.";
          this.authStore.logout();
          this.$router.push("/login");
        } else if (error.response?.status === 404) {
          this.error =
            "등록된 카드가 없습니다. 먼저 마이데이터에서 카드를 연동해주세요.";
        } else {
          this.error =
            error.response?.data?.message ||
            error.message ||
            "카드 목록을 불러오는데 실패했습니다.";
        }
      } finally {
        this.loading = false;
      }
    },

    async loadRecommendations() {
      if (!this.selectedCardId) return;

      try {
        this.loading = true;
        this.error = null;

        console.log("🎯 카드 추천 로딩 시작:", this.selectedCardId);

        // 1단계: 먼저 현재 카드의 혜택 조회
        console.log("💰 현재 카드 혜택 조회 시작");
        const benefitsResponse = await cardsApi.getCardBenefits(this.selectedCardId);
        console.log("✅ 현재 카드 혜택 조회 완료:", benefitsResponse);

        // 2단계: 혜택 정보를 바탕으로 추천 카드 조회
        let response;
        try {
          response = await cardsApi.getSavedRecommendations(this.selectedCardId);
          console.log("✅ 저장된 추천 데이터 로딩 완료:", response);
        } catch (savedError) {
          // 저장된 데이터가 없으면 실시간 추천 조회
          console.log("💾 저장된 추천 없음, 실시간 조회 시도");
          response = await cardsApi.getCardRecommendations(this.selectedCardId);
          console.log("✅ 실시간 추천 데이터 로딩 완료:", response);
        }

        // API 응답 구조에 맞게 처리
        this.recommendationData = response.data || response;

        // 현재 카드 혜택 정보 추가
        if (this.recommendationData && benefitsResponse) {
          this.recommendationData.currentCardBenefits = benefitsResponse.data || benefitsResponse;
        }

        // URL 업데이트
        if (this.$route.params.cardId !== this.selectedCardId.toString()) {
          this.$router.replace({
            name: "CardRecommendation",
            params: { cardId: this.selectedCardId },
          });
        }
      } catch (error) {
        console.error("❌ 추천 데이터 로딩 실패:", error);
        this.error =
          error.response?.data?.message ||
          error.message ||
          "추천 데이터를 불러오는데 실패했습니다.";
        this.recommendationData = null;
      } finally {
        this.loading = false;
      }
    },

    async onCardChange() {
      if (this.selectedCardId) {
        await this.loadRecommendations();
      } else {
        this.recommendationData = null;
      }
    },

    formatCurrency(amount) {
      if (!amount) return "0";
      return Number(amount).toLocaleString();
    },
  },
};
</script>

<style scoped>
.card-recommendation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

.error-container {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.error-message {
  text-align: center;
  max-width: 400px;
}

.error-message h3 {
  color: #f44336;
  margin-bottom: 8px;
}

.error-message p {
  color: #666;
  margin-bottom: 24px;
}

.card-selector-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-selector-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.card-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s ease;
}

.card-select:focus {
  outline: none;
  border-color: #2196f3;
}

.analysis-results {
  display: grid;
  gap: 24px;
  grid-template-areas:
    "analysis"
    "recommendations"
    "summary";
}

.analysis-section {
  grid-area: analysis;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommendations-section {
  grid-area: recommendations;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.no-recommendations {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.empty-state {
  text-align: center;
  max-width: 400px;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 8px;
}

.empty-state p {
  color: #999;
}

.recommendations-list {
  display: grid;
  gap: 16px;
}

.recommendation-rank {
  position: relative;
}

.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 32px;
  height: 32px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  z-index: 1;
}

.rank-1 .rank-badge {
  background: #ffd700;
  color: #333;
}

.rank-2 .rank-badge {
  background: #c0c0c0;
  color: #333;
}

.rank-3 .rank-badge {
  background: #cd7f32;
  color: white;
}

.recommendation-summary {
  grid-area: summary;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-value.benefit {
  color: #4caf50;
}

.empty-state-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-content h3 {
  color: #666;
  margin-bottom: 8px;
}

.empty-content p {
  color: #999;
}

/* 데스크탑 레이아웃 개선 */
@media (min-width: 1024px) {
  .analysis-results {
    grid-template-areas:
      "analysis recommendations"
      "summary summary";
    grid-template-columns: 1fr 1fr;
  }

  .analysis-section,
  .recommendations-section {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .card-recommendation-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .analysis-section,
  .recommendations-section {
    padding: 16px;
  }

  .card-selector-section {
    padding: 16px;
  }
}
</style>
