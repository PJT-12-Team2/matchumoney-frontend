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

      <!-- 추천 카드 리스트 (TOP 5) -->
      <div class="recommendations-list">
        <div
          v-for="(card, index) in recommendationData.recommendedCards.slice(
            0,
            5
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
                @load="handleImageLoad"
                loading="lazy"
              />
              <div class="image-loading" v-if="!imageLoaded">
                <div class="loading-spinner"></div>
              </div>
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

      <!-- 추천 카드 총 개수 표시 -->
      <div class="recommendation-summary">
        <p class="summary-text">
          총 {{ recommendationData.recommendedCards.length }}개의 추천 카드 중
          상위 {{ Math.min(5, recommendationData.recommendedCards.length) }}개를
          표시하고 있습니다.
        </p>
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

    handleImageLoad(event) {
      const img = event.target;
      const container = img.parentElement;

      // 이미지의 가로세로 비율 확인
      if (img.naturalHeight > img.naturalWidth) {
        // 세로 이미지인 경우
        container.classList.add("vertical-image");
      } else {
        // 가로 이미지인 경우
        container.classList.add("horizontal-image");
      }
    },

    openApplicationLink(url) {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
  },
};
</script>

<style scoped>
/* main.css 변수 import */
@import "@/assets/main.css";

.card-recommendation-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.section-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.section-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.section-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
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
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

.error-icon,
.empty-icon,
.guide-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
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
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-info-light) 100%
  );
  border-radius: 12px;
  flex-wrap: wrap;
  border: 1px solid var(--border-light);
}

.current-benefit,
.recommended-benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.benefit-summary .label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.benefit-summary .amount {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.benefit-summary .amount.highlight {
  color: var(--color-success);
}

.arrow {
  font-size: var(--font-size-xl);
  color: var(--color-accent);
  font-weight: bold;
}

.improvement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-success);
  border-radius: 8px;
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.improvement-label {
  font-size: var(--font-size-xs);
}

.improvement-amount {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.recommendation-item {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  background: var(--bg-card);
  min-height: 110px;
}

.recommendation-item:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.top-recommendation {
  border-color: var(--color-warning);
  background: linear-gradient(
    135deg,
    var(--color-warning-light) 0%,
    var(--bg-card) 100%
  );
}

.rank-badge {
  position: absolute;
  top: calc(-1 * var(--spacing-sm));
  left: calc(-1 * var(--spacing-sm));
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--bg-card);
}

.top-recommendation .rank-badge {
  background: var(--color-warning);
  color: var(--color-dark);
}

.card-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  flex: 1;
  min-width: 0;
  padding-top: var(--spacing-xs);
}

.card-image-container {
  flex-shrink: 0;
  width: 140px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

/* 세로 이미지: 높이를 최대한 활용 */
.card-image-container.vertical-image .card-image {
  height: 85px;
  width: auto;
}

/* 가로 이미지: 너비를 최대한 활용 */
.card-image-container.horizontal-image .card-image {
  width: 110px;
  height: auto;
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-issuer {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-specs {
  display: block;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.card-type {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-right: var(--spacing-sm);
  border-radius: 6px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.type-credit {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.type-debit {
  background: var(--color-secondary-20);
  color: var(--color-dark);
}

.annual-fee {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.benefit-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-sm);
  min-width: 120px;
  height: 100%;
  padding-top: var(--spacing-xs);
}

.benefit-amount {
  text-align: right;
}

.benefit-amount .amount {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-success);
}

.benefit-amount .label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.btn-apply {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-success);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-apply:hover {
  background: var(--color-success-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.recommendation-summary {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
  text-align: center;
}

.summary-text {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-recommendation-section {
    padding: var(--spacing-xl);
  }

  .recommendation-item {
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    min-height: 120px;
  }

  .card-image-container {
    width: 120px;
    height: 76px;
  }

  .card-image-container.vertical-image .card-image {
    height: 70px;
  }

  .card-image-container.horizontal-image .card-image {
    width: 100px;
  }

  .benefit-summary {
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);
  }

  .rank-badge {
    width: 30px;
    height: 30px;
    font-size: var(--font-size-sm);
  }

  .card-name {
    font-size: var(--font-size-lg);
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .card-recommendation-section {
    padding: var(--spacing-lg);
    border-radius: 12px;
  }

  .section-header {
    margin-bottom: var(--spacing-lg);
  }

  .section-header h3 {
    font-size: var(--font-size-lg);
  }

  .benefit-summary {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: 12px;
  }

  .current-benefit,
  .recommended-benefit {
    text-align: center;
  }

  .arrow {
    transform: rotate(90deg);
    align-self: center;
  }

  .improvement {
    align-self: center;
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .recommendation-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    min-height: auto;
    border-radius: 16px;
  }

  .card-info {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 0;
    gap: var(--spacing-md);
  }

  .card-image-container {
    width: 100px;
    height: 64px;
    flex-shrink: 0;
  }

  .card-image-container.vertical-image .card-image {
    height: 58px;
    width: auto;
  }

  .card-image-container.horizontal-image .card-image {
    width: 85px;
    height: auto;
  }

  .card-details {
    flex: 1;
    min-width: 0;
  }

  .benefit-info {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    height: auto;
    padding-top: 0;
    min-width: auto;
    width: 100%;
    margin-top: var(--spacing-xs);
  }

  .rank-badge {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-sm);
  }

  .card-name {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  .card-issuer {
    margin-bottom: var(--spacing-sm);
  }

  .card-specs {
    margin-bottom: var(--spacing-sm);
  }

  .benefit-amount .amount {
    font-size: var(--font-size-xl);
  }

  .btn-apply {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    border-radius: 12px;
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .card-recommendation-section {
    padding: var(--spacing-md);
    border-radius: 12px;
  }

  .section-header h3 {
    font-size: var(--font-size-base);
    gap: var(--spacing-xs);
  }

  .section-subtitle {
    font-size: var(--font-size-xs);
  }

  .benefit-summary {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .improvement {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .recommendation-item {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    border-radius: 12px;
  }

  .card-info {
    gap: var(--spacing-sm);
    flex-direction: column;
    align-items: flex-start;
  }

  .card-image-container {
    width: 100%;
    max-width: 160px;
    height: 64px;
    align-self: center;
  }

  .card-image-container.horizontal-image .card-image {
    width: 120px;
    height: auto;
  }

  .card-image-container.vertical-image .card-image {
    height: 58px;
    width: auto;
  }

  .card-details {
    width: 100%;
    text-align: center;
  }

  .benefit-info {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xs);
  }

  .benefit-amount {
    text-align: center;
  }

  .benefit-amount .amount {
    font-size: var(--font-size-lg);
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-xs);
  }

  .card-name {
    font-size: var(--font-size-base);
  }

  .btn-apply {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
    width: 100%;
    max-width: 200px;
  }
}
</style>
