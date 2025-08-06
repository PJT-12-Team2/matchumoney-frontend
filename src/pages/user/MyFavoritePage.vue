<template>
  <div class="my-favorite-page">
    <main class="main-content">
      <h1 class="page-title">즐겨찾기한 상품</h1>

      <hr />
      <div class="tab-selector">
        <BaseButton
          :style="{
            margin: '0 0.5rem',
            backgroundColor: selectedTab === 'deposit' ? 'var(--color-accent)' : 'var(--bg-content)',
            color: selectedTab === 'deposit' ? 'var(--color-white)' : 'var(--text-primary)',
          }"
          @click="selectedTab = 'deposit'">
          예금
        </BaseButton>
        <BaseButton
          :style="{
            margin: '0 0.5rem',
            backgroundColor: selectedTab === 'saving' ? 'var(--color-accent)' : 'var(--bg-content)',
            color: selectedTab === 'saving' ? 'var(--color-white)' : 'var(--text-primary)',
          }"
          @click="selectedTab = 'saving'">
          적금
        </BaseButton>
        <BaseButton
          :style="{
            margin: '0 0.5rem',
            backgroundColor: selectedTab === 'card' ? 'var(--color-accent)' : 'var(--bg-content)',
            color: selectedTab === 'card' ? 'var(--color-white)' : 'var(--text-primary)',
          }"
          @click="selectedTab = 'card'">
          카드
        </BaseButton>
      </div>

      <section class="search-results">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <div>상품을 불러오는 중입니다...</div>
        </div>
        <div v-else-if="!allFavorites || allFavorites.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div>즐겨찾기한 상품이 없습니다.</div>
        </div>
        <div v-else-if="!filteredFavorites || filteredFavorites.length === 0" class="empty-state">
          <div class="empty-icon">⭐</div>
          <div>즐겨찾기한 {{ currentTabLabel }} 상품이 없습니다.</div>
        </div>
        <div v-else>
          <!-- 예금 탭 -->
          <div v-if="currentTab === 'deposit'" class="card-search-results-grid">
            <div
              v-for="product in filteredFavorites"
              :key="product.id"
              class="product-card"
              @click="selectProduct(product)">
              <div class="favorite-top-right">
                <FavoriteToggle
                  @click.stop
                  v-model="product.isStarred"
                  :productId="product.id"
                  :productType="productType" />
              </div>
              <div class="product-card-horizontal">
                <div class="bank-logo-container">
                  <img :src="getBankLogo(product.bankInitial)" alt="은행 로고" class="bank-logo-round" />
                </div>
                <div class="product-name-block">
                  <div class="bank-name-bold">{{ product.bank }}</div>
                  <div class="product-name-bold">{{ product.name }}</div>
                </div>
                <div class="product-info-block">
                  <div class="rate-line no-wrap">
                    <span class="label-bold">최고 금리 :&nbsp;</span>
                    <span class="highlight-rate">{{ getRateWithTerm(product, 'max') }}</span>
                  </div>
                  <div class="rate-line no-wrap">
                    최저 금리 :
                    {{ getRateWithTerm(product, 'base') }}
                  </div>
                  <div class="rate-line no-wrap">
                    기준 기간 :
                    {{
                      (() => {
                        const best = product.depositOptions?.reduce((prev, curr) => {
                          const prevRate = prev?.intrRate2 ?? 0;
                          const currRate = curr?.intrRate2 ?? 0;
                          return currRate > prevRate ? curr : prev;
                        }, null);
                        return best?.saveTrm ? best.saveTrm + '개월' : '정보 없음';
                      })()
                    }}
                  </div>
                </div>
              </div>
              <div class="product-action-row">
                <CompareButton :productId="product.id" :productType="productType" @click.stop />
                <span class="reaction-button" @click.stop="handleLikeClick" :class="{ active: isLiked }">
                  {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 적금 탭 -->
          <div v-else-if="currentTab === 'saving'" class="card-search-results-grid">
            <div
              v-for="product in filteredFavorites"
              :key="product.id"
              class="product-card"
              @click="selectProduct(product)">
              <div class="favorite-top-right">
                <FavoriteToggle
                  @click.stop
                  v-model="product.isStarred"
                  :productId="product.id"
                  :productType="productType" />
              </div>
              <div class="product-card-horizontal">
                <div class="bank-logo-container">
                  <img :src="getBankLogo(product.bankInitial)" alt="은행 로고" class="bank-logo-round" />
                </div>

                <div class="product-name-block">
                  <div class="bank-name-bold">{{ product.bank }}</div>
                  <div class="product-name-bold">{{ product.name }}</div>
                </div>

                <div class="product-info-block">
                  <div class="rate-line no-wrap">
                    <span class="label-bold">최고 금리 :&nbsp;</span>

                    <span class="highlight-rate">{{ product.maxRate }}</span>
                  </div>
                  <div class="rate-line no-wrap">
                    최저 금리 :
                    {{ product.baseRate }}
                  </div>
                  <div class="rate-line no-wrap">
                    매월 최대 금액 :
                    {{ product.maxLimit }}
                  </div>
                  <div class="rate-line no-wrap">
                    기준 기간 :
                    {{ filters.term !== '전체' ? filters.term + '개월' : '정보 없음' }}
                  </div>
                </div>
              </div>

              <div class="product-action-row">
                <CompareButton :productId="product.id" :productType="productType" @click.stop />
                <span class="reaction-button" @click.stop="handleLikeClick" :class="{ active: isLiked }">
                  {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 카드 탭 -->
          <div v-else-if="currentTab === 'card'" class="card-search-results-grid">
            <div
              v-for="product in filteredFavorites"
              :key="product.id"
              class="product-card"
              @click="selectProduct(product)">
              <div class="favorite-top-right">
                <FavoriteToggle
                  @click.stop
                  v-model="product.isStarred"
                  :productId="product.id"
                  :productType="productType" />
              </div>
              <div class="product-content">
                <img :src="product.imageUrl" :alt="product.name" />
                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <div>
                    <span class="label">카드사:</span>
                    {{ product.issuer || '카드사 미정' }}
                  </div>
                  <div>
                    <span class="label">전월실적금액:</span>
                    {{ product.preMonthMoney ? product.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
                  </div>
                  <div>
                    <span class="label">연회비 정보:</span>
                    {{ product.annualFee || '정보 없음' }}
                  </div>
                </div>
              </div>
              <div class="product-action-row">
                <CompareButton :productId="product.id" :productType="productType" @click.stop />
                <span class="reaction-button" @click.stop="handleLikeClick" :class="{ active: isLiked }">
                  {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';

import CompareButton from '@/components/common/CompareButton.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';

const selectedTab = ref('deposit');
const tabs = [
  { label: '예금', value: 'deposit' },
  { label: '적금', value: 'saving' },
  { label: '카드', value: 'card' },
];
const currentTab = selectedTab;
const currentTabLabel = computed(() => tabs.find((t) => t.value === selectedTab.value)?.label || '');

const loading = ref(false);

const filters = ref({
  term: '전체',
});

const allFavorites = ref([
  {
    id: 1,
    name: '스마트적금',
    bank: '신한은행',
    bankInitial: 'shinhan',
    baseRate: '3.00%',
    maxRate: '4.00%',
    maxLimit: '300,000원',
    type: 'saving',
  },
  {
    id: 2,
    name: '정기예금',
    bank: '국민은행',
    bankInitial: 'kb',
    baseRate: '2.50%',
    maxRate: '3.10%',
    maxLimit: '한도 없음',
    type: 'deposit',
    depositOptions: [
      { intrRate2: 2.5, saveTrm: 12 },
      { intrRate2: 3.1, saveTrm: 24 },
    ],
  },
  {
    id: 3,
    name: '신한카드 B.Big(삑)',
    bank: '신한카드',
    bankInitial: 'woori',
    baseRate: '-',
    maxRate: '-',
    maxLimit: '-',
    type: 'card',
  },
  {
    id: 4,
    name: '하나적금플러스',
    bank: '하나은행',
    bankInitial: 'hana',
    baseRate: '3.10%',
    maxRate: '4.20%',
    maxLimit: '200,000원',
    type: 'saving',
  },
  {
    id: 5,
    name: 'NH주거래우대예금',
    bank: '농협은행',
    bankInitial: 'nh',
    baseRate: '2.80%',
    maxRate: '3.50%',
    maxLimit: '무제한',
    type: 'deposit',
    depositOptions: [
      { intrRate2: 2.8, saveTrm: 6 },
      { intrRate2: 3.5, saveTrm: 12 },
    ],
  },
  {
    id: 6,
    name: '카카오프렌즈카드',
    bank: '카카오뱅크',
    bankInitial: 'kakao',
    baseRate: '-',
    maxRate: '-',
    maxLimit: '-',
    type: 'card',
  },
  {
    id: 7,
    name: '우대적금',
    bank: '우리은행',
    bankInitial: 'woori',
    baseRate: '3.20%',
    maxRate: '4.00%',
    maxLimit: '100,000원',
    type: 'saving',
  },
  {
    id: 8,
    name: '신한쏠편한예금',
    bank: '신한은행',
    bankInitial: 'shinhan',
    baseRate: '2.60%',
    maxRate: '3.20%',
    maxLimit: '무제한',
    type: 'deposit',
    depositOptions: [
      { intrRate2: 2.6, saveTrm: 12 },
      { intrRate2: 3.2, saveTrm: 18 },
    ],
  },
  {
    id: 9,
    name: '토스하이브카드',
    bank: '토스뱅크',
    bankInitial: 'toss',
    baseRate: '-',
    maxRate: '-',
    maxLimit: '-',
    type: 'card',
  },
  {
    id: 10,
    name: '청년우대적금',
    bank: '신한',
    bankInitial: 'kb',
    baseRate: '3.40%',
    maxRate: '4.50%',
    maxLimit: '300,000원',
    type: 'saving',
  },
]);

const filteredFavorites = computed(() => {
  return allFavorites.value.filter((p) => p.type === currentTab.value);
});

const getBankLogo = (initial) => {
  const logos = {
    shinhan: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url).href,
    hana: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
    woori: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
    kb: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
    nh: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
    kakao: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
    toss: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
  };
  return logos[initial] || logos['shinhan'];
};

const getRateWithTerm = (product, rateType) => {
  if (currentTab.value === 'deposit') {
    // For deposit products, return max or base rate from depositOptions if available
    if (product.depositOptions && product.depositOptions.length > 0) {
      if (rateType === 'max') {
        const maxOption = product.depositOptions.reduce((prev, curr) => {
          return (curr.intrRate2 ?? 0) > (prev.intrRate2 ?? 0) ? curr : prev;
        }, product.depositOptions[0]);
        return maxOption ? maxOption.intrRate2 + '%' : '-';
      } else if (rateType === 'base') {
        const minOption = product.depositOptions.reduce((prev, curr) => {
          return (curr.intrRate2 ?? Infinity) < (prev.intrRate2 ?? Infinity) ? curr : prev;
        }, product.depositOptions[0]);
        return minOption ? minOption.intrRate2 + '%' : '-';
      }
    }
    return '-';
  } else {
    // For other products, return maxRate or baseRate directly
    if (rateType === 'max') return product.maxRate;
    if (rateType === 'base') return product.baseRate;
    return '-';
  }
};

const selectProduct = (product) => {
  alert(`${product.name}을 선택했습니다.`);
};

// --- Like/Reaction logic ---
import { useRouter } from 'vue-router';
// Dummy userId for demo; replace with actual user logic as needed
const userId = ref(null); // or e.g. ref('user123')
const router = useRouter();
const isLiked = ref(false);
const likeCount = ref(0);
const toggleLike = () => {
  isLiked.value = !isLiked.value;
  likeCount.value += isLiked.value ? 1 : -1;
};
const handleLikeClick = () => {
  if (!userId.value) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
      router.push('/login');
    }
    return;
  }
  toggleLike();
};
</script>

<style scoped>
.main-content {
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.tab-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

/* Tab button and BaseButton border and hover effect, matching product cards */
.base-button {
  border: 2px solid transparent;
  border-radius: var(--spacing-xl);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
  background-color: var(--bg-content); /* match card background */
  color: var(--text-primary);
}

.base-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
  background-color: var(--color-gray-200);
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
}

.product-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: var(--color-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: var(--shadow-card);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

.product-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.product-content img {
  width: 5rem;
  height: 5rem;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.04);
  border: 0.1rem solid var(--color-gray-200);
}

.product-info h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.product-info > div,
.product-info > h4 {
  line-height: 1.6;
}

.label {
  font-weight: 600;
  margin-right: 4px;
  color: #333;
}

.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-top: auto;
  margin-bottom: auto;
}

.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
}

.bank-logo-round {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: contain;
  background: var(--color-white);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.04);
  border: 0.1rem solid var(--color-gray-200);
}

.product-name-block {
  flex: 1;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Typography styles grouped together */
.bank-name-bold {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: #1e2b4e;
  margin-bottom: 0.1rem;
}

.product-name-bold {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.rate-line {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 0.1rem;
}

.label-bold {
  font-weight: bold;
  color: var(--color-dark);
}

.highlight-rate {
  font-size: 18px;
  color: #609966;
  font-weight: bold;
}

.no-wrap {
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px #ccc;
  border-radius: 1rem;
  color: var(--text-secondary);
  font-size: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-success);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.card-product-search {
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem;
}

.search-results {
  margin-top: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Card tab specific styles */

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.product-info > div,
.product-info > h4 {
  line-height: 1.6;
}

.card-search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.card-search-results-grid .product-card {
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  text-align: center;
}

.card-search-results-grid .product-card:hover {
  transform: translateY(-0.3125rem);
}

.card-search-results-grid .product-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
}

.card-search-results-grid .product-content img {
  height: 150px;
  width: 100%;
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }

  .product-card-horizontal {
    flex-direction: row;
    gap: 1rem;
  }

  .bank-logo-container,
  .bank-logo-round {
    width: 4rem;
    height: 4rem;
  }

  .product-name-block {
    padding: 0 0.5rem;
    align-items: center;
  }

  .product-info-block {
    align-items: flex-end;
  }

  .card-search-results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .card-search-results-grid .product-card {
    height: auto;
  }

  .card-search-results-grid .product-content {
    gap: 1rem;
  }
}

.product-action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.favorite-top-right {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}
.product-card {
  position: relative; /* Ensure absolute positioning works inside */
}
</style>
