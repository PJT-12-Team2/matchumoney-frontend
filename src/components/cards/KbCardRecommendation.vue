<template>
  <div class="kb-card-recommendation">
    <div class="recommendation-header">
      <div class="header-content">
        <img
          src="@/assets/bankLogo_images/kb.png"
          alt="KB국민카드"
          class="kb-logo"
        />
        <div class="header-text">
          <h3>KB국민카드 추천</h3>
          <p>신청 가능한 KB국민카드를 확인해보세요</p>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-container">
      <BaseSpinner size="md" color="accent" />
      <p>KB국민카드 추천을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <i class="bi bi-exclamation-triangle error-icon"></i>
      <p>KB국민카드 추천을 불러올 수 없습니다.</p>
      <BaseButton
        variant="outline"
        size="sm"
        @click="loadKbRecommendations"
        class="retry-button"
      >
        다시 시도
      </BaseButton>
    </div>

    <!-- 추천 카드 목록 -->
    <div v-else-if="kbCards.length > 0" class="cards-container">
      <div class="cards-list">
        <KbCardListItem
          v-for="(card, index) in kbCards"
          :key="card.cardProductId"
          :card="card"
          :index="index"
          @apply="handleCardApply"
          @click="handleCardClick"
        />
      </div>

      <!-- 무한스크롤 로딩 -->
      <div v-if="isLoadingMore" class="infinite-loading">
        <BaseSpinner size="md" color="accent" />
        <p>더 많은 카드를 불러오는 중...</p>
      </div>
    </div>

    <!-- 추천 카드가 없는 경우 -->
    <div v-else class="no-cards-container">
      <i class="bi bi-card-list no-cards-icon"></i>
      <p>현재 추천할 수 있는 KB국민카드가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import cardsApi from '@/api/cards.js';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseSpinner from '@/components/base/BaseSpinner.vue';
import KbCardListItem from './KbCardListItem.vue';

// 반응형 데이터
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref(null);
const kbCards = ref([]);
const hasNext = ref(true);
const nextCursor = ref(null);
const pageSize = 6; // 6개씩 로드

// 스크롤 이벤트 핸들러
const onScroll = async () => {
  if (isLoadingMore.value || !hasNext.value) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const viewport = window.innerHeight;
  const full = document.documentElement.scrollHeight;
  if (scrollY + viewport >= full - 200) {
    await loadMore();
  }
};

// KB카드 추천 로드 (초기 로드)
const loadKbRecommendations = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    kbCards.value = [];
    hasNext.value = true;
    nextCursor.value = null;

    const response = await cardsApi.getKbCardRecommendations();
    console.log('KB카드 추천 전체 응답:', response);

    // 응답 구조 확인 및 처리
    if (response && response.success !== false) {
      let allCards = [];

      // 백엔드 응답이 SuccessResponse 형태인 경우
      if (response.data && typeof response.data === 'object') {
        allCards = response.data.kbCards || [];
      }
      // 직접 데이터가 오는 경우
      else if (response.kbCards) {
        allCards = response.kbCards || [];
      }
      // 다른 구조인 경우 빈 배열로 처리
      else {
        console.warn('예상과 다른 응답 구조:', response);
        allCards = [];
      }

      // 처음 6개만 표시
      kbCards.value = allCards.slice(0, pageSize);

      // 더 많은 데이터가 있는지 확인
      hasNext.value = allCards.length > pageSize;
      if (hasNext.value) {
        // 나머지 데이터를 nextCursor에 임시 저장
        nextCursor.value = allCards.slice(pageSize);
      }
    } else {
      throw new Error(response?.message || '추천 데이터를 불러올 수 없습니다.');
    }
  } catch (err) {
    console.error('KB카드 추천 로드 실패:', err);
    console.error('오류 상세:', err.response?.data || err.message);
    error.value =
      err.response?.data?.message ||
      err.message ||
      'KB카드 추천을 불러오는 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 더 많은 카드 로드
const loadMore = async () => {
  if (!hasNext.value || isLoadingMore.value || !nextCursor.value) return;

  isLoadingMore.value = true;

  try {
    // 다음 6개 카드 가져오기
    const nextBatch = nextCursor.value.slice(0, pageSize);
    const remainingCards = nextCursor.value.slice(pageSize);

    // 기존 카드에 추가
    kbCards.value.push(...nextBatch);

    // 더 많은 데이터가 있는지 확인
    hasNext.value = remainingCards.length > 0;
    nextCursor.value = remainingCards.length > 0 ? remainingCards : null;
  } catch (err) {
    console.error('더 많은 카드 로드 실패:', err);
  } finally {
    // 최소 1초간 로딩 표시
    setTimeout(() => {
      isLoadingMore.value = false;
    }, 1000);
  }
};

// 카드 신청 처리
const handleCardApply = (card) => {
  // PC 신청 URL이 있으면 PC URL 우선, 없으면 모바일 URL 사용
  const applyUrl = card.requestPcUrl || card.requestMobileUrl;

  if (applyUrl) {
    window.open(applyUrl, '_blank');
  } else {
    alert('죄송합니다. 현재 온라인 신청이 불가능합니다.');
  }
};

// 카드 클릭 처리
const handleCardClick = (card) => {
  console.log('카드 클릭:', card.name);
  // TODO: 카드 상세 페이지로 이동
};

// 마운트 시 데이터 로드
onMounted(() => {
  loadKbRecommendations();
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.kb-card-recommendation {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
}

.recommendation-header {
  background: var(--color-dark);
  padding: var(--spacing-lg);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.kb-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: white;
  padding: var(--spacing-xs);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-text h3 {
  color: white;
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-base);
  margin: 0;
  font-weight: 500;
}

.loading-container,
.error-container,
.no-cards-container {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-container p,
.error-container p,
.no-cards-container p {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-base);
}

.error-icon,
.no-cards-icon {
  font-size: 3rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
}

.retry-button {
  margin-top: var(--spacing-md);
}

.cards-container {
  padding: var(--spacing-lg);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--spacing-lg);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 무한스크롤 로딩 스타일 */
.infinite-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-lg);
}

.infinite-loading p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* 태블릿 */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }

  .recommendation-header {
    padding: var(--spacing-md);
  }

  .cards-container {
    padding: var(--spacing-md);
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .header-content {
    gap: var(--spacing-sm);
  }

  .kb-logo {
    width: 40px;
    height: 40px;
  }

  .header-text h3 {
    font-size: var(--font-size-xl);
  }

  .header-text p {
    font-size: var(--font-size-base);
  }

  .recommendation-header {
    padding: var(--spacing-md);
  }

  .cards-container {
    padding: var(--spacing-sm);
  }

  .loading-container,
  .error-container,
  .no-cards-container {
    padding: var(--spacing-lg);
  }
}
</style>
