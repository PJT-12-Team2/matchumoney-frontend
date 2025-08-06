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
      <div class="cards-grid">
        <div
          v-for="card in paginatedCards"
          :key="card.cardProductId"
          class="card-item"
        >
          <KbCardItem :card="card" @apply="handleCardApply" />
        </div>
      </div>

      <!-- 페이징 컨트롤 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <span>{{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalCount) }} / {{ totalCount }}개</span>
        </div>
        <div class="pagination-controls">
          <BaseButton
            variant="outline"
            size="sm"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="bi bi-chevron-left"></i>
          </BaseButton>
          
          <div class="page-numbers">
            <BaseButton
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'primary' : 'outline'"
              size="sm"
              @click="goToPage(page)"
              class="page-number-btn"
            >
              {{ page }}
            </BaseButton>
          </div>

          <BaseButton
            variant="outline"
            size="sm"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            <i class="bi bi-chevron-right"></i>
          </BaseButton>
        </div>
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
import { ref, onMounted, computed } from "vue";
import cardsApi from "@/api/cards.js";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import KbCardItem from "./KbCardItem.vue";

// 반응형 데이터
const isLoading = ref(false);
const error = ref(null);
const kbCards = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(8); // 페이지당 8개씩 표시

// computed
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value));

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return kbCards.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    if (current <= 3) {
      end = Math.min(total, 5);
    } else if (current >= total - 2) {
      start = Math.max(1, total - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// KB카드 추천 로드
const loadKbRecommendations = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await cardsApi.getKbCardRecommendations();
    console.log("KB카드 추천 전체 응답:", response);

    // 응답 구조 확인 및 처리
    if (response && response.success !== false) {
      // 백엔드 응답이 SuccessResponse 형태인 경우
      if (response.data && typeof response.data === "object") {
        kbCards.value = response.data.kbCards || [];
        totalCount.value = response.data.totalCount || 0;
      }
      // 직접 데이터가 오는 경우
      else if (response.kbCards) {
        kbCards.value = response.kbCards || [];
        totalCount.value = response.totalCount || 0;
      }
      // 다른 구조인 경우 빈 배열로 처리
      else {
        console.warn("예상과 다른 응답 구조:", response);
        kbCards.value = [];
        totalCount.value = 0;
      }
    } else {
      throw new Error(response?.message || "추천 데이터를 불러올 수 없습니다.");
    }
  } catch (err) {
    console.error("KB카드 추천 로드 실패:", err);
    console.error("오류 상세:", err.response?.data || err.message);
    error.value =
      err.response?.data?.message ||
      err.message ||
      "KB카드 추천을 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

// 페이지 이동
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 카드 신청 처리
const handleCardApply = (card) => {
  // PC 신청 URL이 있으면 PC URL 우선, 없으면 모바일 URL 사용
  const applyUrl = card.requestPcUrl || card.requestMobileUrl;

  if (applyUrl) {
    window.open(applyUrl, "_blank");
  } else {
    alert("죄송합니다. 현재 온라인 신청이 불가능합니다.");
  }
};

// 마운트 시 데이터 로드
onMounted(() => {
  loadKbRecommendations();
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
  font-size: var(--font-size-sm);
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.card-item {
  transition: transform 0.2s ease;
}

.card-item:hover {
  transform: translateY(-4px);
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

/* 페이징 스타일 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-lg);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-numbers {
  display: flex;
  gap: var(--spacing-xs);
  margin: 0 var(--spacing-sm);
}

.page-number-btn {
  min-width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 8px;
  font-weight: 600;
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
    font-size: var(--font-size-lg);
  }

  .header-text p {
    font-size: var(--font-size-xs);
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
