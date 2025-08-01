<template>
  <div class="card-recommendation-section">
    <div class="section-header">
      <h3>
        <i class="bi bi-stars"></i>
        {{ selectedCard?.cardName || "카드" }} 맞춤 추천
      </h3>
      <p class="section-subtitle">
        소비 패턴을 분석하여 더 나은 카드를 추천해드립니다
      </p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <BaseSpinner size="md" />
      <p>추천 카드를 분석하고 있습니다...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <BaseButton @click="loadRecommendations" variant="outline" size="sm">
        다시 시도
      </BaseButton>
    </div>

    <!-- 추천 결과 없음 -->
    <div
      v-else-if="
        recommendationData && recommendationData.recommendedCards.length === 0
      "
      class="no-recommendations"
    >
      <div class="empty-icon">✅</div>
      <h4>현재 카드가 최적입니다</h4>
      <p>
        {{
          recommendationData.message ||
          "현재 사용 중인 카드가 소비 패턴에 가장 적합합니다."
        }}
      </p>
    </div>

    <!-- 추천 카드 목록 -->
    <div
      v-else-if="
        recommendationData && recommendationData.recommendedCards.length > 0
      "
      class="recommendations-content"
    >
      <!-- 혜택 비교 요약 -->
      <div class="benefit-summary">
        <div class="current-benefit">
          <span class="label">현재 예상 혜택</span>
          <span class="amount"
            >{{ formatCurrency(getCurrentBenefit()) }}원</span
          >
        </div>
        <div class="arrow">→</div>
        <div class="recommended-benefit">
          <span class="label">최대 예상 혜택</span>
          <span class="amount highlight"
            >{{
              formatCurrency(
                recommendationData.recommendedCards[0]?.estimatedBenefit
              )
            }}원</span
          >
        </div>
        <div class="improvement">
          <span class="improvement-label">개선 효과</span>
          <span class="improvement-amount"
            >+{{ formatCurrency(getBenefitImprovement()) }}원</span
          >
        </div>
      </div>

      <!-- 추천 카드 리스트 -->
      <div class="recommendations-list">
        <div
          v-for="(card, index) in recommendationData.recommendedCards.slice(
            0,
            3
          )"
          :key="card.cardId"
          class="recommendation-item"
          :class="{ 'top-recommendation': index === 0 }"
        >
          <div class="rank-badge">{{ index + 1 }}</div>

          <div class="card-info">
            <div class="card-image-container">
              <img
                :src="card.cardImageUrl"
                :alt="card.cardName"
                class="card-image"
                @error="handleImageError"
              />
            </div>

            <div class="card-details">
              <h4 class="card-name">{{ card.cardName }}</h4>
              <p class="card-issuer">{{ card.issuer }}</p>

              <div class="card-specs">
                <span
                  class="card-type"
                  :class="getCardTypeClass(card.cardType)"
                >
                  {{ card.cardType }}
                </span>
                <span class="annual-fee">{{
                  card.annualFee || "연회비 정보 없음"
                }}</span>
              </div>
            </div>
          </div>

          <div class="benefit-info">
            <div class="benefit-amount">
              <span class="amount"
                >{{ formatCurrency(card.estimatedBenefit) }}원</span
              >
              <span class="label">예상 혜택</span>
            </div>
            <div class="apply-actions">
              <button
                v-if="card.requestMobileUrl"
                @click="openApplicationLink(card.requestMobileUrl)"
                class="btn-apply mobile"
              >
                신청
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 더보기 버튼 -->
      <div class="view-more">
        <BaseButton
          @click="goToFullRecommendations"
          variant="primary"
          full-width
        >
          <i class="bi bi-arrow-right"></i>
          전체 추천 카드 보기 ({{
            recommendationData.recommendedCards.length
          }}개)
        </BaseButton>
      </div>
    </div>

    <!-- 추천 안내 (거래내역 없을 때) -->
    <div v-else class="recommendation-guide">
      <div class="guide-icon">🎯</div>
      <h4>카드 추천을 받으려면</h4>
      <p>거래내역을 먼저 동기화해주세요</p>
      <BaseButton @click="$emit('requestTransactionSync')" variant="outline">
        거래내역 연동하기
      </BaseButton>
    </div>
  </div>
</template>

<script>
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import cardsApi from "@/api/cards.js";

export default {
  name: "CardRecommendationSection",
  components: {
    BaseSpinner,
    BaseButton,
  },
  props: {
    selectedCard: {
      type: Object,
      default: null,
    },
    hasTransactions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["requestTransactionSync"],
  data() {
    return {
      loading: false,
      error: null,
      recommendationData: null,
    };
  },
  watch: {
    selectedCard: {
      handler(newCard) {
        if (newCard && newCard.cardId && this.hasTransactions) {
          this.loadRecommendations();
        }
      },
      immediate: true,
    },
    hasTransactions: {
      handler(hasTransactions) {
        if (hasTransactions && this.selectedCard?.cardId) {
          this.loadRecommendations();
        }
      },
    },
  },
  methods: {
    async loadRecommendations() {
      if (!this.selectedCard?.cardId || !this.hasTransactions) {
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        console.log("🎯 카드 추천 로딩 시작:", this.selectedCard.cardId);

        // 1단계: 먼저 현재 카드의 혜택 조회
        console.log("💰 현재 카드 혜택 조회 시작");
        const benefitsResponse = await cardsApi.getCardBenefits(
          this.selectedCard.cardId
        );
        console.log("✅ 현재 카드 혜택 조회 완료:", benefitsResponse);

        // 2단계: 혜택 정보를 바탕으로 추천 카드 조회
        // 저장된 추천 데이터 먼저 시도
        try {
          const response = await cardsApi.getSavedRecommendations(
            this.selectedCard.cardId
          );
          this.recommendationData = response.data || response;

          // 현재 카드 혜택 정보 추가
          if (this.recommendationData && benefitsResponse) {
            this.recommendationData.currentCardBenefits =
              benefitsResponse.data || benefitsResponse;
          }

          console.log(
            "✅ 저장된 추천 데이터 로딩 완료:",
            this.recommendationData
          );
        } catch (savedError) {
          // 저장된 데이터가 없으면 실시간 추천 조회
          console.log("💾 저장된 추천 없음, 실시간 조회 시도");
          const response = await cardsApi.getCardRecommendations(
            this.selectedCard.cardId
          );
          this.recommendationData = response.data || response;

          // 현재 카드 혜택 정보 추가
          if (this.recommendationData && benefitsResponse) {
            this.recommendationData.currentCardBenefits =
              benefitsResponse.data || benefitsResponse;
          }

          console.log(
            "✅ 실시간 추천 데이터 로딩 완료:",
            this.recommendationData
          );
        }
      } catch (error) {
        console.error("❌ 추천 데이터 로딩 실패:", error);
        this.error = error.message || "추천 데이터를 불러오는데 실패했습니다.";
        this.recommendationData = null;
      } finally {
        this.loading = false;
      }
    },

    getCurrentBenefit() {
      // 현재 카드의 예상 혜택 반환 (ownedCardBenefits 배열에서 첫 번째 카드의 estimatedBenefit)
      if (
        this.recommendationData?.currentCardBenefits?.ownedCardBenefits
          ?.length > 0
      ) {
        return this.recommendationData.currentCardBenefits.ownedCardBenefits[0]
          .estimatedBenefit;
      }
      return 0;
    },

    getBenefitImprovement() {
      if (!this.recommendationData?.recommendedCards[0]?.estimatedBenefit) {
        return 0;
      }
      return (
        this.recommendationData.recommendedCards[0].estimatedBenefit -
        this.getCurrentBenefit()
      );
    },

    formatCurrency(amount) {
      if (!amount) return "0";
      return Number(amount).toLocaleString();
    },

    getCardTypeClass(cardType) {
      return {
        "type-credit": cardType === "신용",
        "type-debit": cardType === "체크",
      };
    },

    handleImageError(event) {
      event.target.src = "/logo.png";
    },

    openApplicationLink(url) {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },

    goToFullRecommendations() {
      // selectedCard에서 올바른 cardId 추출
      const cardId =
        this.selectedCard?.cardId || this.selectedCard?.cardProductId;

      if (cardId) {
        console.log("🎯 전체 추천 페이지 이동:", cardId);
        this.$router.push({
          name: "CardRecommendation",
          params: { cardId: cardId.toString() },
        });
      } else {
        console.error("❌ 카드 ID를 찾을 수 없습니다:", this.selectedCard);
      }
    },
  },
};
</script>

<style scoped>
.card-recommendation-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
  text-align: center;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.loading-state,
.error-state,
.no-recommendations,
.recommendation-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.error-icon,
.empty-icon,
.guide-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #666;
  margin-bottom: 16px;
}

.current-card-benefits {
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.current-card-benefits h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.benefit-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.benefit-stat .stat-label {
  font-size: 12px;
  color: #666;
}

.benefit-stat .stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.benefit-stat .stat-value.current {
  color: #2196f3;
}

.benefit-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
  border-radius: 8px;
  flex-wrap: wrap;
}

.current-benefit,
.recommended-benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.benefit-summary .label {
  font-size: 12px;
  color: #666;
}

.benefit-summary .amount {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.benefit-summary .amount.highlight {
  color: #4caf50;
}

.arrow {
  font-size: 20px;
  color: #2196f3;
  font-weight: bold;
}

.improvement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #4caf50;
  border-radius: 6px;
  color: white;
}

.improvement-label {
  font-size: 11px;
}

.improvement-amount {
  font-size: 14px;
  font-weight: 700;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  position: relative;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  border-color: #2196f3;
  transform: translateY(-1px);
}

.top-recommendation {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 24px;
  height: 24px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.top-recommendation .rank-badge {
  background: #ffd700;
  color: #333;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-image-container {
  flex-shrink: 0;
  width: 60px;
  height: 38px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-issuer {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
}

.card-specs {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.card-type {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.type-credit {
  background: #e3f2fd;
  color: #1976d2;
}

.type-debit {
  background: #f3e5f5;
  color: #7b1fa2;
}

.annual-fee {
  font-size: 11px;
  color: #999;
}

.benefit-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.benefit-amount {
  text-align: right;
}

.benefit-amount .amount {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #4caf50;
}

.benefit-amount .label {
  display: block;
  font-size: 11px;
  color: #666;
}

.btn-apply {
  padding: 6px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-apply:hover {
  background: #388e3c;
}

.view-more {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

@media (max-width: 768px) {
  .card-recommendation-section {
    padding: 16px;
  }

  .benefit-summary {
    flex-direction: column;
    gap: 8px;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .recommendation-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .card-info {
    justify-content: center;
  }

  .benefit-info {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
