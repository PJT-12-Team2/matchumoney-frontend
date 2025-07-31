<template>
  <div class="card-recommendations">
    <main class="main-content">
      <h2 class="page-title">마이데이터 기반 카드 추천</h2>

      <!-- 카드 연동 버튼 -->
      <div class="sync-section" v-if="!cards.length && !isLoading">
        <div class="sync-info">
          <p>CODEF를 통해 KB카드 정보를 연동하세요</p>
          <BaseButton variant="primary" @click="showSyncModal = true">
            카드 연동하기
          </BaseButton>
        </div>
      </div>

      <!-- 카드 슬라이더 -->
      <div class="card-slider" v-if="cards.length">
        <CardSlider
          :cards="cards"
          @cardChange="handleCardChange"
          @register="showSyncModal = true"
          @update="handleCardUpdate"
        />
      </div>

      <!-- 거래내역 로딩 상태 -->
      <div v-if="isLoadingTransactions" class="loading transactions-loading">
        <BaseSpinner size="md" color="accent" />
        <div>거래내역을 불러오고 있습니다...</div>
      </div>

      <!-- 거래내역이 있을 때: 통계와 목록 표시 -->
      <div
        v-else-if="syncedTransactions.length > 0"
        class="transactions-content"
      >
        <!-- Desktop: 좌우 배치, Mobile: 상하 배치 -->
        <div class="content-layout">
          <!-- 소비 패턴 차트 섹션 (먼저 표시) -->
          <div class="chart-section">
            <div class="section-header">
              <h3>
                {{ selectedSyncedCard?.cardName || "카드" }} 소비 패턴 TOP 5
              </h3>
            </div>
            <div class="pattern-chart">
              <SpendingPatternChart :transactions="syncedTransactions" />
            </div>
            <div class="chart-actions">
              <BaseButton
                variant="primary"
                @click="showTransactionDetails = true"
              >
                <i class="bi bi-bar-chart"></i>
                전체 통계 보기
              </BaseButton>
            </div>
          </div>

          <!-- 거래내역 목록 섹션 -->
          <div class="transactions-section">
            <div class="transactions-header">
              <h3>최근 거래내역</h3>
              <div class="transactions-summary">
                <span class="total-count"
                  >총 {{ syncedTransactions.length }}건</span
                >
                <BaseButton
                  variant="primary"
                  @click="showTransactionDetails = true"
                >
                  거래내역 더 보기
                </BaseButton>
              </div>
            </div>

            <div class="transactions-list">
              <div
                v-for="(transaction, index) in syncedTransactions.slice(0, 3)"
                :key="index"
                class="transaction-item"
              >
                <div class="transaction-info">
                  <div class="transaction-date">
                    {{ formatDate(transaction.transactionDate) }}
                  </div>
                  <div class="transaction-details">
                    <div class="merchant-name">
                      {{ transaction.merchantName }}
                    </div>
                    <div class="transaction-type">
                      {{
                        transaction.merchantCategory || transaction.paymentType
                      }}
                    </div>
                  </div>
                </div>
                <div
                  class="transaction-amount"
                  :class="getAmountClass(transaction.amount)"
                >
                  {{ formatAmount(transaction.amount) }}원
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 카드는 있지만 거래내역이 없을 때: 소비 패턴 기반 카드 추천 안내 -->
      <div
        v-else-if="cards.length > 0 && syncedTransactions.length === 0"
        class="recommendation-guide"
      >
        <div class="guide-content">
          <div class="guide-icon">
            <i class="icon-chart"></i>
          </div>
          <h3 class="guide-title">소비 패턴을 통해 카드를 추천받으세요</h3>
          <p class="guide-description">
            거래내역을 연동하시면 개인화된 카드 추천과 소비 분석을
            제공해드립니다.
          </p>
          <div class="guide-actions">
            <BaseButton
              v-if="cards.length > 0"
              variant="outline"
              full-width
              @click="
                showTransactionModal = true;
                selectedCard = cards[0];
              "
            >
              <i class="icon-sync"></i>
              거래내역 연동하기
            </BaseButton>
          </div>
        </div>

        <!-- 추천 프로세스 설명 -->
        <div class="process-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>거래내역 연동</h4>
              <p>안전한 마이데이터를 통해 거래내역을 불러옵니다</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>소비 패턴 분석</h4>
              <p>AI가 고객님의 소비 패턴을 자동으로 분석합니다</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>맞춤 카드 추천</h4>
              <p>소비 패턴에 최적화된 카드를 추천해드립니다</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading">
        <BaseSpinner size="lg" color="accent" />
        <div>카드 정보를 불러오고 있습니다...</div>
      </div>
    </main>

    <!-- 카드 동기화 모달 -->
    <CardSyncModal
      :isVisible="showSyncModal"
      @close="showSyncModal = false"
      @sync="handleCardSync"
    />

    <!-- 거래내역 동기화 모달 -->
    <TransactionSyncModal
      :isVisible="showTransactionModal"
      :cardInfo="selectedCard"
      @close="showTransactionModal = false"
      @sync="handleTransactionSync"
    />

    <!-- 거래내역 상세 모달 -->
    <TransactionDetailModal
      :isVisible="showTransactionDetails"
      :transactions="syncedTransactions"
      :cardInfo="selectedSyncedCard"
      @close="showTransactionDetails = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import DefaultLayout from "@/components/layouts/DefaultLayout.vue";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import CardSlider from "@/components/cards/CardSlider.vue";
import CardSyncModal from "@/components/cards/CardSyncModal.vue";
import TransactionSyncModal from "@/components/cards/TransactionSyncModal.vue";
import TransactionDetailModal from "@/components/cards/TransactionDetailModal.vue";
import SpendingPatternChart from "@/components/charts/SpendingPatternChart.vue";
import cardsApi from "@/api/cards";

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const isLoadingTransactions = ref(false);
const cards = ref([]);
const showSyncModal = ref(false);
const showTransactionModal = ref(false);
const selectedCard = ref(null);
const syncedTransactions = ref([]);
const selectedSyncedCard = ref(null);
const showTransactionDetails = ref(false);

const userId = computed(() => authStore.getUserId);

// 카드 목록 조회
const fetchCards = async () => {
  if (!userId.value) {
    console.error("사용자 ID가 없습니다. 로그인이 필요합니다.");
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  isLoading.value = true;
  try {
    // console.log("📋 카드 목록 조회 시작, userId:", userId.value);
    const response = await cardsApi.getUserCards(userId.value);
    // console.log("✅ 카드 목록 조회 성공:", response);

    cards.value = response.result || [];

    // if (cards.value.length === 0) {
    //   console.log("💡 등록된 카드가 없습니다.");
    // } else {
    //   console.log(`💡 ${cards.value.length}개의 카드를 불러왔습니다.`);
    // }
  } catch (error) {
    console.error("❌ 카드 목록 조회 실패:", error);

    if (error.response?.status === 401) {
      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      authStore.logout();
      router.push("/login");
    } else if (error.response?.status === 404) {
      // console.log("💡 사용자 카드 정보가 없습니다.");
      cards.value = [];
    } else {
      alert(
        `카드 목록을 불러오는데 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  } finally {
    isLoading.value = false;
  }
};

// 기존 거래내역 로드 (단순화된 버전)
const loadExistingTransactions = async (card) => {
  if (!card || !userId.value) return;

  isLoadingTransactions.value = true;

  try {
    console.log("📋 기존 거래내역 조회 시작:", {
      cardName: card.cardName,
      holdingId: card.holdingId,
      userId: userId.value,
    });

    const response = await cardsApi.getStoredCardTransactions(
      card.holdingId,
      userId.value
    );

    // console.log("✅ 거래내역 조회 성공:", response);

    // 백엔드에서 빈 배열을 반환하는 경우도 처리
    if (
      response.result &&
      Array.isArray(response.result) &&
      response.result.length > 0
    ) {
      syncedTransactions.value = response.result;
      selectedSyncedCard.value = card;
      // console.log(
      //   `💡 ${card.cardName} 카드의 ${response.result.length}건 거래내역을 로드했습니다.`
      // );
    } else {
      console.log(`💡 ${card.cardName} 카드의 저장된 거래내역이 없습니다.`);
      syncedTransactions.value = [];
      selectedSyncedCard.value = null;
    }
  } catch (error) {
    console.error("❌ 기존 거래내역 조회 실패:", error);

    if (error.response?.status === 404) {
      // console.log(
      //   `💡 ${card.cardName} 카드의 거래내역이 없습니다. 먼저 거래내역을 동기화해주세요.`
      // );
    } else {
      console.warn(
        `${card.cardName} 카드의 거래내역 조회에 실패했습니다:`,
        error.message
      );
    }

    // 에러 발생 시 빈 상태로 초기화
    syncedTransactions.value = [];
    selectedSyncedCard.value = null;
  } finally {
    isLoadingTransactions.value = false;
  }
};

// 카드 동기화
const handleCardSync = async (syncData) => {
  if (!userId.value) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    const requestData = {
      userId: parseInt(userId.value),
      cardId: syncData.cardId,
      cardPw: syncData.cardPw,
    };

    // console.log("🔄 카드 동기화 시작:", requestData);
    const response = await cardsApi.syncKbCards(requestData);
    // console.log("✅ 카드 동기화 완료:", response);

    alert(`${response.message || "카드 동기화가 완료되었습니다."}`);

    // 카드 동기화 모달 닫기
    showSyncModal.value = false;

    // 목록 새로고침
    await fetchCards();
  } catch (error) {
    console.error("❌ 카드 동기화 실패:", error);

    if (error.response?.status === 401) {
      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      authStore.logout();
      router.push("/login");
    } else if (error.response?.status === 400) {
      alert(
        "입력 정보가 올바르지 않습니다. 카드 ID와 비밀번호를 확인해주세요."
      );
    } else if (error.response?.status === 500) {
      alert("마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      alert(
        `카드 동기화에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

// 카드 슬라이더에서 카드 변경 시 거래내역 조회
const handleCardChange = async (card) => {
  // console.log("🔄 카드 변경:", card.cardName);
  await loadExistingTransactions(card);
};

// 카드 업데이트 (CardSyncModal 표시)
const handleCardUpdate = () => {
  // console.log("카드 업데이트 버튼 클릭 - CardSyncModal 표시");
  showSyncModal.value = true;
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return "-";

  // YYYYMMDD 형식을 MM/DD로 변환
  if (dateString.length === 8) {
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${parseInt(month)}/${parseInt(day)}`;
  }

  // 기존 Date 객체 방식도 유지
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 금액 포맷팅 함수
const formatAmount = (amount) => {
  if (!amount) return "0";
  return Math.abs(amount).toLocaleString();
};

// 금액에 따른 CSS 클래스 반환
const getAmountClass = (amount) => {
  if (!amount) return "";
  return amount < 0 ? "negative" : "positive";
};

// 거래내역 동기화 처리
const handleTransactionSync = async (transactionData) => {
  if (!selectedCard.value || !userId.value) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    console.log("🔄 거래내역 동기화 시작:", {
      holdingId: selectedCard.value.holdingId,
      transactionData,
    });

    const response = await cardsApi.syncCardTransactions(
      selectedCard.value.holdingId,
      transactionData
    );

    // console.log("✅ 거래내역 동기화 완료:", response);

    // 동기화된 거래내역 저장
    if (response.result && response.result.length > 0) {
      syncedTransactions.value = response.result;
      selectedSyncedCard.value = selectedCard.value;

      // 성공 메시지 표시
      alert(`${response.message || "거래내역 동기화가 완료되었습니다."}`);

      // 거래내역 동기화 모달 닫기
      showTransactionModal.value = false;

      // console.log(
      //   `💡 ${response.result.length}건의 거래내역이 동기화되어 즉시 표시됩니다.`
      // );
    } else {
      alert("거래내역이 없거나 동기화에 실패했습니다.");
    }
  } catch (error) {
    console.error("❌ 거래내역 동기화 실패:", error);

    if (error.response?.status === 401) {
      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      authStore.logout();
      router.push("/login");
    } else if (error.response?.status === 400) {
      alert(
        "입력 정보가 올바르지 않습니다. 카드 정보와 날짜 범위를 확인해주세요."
      );
    } else if (error.response?.status === 404) {
      alert("카드 정보를 찾을 수 없습니다.");
    } else if (error.response?.status === 500) {
      alert("마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      alert(
        `거래내역 동기화에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

onMounted(() => {
  fetchCards();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.card-recommendations {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background: var(--bg-content);
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

/* 연동 섹션 */
.sync-section {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-light);
  border-radius: 16px;
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--border-light);
}

.sync-info p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-base);
}

/* 카드 슬라이더 */
.card-slider {
  position: relative;
  margin-bottom: var(--spacing-2xl);
}

/* 거래내역 섹션 */
.transactions-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  /* height: 380px; */
  display: flex;
  flex-direction: column;
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md, 16px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}

.transactions-header h3 {
  font-size: var(--font-size-xl, 20px);
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin: 0;
}

.transactions-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

.total-count {
  font-size: var(--font-size-sm, 14px);
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
  flex: 1;
  justify-content: space-between;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 16px);
  background: var(--bg-light, #f8f9fa);
  border-radius: 12px;
  border: 1px solid var(--border-light, #e5e7eb);
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 1;
  min-height: 70px;
}

.transaction-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 8px);
}

.transaction-date {
  font-size: var(--font-size-sm, 14px);
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.merchant-name {
  font-size: var(--font-size-base, 16px);
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.transaction-type {
  font-size: var(--font-size-sm, 14px);
  color: var(--text-secondary, #6b7280);
}

.transaction-amount {
  font-size: var(--font-size-lg, 18px);
  font-weight: 700;
  text-align: right;
}

.transaction-amount.positive {
  color: var(--color-success, #059669);
}

.transaction-amount.negative {
  color: var(--color-error, #dc2626);
}

/* 추천 안내 섹션 */
.recommendation-guide {
  background: var(--gradient-accent);
  border-radius: 20px;
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  color: var(--color-white);
  text-align: center;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-dark-20);
}

.guide-content {
  margin-bottom: var(--spacing-2xl, 40px);
}

.guide-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg, 24px);
  font-size: 2.5rem;
  backdrop-filter: blur(10px);
}

.guide-icon .icon-chart::before {
  content: "📊";
}

.guide-title {
  font-size: var(--font-size-2xl, 24px);
  font-weight: 700;
  margin-bottom: var(--spacing-md, 16px);
  color: white;
}

.guide-description {
  font-size: var(--font-size-lg, 18px);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl, 30px);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.guide-actions {
  margin-bottom: var(--spacing-xl, 30px);
}

.sync-transaction-btn .icon-sync::before {
  content: "🔄";
  margin-right: var(--spacing-xs, 8px);
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg, 24px);
  max-width: 800px;
  margin: 0 auto;
}

.step-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: var(--spacing-lg, 24px);
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.step-item:hover {
  transform: translateY(-4px);
}

.step-number {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md, 16px);
  font-size: var(--font-size-lg, 18px);
  font-weight: 700;
  color: white;
}

.step-content h4 {
  font-size: var(--font-size-lg, 18px);
  font-weight: 600;
  color: white;
  margin-bottom: var(--spacing-xs, 8px);
}

.step-content p {
  font-size: var(--font-size-base, 16px);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
}

/* 거래내역 콘텐츠 전체 */
.transactions-content {
  width: 100%;
}

/* 콘텐츠 레이아웃 - 데스크탑: 좌우 배치 */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

/* 차트 섹션 */
.chart-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  /* height: 380px; */
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.chart-actions {
  margin-top: var(--spacing-md);
  text-align: center;
}

/* 로딩 애니메이션 */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--color-title, #636363);
}

.transactions-loading {
  background: var(--bg-card, #fff);
  border-radius: 16px;
  margin-bottom: var(--spacing-xl, 30px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light, #e5e7eb);
}

.pattern-chart {
  background: var(--color-white);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .card-recommendations {
    padding: var(--spacing-md);
  }

  .main-content {
    max-width: 100%;
  }

  .page-title {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-xl);
  }

  .sync-section {
    padding: var(--spacing-xl) var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .card-slider {
    margin-bottom: var(--spacing-xl);
  }

  /* 모바일: 상하 배치 */
  .content-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .chart-section,
  .transactions-section {
    height: auto;
    min-height: 320px;
    padding: var(--spacing-lg);
  }

  .section-header h3 {
    font-size: var(--font-size-lg);
  }

  .transactions-section {
    padding: var(--spacing-xl);
  }

  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .transactions-summary {
    width: 100%;
    justify-content: space-between;
  }

  .transaction-item {
    padding: var(--spacing-sm);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    min-height: 60px;
  }

  .transaction-info {
    width: 100%;
  }

  .transaction-amount {
    align-self: flex-end;
    font-size: var(--font-size-lg);
  }

  .merchant-name {
    font-size: var(--font-size-base);
  }

  .recommendation-guide {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .guide-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .guide-title {
    font-size: var(--font-size-xl);
  }

  .guide-description {
    font-size: var(--font-size-base);
  }

  .process-steps {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .step-item {
    padding: var(--spacing-md);
  }
}
</style>
