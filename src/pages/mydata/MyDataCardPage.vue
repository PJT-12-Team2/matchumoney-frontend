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

      <!-- KB카드 추천 (카드가 등록되지 않았을 때만 표시) -->
      <div v-if="!cards.length && !isLoading" class="kb-recommendation-section">
        <KbCardRecommendation />
      </div>

      <!-- 카드 슬라이더 -->
      <div class="card-slider" v-if="cards.length">
        <CardSlider
          :cards="cards"
          :cardTransactions="cardTransactionsMap"
          @cardChange="handleCardChange"
          @register="showSyncModal = true"
          @update="handleCardUpdate"
          @registerTransactions="handleRegisterTransactions"
          @updateTransactions="handleUpdateTransactions"
        />
      </div>

      <!-- 거래내역 로딩 상태 -->
      <div v-if="isLoadingTransactions" class="loading transactions-loading">
        <BaseSpinner size="md" color="accent" />
        <div>거래내역을 불러오고 있습니다...</div>
      </div>

      <!-- 거래내역이 있을 때: 탭과 콘텐츠 표시 -->
      <div
        v-else-if="syncedTransactions.length > 0"
        class="transactions-content"
      >
        <!-- 탭 버튼들 -->
        <div class="tab-buttons">
          <button
            @click="changeTab('recommendations')"
            :class="['tab-button', { active: activeTab === 'recommendations' }]"
          >
            <i class="bi bi-stars"></i>
            카드 추천
          </button>
          <button
            @click="changeTab('statistics')"
            :class="['tab-button', { active: activeTab === 'statistics' }]"
          >
            <i class="bi bi-bar-chart"></i>
            소비 통계
          </button>
          <button
            @click="changeTab('transactions')"
            :class="['tab-button', { active: activeTab === 'transactions' }]"
          >
            <i class="bi bi-list-ul"></i>
            거래 내역
          </button>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="tab-content">
          <!-- 카드 추천 탭 -->
          <div v-if="activeTab === 'recommendations'" class="tab-panel">
            <div class="recommendations-tab-content">
              <!-- 추천 요약 정보 -->
              <div class="recommendation-summary-card card">
                <div class="summary-header">
                  <h3>
                    <i class="bi bi-stars"></i>
                    {{ selectedSyncedCard?.cardName || '현재 카드' }} 추천 분석
                  </h3>
                  <div class="analysis-period">
                    <i class="bi bi-calendar3"></i>
                    최근 {{ ANALYSIS_PERIOD_DAYS }}일 분석
                  </div>
                </div>

                <div class="quick-stats">
                  <div class="stat-item">
                    <div class="stat-icon">💳</div>
                    <div class="stat-content">
                      <span class="stat-value"
                        >{{
                          formatCurrency(getRecommendationTotalSpendAmount())
                        }}원</span
                      >
                      <span class="stat-label">총 사용금액</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                      <span class="stat-value">{{
                        getRecommendationTopCategory()
                      }}</span>
                      <span class="stat-label">주요 소비 카테고리</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                      <span class="stat-value"
                        >{{ getTransactionCount() }}건</span
                      >
                      <span class="stat-label">총 거래 건수</span>
                    </div>
                  </div>
                  <div class="stat-item" v-if="getCurrentCardBenefit() > 0">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                      <span class="stat-value current-benefit"
                        >{{ formatCurrency(getCurrentCardBenefit()) }}원</span
                      >
                      <span class="stat-label">현재 카드 예상 혜택</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 메인 추천 섹션 -->
              <CardRecommendationSection
                :selectedCard="selectedSyncedCard"
                :hasTransactions="syncedTransactions.length > 0"
                @requestTransactionSync="handleRequestTransactionSync"
              />

              <!-- 추가 정보 섹션 -->
              <div class="additional-info">
                <div class="info-cards">
                  <div class="info-card">
                    <div class="info-header">
                      <i class="bi bi-lightbulb"></i>
                      <h4>추천 팁</h4>
                    </div>
                    <p>{{ getRecommendationTip() }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-header">
                      <i class="bi bi-graph-up"></i>
                      <h4>혜택 최적화</h4>
                    </div>
                    <p>
                      현재 소비 패턴을 기준으로 분석된 결과입니다. 더 많은
                      혜택을 받으려면 추천 카드를 확인해보세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 소비 통계 탭 -->
          <div v-else-if="activeTab === 'statistics'" class="tab-panel">
            <div class="statistics-content">
              <!-- 통계 필터 -->
              <div class="statistics-filters">
                <div class="filter-row">
                  <div class="filter-label">
                    <i class="bi bi-funnel"></i>
                    기간 선택:
                  </div>
                  <div class="filter-buttons">
                    <select
                      v-model="statisticsMonthFilter"
                      class="filter-select"
                    >
                      <option value="">전체 기간</option>
                      <option
                        v-for="month in getAvailableMonths()"
                        :key="month.value"
                        :value="month.value"
                      >
                        {{ month.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 통계 요약 -->
              <div class="statistics-summary">
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="summary-icon">💰</div>
                    <div class="summary-data">
                      <span class="summary-value"
                        >{{ formatCurrency(getTotalSpendAmount()) }}원</span
                      >
                      <span class="summary-label">총 사용금액</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-icon">📈</div>
                    <div class="summary-data">
                      <span class="summary-value"
                        >{{ formatCurrency(getAverageAmount()) }}원</span
                      >
                      <span class="summary-label">평균 사용금액</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-icon">🎯</div>
                    <div class="summary-data">
                      <span class="summary-value"
                        >{{ getTransactionCount() }}건</span
                      >
                      <span class="summary-label">총 거래건수</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-icon">📊</div>
                    <div class="summary-data">
                      <span class="summary-value"
                        >{{ getCategoriesCount() }}개</span
                      >
                      <span class="summary-label">사용 카테고리</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 메인 차트 섹션 -->
              <div class="chart-section">
                <div class="section-header">
                  <h3>
                    <i class="bi bi-pie-chart"></i>
                    {{ selectedSyncedCard?.cardName || '카드' }} 소비 패턴 TOP 5
                  </h3>
                  <div class="chart-period">
                    {{ getStatisticsPeriodText() }}
                  </div>
                </div>
                <div class="pattern-chart">
                  <SpendingPatternChart
                    :transactions="getStatisticsFilteredTransactions()"
                  />
                </div>
              </div>

              <!-- 상세 분석 -->
              <div class="detailed-analysis">
                <div class="analysis-grid">
                  <!-- 카테고리별 상세 -->
                  <div class="analysis-card">
                    <div class="analysis-header">
                      <h4>
                        <i class="bi bi-tags"></i>
                        카테고리별 분석
                      </h4>
                    </div>
                    <div class="category-list">
                      <div
                        v-for="(category, index) in getTopCategories()"
                        :key="index"
                        class="category-item"
                      >
                        <div class="category-info">
                          <span class="category-name">{{ category.name }}</span>
                          <span class="category-amount"
                            >{{ formatCurrency(category.amount) }}원</span
                          >
                        </div>
                        <div class="category-bar">
                          <div
                            class="category-fill"
                            :style="{ width: category.percentage + '%' }"
                          ></div>
                        </div>
                        <span class="category-percentage"
                          >{{ category.percentage }}%</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 시간대별 분석 -->
                  <div class="analysis-card">
                    <div class="analysis-header">
                      <h4>
                        <i class="bi bi-clock"></i>
                        결제 패턴 분석
                      </h4>
                    </div>
                    <div class="pattern-insights">
                      <div class="insight-item">
                        <span class="insight-label">가장 활발한 요일</span>
                        <span class="insight-value">{{
                          getMostActiveDay()
                        }}</span>
                      </div>
                      <div class="insight-item">
                        <span class="insight-label">평균 일일 사용액</span>
                        <span class="insight-value"
                          >{{ formatCurrency(getDailyAverage()) }}원</span
                        >
                      </div>
                      <div class="insight-item">
                        <span class="insight-label">최대 사용 금액</span>
                        <span class="insight-value"
                          >{{ formatCurrency(getMaxAmount()) }}원</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 거래 내역 탭 -->
          <div v-else-if="activeTab === 'transactions'" class="tab-panel">
            <div class="transactions-tab-content">
              <!-- 검색 및 필터 -->
              <div class="transaction-filters">
                <div class="filter-row">
                  <div class="search-box">
                    <i class="bi bi-search"></i>
                    <input
                      v-model="searchQuery"
                      placeholder="가맹점명 또는 카테고리 검색"
                      class="search-input"
                    />
                  </div>
                  <div class="filter-buttons">
                    <select v-model="monthFilter" class="filter-select">
                      <option value="">전체 기간</option>
                      <option
                        v-for="month in getAvailableMonths()"
                        :key="month.value"
                        :value="month.value"
                      >
                        {{ month.label }}
                      </option>
                    </select>
                    <select v-model="categoryFilter" class="filter-select">
                      <option value="">전체 카테고리</option>
                      <option
                        v-for="category in getUniqueCategories()"
                        :key="category"
                        :value="category"
                      >
                        {{ category }}
                      </option>
                    </select>
                    <select v-model="amountFilter" class="filter-select">
                      <option value="">전체 금액</option>
                      <option value="small">10만원 미만</option>
                      <option value="medium">10만원~50만원</option>
                      <option value="large">50만원 이상</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 거래내역 통계 요약 -->
              <div class="transaction-stats">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                      <span class="stat-number">{{
                        getAllTransactionCount()
                      }}</span>
                      <span class="stat-text">총 거래</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                      <span class="stat-number"
                        >{{ formatCurrency(getFilteredTotal()) }}원</span
                      >
                      <span class="stat-text">총 금액</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                      <span class="stat-number"
                        >{{ formatCurrency(getFilteredAverage()) }}원</span
                      >
                      <span class="stat-text">평균 금액</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 거래내역 목록 -->
              <div class="transactions-section">
                <div class="transactions-header">
                  <h3>
                    <i class="bi bi-list-ul"></i>
                    거래내역 목록
                  </h3>
                  <div class="transactions-summary">
                    <span class="total-count">
                      {{ getAllTransactionCount() }}개 거래 표시 중
                    </span>
                  </div>
                </div>

                <!-- 정렬 옵션 -->
                <div class="sort-options">
                  <div class="sort-buttons">
                    <button
                      @click="changeSortOrder('date')"
                      :class="['sort-btn', { active: sortBy === 'date' }]"
                    >
                      <i class="bi bi-calendar"></i>
                      날짜순
                    </button>
                    <button
                      @click="changeSortOrder('amount')"
                      :class="['sort-btn', { active: sortBy === 'amount' }]"
                    >
                      <i class="bi bi-currency-dollar"></i>
                      금액순
                    </button>
                    <button
                      @click="changeSortOrder('merchant')"
                      :class="['sort-btn', { active: sortBy === 'merchant' }]"
                    >
                      <i class="bi bi-shop"></i>
                      가맹점순
                    </button>
                  </div>
                </div>

                <div class="transactions-list">
                  <div
                    v-for="(transaction, index) in getPaginatedTransactions()"
                    :key="index"
                    class="transaction-item enhanced"
                  >
                    <div class="transaction-info">
                      <div class="transaction-main">
                        <div class="transaction-date">
                          <i class="bi bi-calendar3"></i>
                          {{ formatDate(transaction.transactionDate) }}
                        </div>
                        <div class="transaction-details">
                          <div class="merchant-name">
                            <i class="bi bi-shop"></i>
                            {{ transaction.merchantName }}
                          </div>
                          <div class="transaction-type">
                            <i class="bi bi-tag"></i>
                            {{
                              transaction.merchantCategory ||
                              transaction.paymentType ||
                              '기타'
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="transaction-meta">
                        <span class="transaction-time">
                          {{ formatTime(transaction.transactionDate) }}
                        </span>
                        <span class="transaction-status">
                          <i class="bi bi-check-circle text-success"></i>
                          완료
                        </span>
                      </div>
                    </div>
                    <div class="transaction-amount-section">
                      <div
                        class="transaction-amount"
                        :class="getAmountClass(transaction.amount)"
                      >
                        {{ formatAmount(transaction.amount) }}원
                      </div>
                      <div class="amount-details">
                        <span class="payment-method">
                          <i class="bi bi-credit-card"></i>
                          {{ selectedSyncedCard?.cardName || '카드' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 페이지네이션 -->
                <div class="pagination" v-if="getTotalPages() > 1">
                  <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage <= 1"
                    class="page-btn"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <span class="page-info">
                    {{ currentPage }} / {{ getTotalPages() }}
                  </span>
                  <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage >= getTotalPages()"
                    class="page-btn"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>

                <!-- 액션 버튼 -->
                <div class="transaction-actions">
                  <BaseButton variant="outline" @click="exportTransactions">
                    <i class="bi bi-download"></i>
                    거래내역 내보내기
                  </BaseButton>
                  <BaseButton variant="outline" @click="syncTransactions">
                    <i class="bi bi-arrow-clockwise"></i>
                    새로고침
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 카드는 있지만 거래내역이 없을 때: 소비 패턴 기반 카드 추천 안내 -->
      <div
        v-else-if="cards.length > 0 && syncedTransactions.length === 0"
        class="recommendation-guide card"
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
              <p>맞추머니가 고객님의 소비 패턴을 자동으로 분석합니다</p>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/components/layouts/DefaultLayout.vue';
import BaseSpinner from '@/components/base/BaseSpinner.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import CardSlider from '@/components/cards/CardSlider.vue';
import CardSyncModal from '@/components/cards/CardSyncModal.vue';
import TransactionSyncModal from '@/components/cards/TransactionSyncModal.vue';
import SpendingPatternChart from '@/components/charts/SpendingPatternChart.vue';
import CardRecommendationSection from '@/components/cards/CardRecommendationSection.vue';
import cardsApi from '@/api/cards';
import KbCardRecommendation from '@/components/cards/KbCardRecommendation.vue';

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
const activeTab = ref('recommendations'); // 'recommendations', 'statistics', 'transactions'
const currentCardBenefits = ref(null); // 현재 카드의 혜택 정보
const cardTransactionsMap = ref({}); // 카드별 거래내역 매핑

// 분석 기간 상수
const ANALYSIS_PERIOD_DAYS = 30;

// 날짜 필터링 함수 - 최근 30일 데이터만 추출
const getFilteredTransactionsByDate = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(
    today.getTime() - ANALYSIS_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  return syncedTransactions.value.filter((transaction) => {
    if (!transaction.transactionDate) return false;

    // YYYYMMDD 형식을 Date 객체로 변환
    const dateStr = transaction.transactionDate.toString();
    if (dateStr.length !== 8) return false;

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 월은 0부터 시작
    const day = parseInt(dateStr.substring(6, 8));
    const transactionDate = new Date(year, month, day);

    // 최근 30일 내 거래인지 확인
    return transactionDate >= thirtyDaysAgo && transactionDate <= today;
  });
};

// 거래내역 필터링 및 검색
const searchQuery = ref('');
const monthFilter = ref('');
const statisticsMonthFilter = ref('');
const categoryFilter = ref('');
const amountFilter = ref('');
const sortBy = ref('date');
const currentPage = ref(1);
const itemsPerPage = 10;

const userId = computed(() => authStore.getUserId());

// 카드 목록 조회
const fetchCards = async () => {
  if (!userId.value) {
    console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
    alert('로그인이 필요합니다.');
    router.push('/login');
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
    console.error('❌ 카드 목록 조회 실패:', error);

    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
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

// 현재 카드 혜택 조회
const loadCurrentCardBenefits = async (card) => {
  if (!card || !card.cardId) return;

  try {
    console.log('💰 현재 카드 혜택 조회 시작:', card.cardId);
    const response = await cardsApi.getCardBenefits(card.cardId);
    currentCardBenefits.value = response.data || response;
    console.log('✅ 현재 카드 혜택 조회 완료:', currentCardBenefits.value);
  } catch (error) {
    console.error('❌ 현재 카드 혜택 조회 실패:', error);
    currentCardBenefits.value = null;
  }
};

// 기존 거래내역 로드 (단순화된 버전)
const loadExistingTransactions = async (card) => {
  if (!card || !userId.value) return;

  isLoadingTransactions.value = true;

  try {
    console.log('📋 기존 거래내역 조회 시작:', {
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

      // 카드별 거래내역 매핑 업데이트
      const cardKey = card.holdingId || card.cardId;
      cardTransactionsMap.value[cardKey] = response.result;

      // console.log(
      //   `💡 ${card.cardName} 카드의 ${response.result.length}건 거래내역을 로드했습니다.`
      // );
    } else {
      console.log(`💡 ${card.cardName} 카드의 저장된 거래내역이 없습니다.`);
      syncedTransactions.value = [];
      selectedSyncedCard.value = null;

      // 카드별 거래내역 매핑에서 제거
      const cardKey = card.holdingId || card.cardId;
      delete cardTransactionsMap.value[cardKey];
    }
  } catch (error) {
    console.error('❌ 기존 거래내역 조회 실패:', error);

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
    alert('로그인이 필요합니다.');
    router.push('/login');
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

    alert(`${response.message || '카드 동기화가 완료되었습니다.'}`);

    // 카드 동기화 모달 닫기
    showSyncModal.value = false;

    // 목록 새로고침
    await fetchCards();
  } catch (error) {
    console.error('❌ 카드 동기화 실패:', error);

    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 400) {
      alert(
        '입력 정보가 올바르지 않습니다. 카드 ID와 비밀번호를 확인해주세요.'
      );
    } else if (error.response?.status === 500) {
      alert('마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert(
        `카드 동기화에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

// 카드 슬라이더에서 카드 변경 시 거래내역 및 카드 혜택 조회
const handleCardChange = async (card) => {
  // console.log("🔄 카드 변경:", card.cardName);
  await Promise.all([
    loadExistingTransactions(card),
    loadCurrentCardBenefits(card),
  ]);
};

// 카드 업데이트 (CardSyncModal 표시)
const handleCardUpdate = () => {
  // console.log("카드 업데이트 버튼 클릭 - CardSyncModal 표시");
  showSyncModal.value = true;
};

// 거래내역 등록 핸들러
const handleRegisterTransactions = (card) => {
  console.log('📝 거래내역 등록:', card.cardName);
  selectedCard.value = card;
  showTransactionModal.value = true;
};

// 거래내역 업데이트 핸들러
const handleUpdateTransactions = (card) => {
  console.log('🔄 거래내역 업데이트:', card.cardName);
  selectedCard.value = card;
  showTransactionModal.value = true;
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '-';

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
  if (!amount) return '0';
  return Math.abs(amount).toLocaleString();
};

// 금액에 따른 CSS 클래스 반환
const getAmountClass = (amount) => {
  if (!amount) return '';
  return amount < 0 ? 'negative' : 'positive';
};

// 탭 변경 처리
const changeTab = (tabName) => {
  activeTab.value = tabName;
};

// 카드 추천 섹션에서 거래내역 동기화 요청 처리
const handleRequestTransactionSync = () => {
  if (cards.value.length > 0) {
    selectedCard.value = cards.value[0];
    showTransactionModal.value = true;
  }
};

// 거래내역 동기화 처리
const handleTransactionSync = async (transactionData) => {
  if (!selectedCard.value || !userId.value) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    console.log('🔄 거래내역 동기화 시작:', {
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

      // 카드별 거래내역 매핑 업데이트
      const cardKey = selectedCard.value.holdingId || selectedCard.value.cardId;
      cardTransactionsMap.value[cardKey] = response.result;

      // 성공 메시지 표시
      alert(`${response.message || '거래내역 동기화가 완료되었습니다.'}`);

      // 거래내역 동기화 모달 닫기
      showTransactionModal.value = false;

      // console.log(
      //   `💡 ${response.result.length}건의 거래내역이 동기화되어 즉시 표시됩니다.`
      // );
    } else {
      alert('거래내역이 없거나 동기화에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 거래내역 동기화 실패:', error);

    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 400) {
      alert(
        '입력 정보가 올바르지 않습니다. 카드 정보와 날짜 범위를 확인해주세요.'
      );
    } else if (error.response?.status === 404) {
      alert('카드 정보를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      alert('마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert(
        `거래내역 동기화에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

// 통계 탭용 - 월별 필터링이 적용된 데이터
const getStatisticsFilteredTransactions = () => {
  let filtered = [...syncedTransactions.value];

  // 월별 필터가 적용된 경우
  if (statisticsMonthFilter.value) {
    filtered = filtered.filter((transaction) => {
      if (!transaction.transactionDate) return false;

      let date;
      const dateStr = transaction.transactionDate.toString();
      if (dateStr.length === 8) {
        // YYYYMMDD 형식
        date = new Date(
          dateStr.substr(0, 4),
          parseInt(dateStr.substr(4, 2)) - 1,
          dateStr.substr(6, 2)
        );
      } else {
        // 기타 형식
        date = new Date(transaction.transactionDate);
      }

      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const transactionMonthKey = `${year}-${month
          .toString()
          .padStart(2, '0')}`;
        return transactionMonthKey === statisticsMonthFilter.value;
      }
      return false;
    });
  } else {
    // 월별 필터가 없으면 기본 30일 필터 적용
    filtered = getFilteredTransactionsByDate();
  }

  return filtered;
};

// 통계 기간 텍스트 반환
const getStatisticsPeriodText = () => {
  if (statisticsMonthFilter.value) {
    const monthData = getAvailableMonths().find(
      (m) => m.value === statisticsMonthFilter.value
    );
    return monthData ? monthData.label : '선택된 기간';
  }
  return `최근 ${ANALYSIS_PERIOD_DAYS}일`;
};

// 카드 추천용 - 항상 최근 30일 데이터만 사용 (고정)
const getRecommendationTotalSpendAmount = () => {
  const filteredTransactions = getFilteredTransactionsByDate();
  return filteredTransactions.reduce((total, transaction) => {
    return total + Math.abs(transaction.amount || 0);
  }, 0);
};

const getRecommendationTopCategory = () => {
  const categoryTotals = {};
  const filteredTransactions = getFilteredTransactionsByDate();
  filteredTransactions.forEach((transaction) => {
    const category =
      transaction.merchantCategory || transaction.paymentType || '기타';
    const amount = Math.abs(transaction.amount || 0);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );
  return sortedCategories.length > 0 ? sortedCategories[0][0] : '없음';
};

const getRecommendationTip = () => {
  const topCategory = getRecommendationTopCategory();
  const tips = {
    편의점:
      '편의점 이용이 많으시네요! 편의점 할인 혜택이 있는 카드를 확인해보세요.',
    마트: '마트 사용이 많으시네요! 생활용품 구매 시 할인 혜택이 있는 카드를 추천합니다.',
    '음식/카페':
      '외식이 많으시네요! 음식점 할인이나 적립 혜택이 있는 카드를 추천합니다.',
    교통: '교통비 지출이 많으시네요! 대중교통 할인 카드를 확인해보세요.',
    온라인쇼핑:
      '온라인 쇼핑을 자주 이용하시네요! 온라인 결제 혜택이 있는 카드를 추천합니다.',
  };
  return (
    tips[topCategory] ||
    '다양한 혜택을 비교해보시고 본인의 소비 패턴에 가장 적합한 카드를 선택하세요.'
  );
};

// 데이터 분석 헬퍼 메서드들 (월별 필터 또는 최근 30일 데이터 사용)
const getTotalSpendAmount = () => {
  const filteredTransactions = getStatisticsFilteredTransactions();
  return filteredTransactions.reduce((total, transaction) => {
    return total + Math.abs(transaction.amount || 0);
  }, 0);
};

const getAverageAmount = () => {
  const total = getTotalSpendAmount();
  const filteredTransactions = getStatisticsFilteredTransactions();
  const count = filteredTransactions.length;
  return count > 0 ? Math.round(total / count) : 0;
};

const getTransactionCount = () => {
  const filteredTransactions = getStatisticsFilteredTransactions();
  return filteredTransactions.length;
};

const getCategoriesCount = () => {
  const categories = new Set();
  const filteredTransactions = getStatisticsFilteredTransactions();
  filteredTransactions.forEach((transaction) => {
    const category =
      transaction.merchantCategory || transaction.paymentType || '기타';
    categories.add(category);
  });
  return categories.size;
};

const getTopCategory = () => {
  const categoryTotals = {};
  const filteredTransactions = getStatisticsFilteredTransactions();
  filteredTransactions.forEach((transaction) => {
    const category =
      transaction.merchantCategory || transaction.paymentType || '기타';
    const amount = Math.abs(transaction.amount || 0);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  return sortedCategories.length > 0 ? sortedCategories[0][0] : '없음';
};

const getTopCategories = () => {
  const categoryTotals = {};
  const total = getTotalSpendAmount();
  const filteredTransactions = getStatisticsFilteredTransactions();

  filteredTransactions.forEach((transaction) => {
    const category =
      transaction.merchantCategory || transaction.paymentType || '기타';
    const amount = Math.abs(transaction.amount || 0);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });

  return Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

const getMostActiveDay = () => {
  const dayTotals = {};
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const filteredTransactions = getStatisticsFilteredTransactions();

  filteredTransactions.forEach((transaction) => {
    if (transaction.transactionDate) {
      const dateStr = transaction.transactionDate.toString();
      const date = new Date(
        dateStr.substr(0, 4),
        parseInt(dateStr.substr(4, 2)) - 1,
        dateStr.substr(6, 2)
      );
      const dayName = days[date.getDay()];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + 1;
    }
  });

  const sortedDays = Object.entries(dayTotals).sort((a, b) => b[1] - a[1]);

  return sortedDays.length > 0 ? `${sortedDays[0][0]}요일` : '없음';
};

const getDailyAverage = () => {
  const total = getTotalSpendAmount();
  return Math.round(total / ANALYSIS_PERIOD_DAYS);
};

const getMaxAmount = () => {
  const filteredTransactions = getStatisticsFilteredTransactions();
  return filteredTransactions.reduce((max, transaction) => {
    const amount = Math.abs(transaction.amount || 0);
    return amount > max ? amount : max;
  }, 0);
};

// 거래내역 필터링 메서드들 (전체 데이터 기준)
const getUniqueCategories = () => {
  const categories = new Set();
  syncedTransactions.value.forEach((transaction) => {
    const category =
      transaction.merchantCategory || transaction.paymentType || '기타';
    categories.add(category);
  });
  return Array.from(categories).sort();
};

// 사용 가능한 월 목록 생성 (실제 거래내역 데이터 기반)
const getAvailableMonths = () => {
  const months = new Set();

  syncedTransactions.value.forEach((transaction) => {
    if (transaction.transactionDate) {
      let date;

      // 다양한 날짜 형식 처리 (YYYYMMDD, ISO string, etc.)
      const dateStr = transaction.transactionDate.toString();
      if (dateStr.length === 8) {
        // YYYYMMDD 형식
        date = new Date(
          dateStr.substr(0, 4),
          parseInt(dateStr.substr(4, 2)) - 1,
          dateStr.substr(6, 2)
        );
      } else {
        // 기타 형식
        date = new Date(transaction.transactionDate);
      }

      // 유효한 날짜인지 확인
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        months.add(monthKey);
      }
    }
  });

  return Array.from(months)
    .sort((a, b) => b.localeCompare(a)) // 최신순 정렬
    .map((monthKey) => {
      const [year, month] = monthKey.split('-');
      return {
        value: monthKey,
        label: `${year}년 ${parseInt(month)}월`,
      };
    });
};

// 거래내역 탭용 - 전체 60일 데이터에서 사용자 검색/필터 조건만 적용
const getAllFilteredTransactions = () => {
  let filtered = [...syncedTransactions.value];

  // 월별 필터
  if (monthFilter.value) {
    filtered = filtered.filter((transaction) => {
      if (!transaction.transactionDate) return false;

      let date;
      const dateStr = transaction.transactionDate.toString();
      if (dateStr.length === 8) {
        // YYYYMMDD 형식
        date = new Date(
          dateStr.substr(0, 4),
          parseInt(dateStr.substr(4, 2)) - 1,
          dateStr.substr(6, 2)
        );
      } else {
        // 기타 형식
        date = new Date(transaction.transactionDate);
      }

      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const transactionMonthKey = `${year}-${month
          .toString()
          .padStart(2, '0')}`;
        return transactionMonthKey === monthFilter.value;
      }
      return false;
    });
  }

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (transaction) =>
        (transaction.merchantName || '').toLowerCase().includes(query) ||
        (transaction.merchantCategory || '').toLowerCase().includes(query) ||
        (transaction.paymentType || '').toLowerCase().includes(query)
    );
  }

  // 카테고리 필터
  if (categoryFilter.value) {
    filtered = filtered.filter((transaction) => {
      const category =
        transaction.merchantCategory || transaction.paymentType || '기타';
      return category === categoryFilter.value;
    });
  }

  // 금액 필터
  if (amountFilter.value) {
    filtered = filtered.filter((transaction) => {
      const amount = Math.abs(transaction.amount || 0);
      switch (amountFilter.value) {
        case 'small':
          return amount < 100000;
        case 'medium':
          return amount >= 100000 && amount <= 500000;
        case 'large':
          return amount > 500000;
        default:
          return true;
      }
    });
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'amount':
        return Math.abs(b.amount || 0) - Math.abs(a.amount || 0);
      case 'merchant':
        return (a.merchantName || '').localeCompare(b.merchantName || '');
      case 'date':
      default:
        return (b.transactionDate || '').localeCompare(a.transactionDate || '');
    }
  });

  return filtered;
};

// 통계용 - 최근 30일 데이터에서 사용자 검색/필터 조건 적용 (기존 함수명 유지)
const getFilteredTransactions = () => {
  // 먼저 최근 30일 데이터로 필터링
  let filtered = [...getFilteredTransactionsByDate()];

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (transaction) =>
        (transaction.merchantName || '').toLowerCase().includes(query) ||
        (transaction.merchantCategory || '').toLowerCase().includes(query) ||
        (transaction.paymentType || '').toLowerCase().includes(query)
    );
  }

  // 카테고리 필터
  if (categoryFilter.value) {
    filtered = filtered.filter((transaction) => {
      const category =
        transaction.merchantCategory || transaction.paymentType || '기타';
      return category === categoryFilter.value;
    });
  }

  // 금액 필터
  if (amountFilter.value) {
    filtered = filtered.filter((transaction) => {
      const amount = Math.abs(transaction.amount || 0);
      switch (amountFilter.value) {
        case 'small':
          return amount < 100000;
        case 'medium':
          return amount >= 100000 && amount <= 500000;
        case 'large':
          return amount > 500000;
        default:
          return true;
      }
    });
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'amount':
        return Math.abs(b.amount || 0) - Math.abs(a.amount || 0);
      case 'merchant':
        return (a.merchantName || '').localeCompare(b.merchantName || '');
      case 'date':
      default:
        return (b.transactionDate || '').localeCompare(a.transactionDate || '');
    }
  });

  return filtered;
};

const getFilteredTotal = () => {
  return getFilteredTransactions().reduce((total, transaction) => {
    return total + Math.abs(transaction.amount || 0);
  }, 0);
};

const getFilteredAverage = () => {
  const filtered = getFilteredTransactions();
  const total = getFilteredTotal();
  return filtered.length > 0 ? Math.round(total / filtered.length) : 0;
};

const getPaginatedTransactions = () => {
  const filtered = getAllFilteredTransactions(); // 거래내역 탭에서는 전체 데이터 사용
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
};

const getTotalPages = () => {
  return Math.ceil(getAllFilteredTransactions().length / itemsPerPage); // 거래내역 탭에서는 전체 데이터 사용
};

// 거래내역 탭용 - 전체 데이터 기준 통계
const getAllTransactionCount = () => {
  return getAllFilteredTransactions().length;
};

const getAllFilteredTotal = () => {
  return getAllFilteredTransactions().reduce((total, transaction) => {
    return total + Math.abs(transaction.amount || 0);
  }, 0);
};

const getAllFilteredAverage = () => {
  const filtered = getAllFilteredTransactions();
  const total = getAllFilteredTotal();
  return filtered.length > 0 ? Math.round(total / filtered.length) : 0;
};

const changeSortOrder = (newSortBy) => {
  sortBy.value = newSortBy;
  currentPage.value = 1;
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= getTotalPages()) {
    currentPage.value = newPage;
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  // YYYYMMDD 형식에서 시간은 없으므로 기본값 반환
  return '오전';
};

// YYYY-MM-DD 로 변환 (거래내역의 YYYYMMDD 지원)
const formatDateISO = (dateString) => {
  if (!dateString) return '';
  const s = String(dateString);
  if (s.length === 8) {
    const y = s.substring(0, 4);
    const m = s.substring(4, 6);
    const d = s.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// CSV 안전 이스케이프
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // 큰따옴표 이스케이프
  const escaped = str.replace(/"/g, '""');
  // 콤마/개행/따옴표가 있으면 감싸기
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
};

const toCSV = (rows) => {
  // Excel 한글 깨짐 방지용 BOM 포함
  const header = '\uFEFF';
  const body = rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  return header + body;
};

const downloadCSV = (filename, csvText) => {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 액션 메서드들

const exportTransactions = () => {
  // 현재 거래내역 탭에서 적용된 "검색/필터/정렬" 결과 전체를 내보냅니다 (페이지네이션과 무관)
  const data = getAllFilteredTransactions();

  if (!data || data.length === 0) {
    alert(
      '내보낼 거래내역이 없습니다. 먼저 거래내역을 불러오거나 필터를 해제해주세요.'
    );
    return;
  }

  const cardName = selectedSyncedCard.value?.cardName || '카드';
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const filename = `거래내역_${cardName}_${yyyy}-${mm}-${dd}.csv`;

  // CSV 헤더
  const rows = [
    [
      '거래일자',
      '거래시간',
      '가맹점명',
      '카테고리',
      '금액(원)',
      '결제수단',
      '상태',
    ],
  ];

  // 데이터 행
  for (const t of data) {
    const date = formatDateISO(t.transactionDate);
    const time = formatTime(t.transactionDate) || '';
    const merchant = t.merchantName || '';
    const category = t.merchantCategory || t.paymentType || '기타';
    const amountAbs = Math.abs(t.amount || 0);
    const amountStr = amountAbs.toLocaleString();
    const payment = selectedSyncedCard.value?.cardName || '카드';
    const status = '완료';

    rows.push([date, time, merchant, category, amountStr, payment, status]);
  }

  const csv = toCSV(rows);
  downloadCSV(filename, csv);
};

const syncTransactions = () => {
  // 거래내역 새로고침 로직
  if (selectedSyncedCard.value) {
    loadExistingTransactions(selectedSyncedCard.value);
  }
};

const formatCurrency = (amount) => {
  if (!amount) return '0';
  return Number(amount).toLocaleString();
};

const getCurrentCardBenefit = () => {
  // 현재 카드의 예상 혜택 반환
  if (currentCardBenefits.value?.ownedCardBenefits?.length > 0) {
    return currentCardBenefits.value.ownedCardBenefits[0].estimatedBenefit;
  }
  return 0;
};

onMounted(() => {
  fetchCards();
});
</script>

<style scoped>
.card-recommendations {
  color: var(--text-primary);
  line-height: 1.6;
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-lg);
}

.main-content {
  max-width: 80%;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

/* 연동 섹션 - main.css card 클래스 사용 */
.sync-section {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-light);
  border-radius: 16px;
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--border-light);
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

/* 추천 안내 섹션 - card 클래스와 gradient 결합 */
.recommendation-guide {
  background: var(--color-primary);
  color: var(--color-black);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
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
  content: '📊';
}

.guide-title {
  font-size: var(--font-size-2xl, 24px);
  font-weight: 700;
  margin-bottom: var(--spacing-md, 16px);
  color: var(--color-black);
}

.guide-description {
  font-size: var(--font-size-lg, 18px);
  color: var(--color-black);
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
  content: '🔄';
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
  border-radius: 16px;
  padding: var(--spacing-lg, 24px);
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-black);
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
  color: var(--color-black);
}

.step-content h4 {
  font-size: var(--font-size-lg, 18px);
  font-weight: 600;
  color: var(--color-black);
  margin-bottom: var(--spacing-xs, 8px);
}

.step-content p {
  font-size: var(--font-size-base, 16px);
  color: var(--color-black);
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

/* 로딩 애니메이션 */
.loading {
  color: var(--color-title);
}

.transactions-loading {
  background: var(--bg-card);
  border-radius: 16px;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.pattern-chart {
  background: var(--color-white);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  flex: 1;
}

/* 탭 버튼 스타일링 - main.css 변수 활용 */
.tab-buttons {
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: var(--color-secondary-10);
  color: var(--color-accent);
}

.tab-button.active {
  background: var(--color-primary);
  color: var(--color-black);
  box-shadow: 0 2px px rgba(33, 150, 243, 0.3);
}

.tab-button i {
  font-size: 16px;
}

/* 탭 콘텐츠 스타일링 */
.tab-content {
  width: 100%;
}

.tab-panel {
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 통계 콘텐츠 스타일링 */
.statistics-content {
  width: 100%;
}

/* 카드 추천 탭 상세 스타일링 */
.recommendations-tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.recommendation-summary-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.summary-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.analysis-period {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-light);
  padding: 4px 8px;
  border-radius: 6px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: 8px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.current-benefit {
  color: #4caf50;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.additional-info {
  margin-top: var(--spacing-xl);
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.info-card {
  background: var(--bg-card);
  border-radius: 8px;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--spacing-sm);
}

.info-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.info-card p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 소비 통계 탭 상세 스타일링 */
.statistics-filters {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.statistics-filters .filter-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.statistics-filters .filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.statistics-summary {
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: 8px;
}

.summary-icon {
  font-size: 32px;
}

.summary-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.chart-period {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-light);
  padding: 4px 8px;
  border-radius: 6px;
}

.detailed-analysis {
  margin-top: var(--spacing-xl);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

.analysis-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
}

.analysis-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-light);
  border-radius: 6px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  width: 120px;
  font-size: var(--font-size-sm);
}

.category-name {
  font-weight: 500;
  color: var(--text-primary);
}

.category-amount {
  color: var(--text-secondary);
}

.category-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transition: width 0.3s ease;
}

.category-percentage {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-black);
  min-width: 35px;
  text-align: right;
}

.pattern-insights {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.insight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-light);
  border-radius: 6px;
}

.insight-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.insight-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

/* 거래내역 탭 상세 스타일링 */
.transactions-tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.transaction-filters {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.filter-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  background: var(--bg-light);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: var(--font-size-sm);
  background: var(--bg-light);
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.transaction-stats {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: 8px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.sort-options {
  margin: var(--spacing-md) 0;
}

.sort-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-light);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--color-primary);
}

.sort-btn.active {
  background: var(--color-primary);
  color: var(--color-black);
  border-color: var(--color-primary);
}

.transaction-item.enhanced {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.transaction-item.enhanced:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.transaction-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.transaction-date i,
.merchant-name i,
.transaction-type i {
  margin-right: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.transaction-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
  margin-top: var(--spacing-xs);
}

.transaction-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.transaction-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-success);
}

.transaction-amount-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-light);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.transaction-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-top: var(--spacing-lg);
}

/* 카드 추천 섹션 스타일링 */
.card-recommendation-section {
  width: 100%;
}

/* KB카드 추천 섹션 스타일링 */
.kb-recommendation-section {
  margin-bottom: var(--spacing-2xl);
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

  .kb-recommendation-section {
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

  /* 탭 버튼 모바일 스타일 */
  .tab-buttons {
    margin-bottom: var(--spacing-lg);
  }

  .tab-button {
    padding: 10px 12px;
    font-size: var(--font-size-sm);
  }

  .tab-button i {
    font-size: 14px;
  }

  /* 카드 추천 탭 모바일 */
  .quick-stats {
    grid-template-columns: 1fr;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  /* 소비 통계 탭 모바일 */
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  /* 거래내역 탭 모바일 */
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-buttons {
    justify-content: stretch;
  }

  .filter-select {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .sort-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .transaction-item.enhanced {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .transaction-amount-section {
    align-items: flex-start;
  }

  .transaction-actions {
    flex-direction: column;
  }
}
</style>
