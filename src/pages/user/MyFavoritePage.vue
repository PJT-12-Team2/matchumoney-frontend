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
        <div v-else-if="!allFavorites?.length || !filteredFavorites?.length" class="empty-state">
          <div class="empty-icon">📭</div>
          <div>즐겨찾기한 상품이 없습니다.</div>
        </div>
        <div v-else>
          <!-- 예금 탭 -->
          <div v-if="currentTab === 'deposit'" class="card-search-results-grid">
            <div
              v-for="deposit in filteredFavorites"
              :key="deposit.depositId"
              class="product-card"
              @click="goToDepositDetail(deposit.depositId)">
              <div class="favorite-top-right">
                <FavoriteToggle
                  @click.stop
                  v-model="deposit.isStarred"
                  :productId="deposit.depositId"
                  :productType="'DEPOSIT'" />
              </div>
              <div class="product-card-horizontal">
                <div class="bank-logo-container">
                  <img :src="getBankLogo(deposit.bankName)" alt="은행 로고" class="bank-logo-round" />
                </div>
                <div class="product-name-block">
                  <div class="bank-name-bold">{{ deposit.bankName }}</div>
                  <div class="product-name-bold">{{ deposit.productName }}</div>
                </div>
                <div class="product-info-block">
                  <div class="rate-line no-wrap">
                    <span class="label-bold">최고 금리 :&nbsp;</span>
                    <span class="highlight-rate">{{ deposit.maxRate }}</span>
                  </div>
                  <div class="rate-line no-wrap">
                    최저 금리 :
                    {{ deposit.basicRate }}
                  </div>
                  <div class="rate-line no-wrap">
                    기준 기간 :
                    {{ deposit.term ? deposit.term + '개월' : '정보 없음' }}
                  </div>
                </div>
              </div>
              <div class="product-action-row">
                <LikeToggle
                  :productId="deposit.depositId"
                  productType="deposit-products"
                  :initialLiked="deposit.isLiked"
                  :initialCount="deposit.likeCount"
                  @update="
                    ({ liked, count }) => {
                      deposit.isLiked = liked;
                      deposit.likeCount = count;
                    }
                  "
                  @click.stop />
                <CompareButton :productId="deposit.depositId" :productType="'DEPOSIT'" @click.stop />
              </div>
            </div>
          </div>

          <!-- 적금 탭 -->
          <div v-else-if="currentTab === 'saving'" class="card-search-results-grid">
            <div
              v-for="saving in filteredFavorites"
              :key="saving.savingId"
              class="product-card"
              @click="goToSavingDetail(saving.savingId)">
              <div class="favorite-top-right">
                <FavoriteToggle
                  @click.stop
                  v-model="saving.isStarred"
                  :productId="saving.savingId"
                  :productType="'SAVING'" />
              </div>
              <div class="product-card-horizontal">
                <div class="bank-logo-container">
                  <img :src="getBankLogo(saving.bankName)" alt="은행 로고" class="bank-logo-round" />
                </div>
                <div class="product-name-block">
                  <div class="bank-name-bold">{{ saving.bankName }}</div>
                  <div class="product-name-bold">{{ saving.savingName }}</div>
                </div>
                <div class="product-info-block">
                  <div class="rate-line no-wrap">
                    <span class="label-bold">최고 금리 :&nbsp;</span>
                    <span class="highlight-rate">{{ saving.maxRate }}</span>
                  </div>
                  <div class="rate-line no-wrap">
                    최저 금리 :
                    {{ saving.basicRate }}
                  </div>
                  <div class="rate-line no-wrap">
                    매월 최대 금액 :
                    {{ saving.maxLimit }}
                  </div>
                  <div class="rate-line no-wrap">
                    기준 기간 :
                    {{ saving.term ? saving.term + '개월' : '정보 없음' }}
                  </div>
                </div>
              </div>
              <div class="product-action-row">
                <LikeToggle
                  :productId="saving.savingId"
                  productType="saving-products"
                  :initialLiked="saving.isLiked"
                  :initialCount="saving.likeCount"
                  @update="
                    ({ liked, count }) => {
                      saving.isLiked = liked;
                      saving.likeCount = count;
                    }
                  "
                  @click.stop />
                <CompareButton :productId="saving.savingId" :productType="'SAVING'" @click.stop />
              </div>
            </div>
          </div>

          <!-- 카드 탭 -->
          <div v-else-if="currentTab === 'card'" class="card-search-results-grid">
            <div
              v-for="card in filteredFavorites"
              :key="card.cardId"
              class="product-card"
              @click="goToCardDetail(card.cardId)">
              <div class="favorite-top-right">
                <FavoriteToggle @click.stop v-model="card.isStarred" :productId="card.cardId" :productType="'CARD'" />
              </div>
              <div class="product-content">
                <img :src="card.cardImageUrl" :alt="card.cardName" />
                <div class="product-info">
                  <h4>{{ card.cardName }}</h4>
                  <div>
                    <span class="label">카드사:</span>
                    {{ card.issuer || '카드사 미정' }}
                  </div>
                  <div>
                    <span class="label">전월실적금액:</span>
                    {{ card.preMonthMoney ? card.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
                  </div>
                  <div>
                    <span class="label">연회비 정보:</span>
                    {{ card.annualFee || '정보 없음' }}
                  </div>
                </div>
              </div>
              <div class="product-action-row">
                <LikeToggle
                  :productId="card.cardId"
                  productType="card-products"
                  :initialLiked="card.isLiked"
                  :initialCount="card.likeCount"
                  @update="
                    ({ liked, count }) => {
                      card.isLiked = liked;
                      card.likeCount = count;
                    }
                  "
                  @click.stop />
                <CompareButton :productId="card.cardId" :productType="'CARD'" @click.stop />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import BaseButton from '@/components/base/BaseButton.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import LikeToggle from '@/components/common/LikeToggle.vue';
import favoriteAPI from '@/api/favorite';

const selectedTab = ref('deposit');
const tabs = [
  { label: '예금', value: 'deposit' },
  { label: '적금', value: 'saving' },
  { label: '카드', value: 'card' },
];
const currentTab = selectedTab;
const currentTabLabel = computed(() => tabs.find((t) => t.value === selectedTab.value)?.label || '');

// ✅ URL 쿼리에서 탭 복원 (첫 렌더 시)
const route = useRoute();
const router = useRouter();
const tabFromQuery = route.query.tab;
if (tabFromQuery === 'deposit' || tabFromQuery === 'saving' || tabFromQuery === 'card') {
  selectedTab.value = tabFromQuery;
}

// ✅ 상세 이동 함수들 (router.push)
const goToDepositDetail = (id) => {
  router.push(`/detail/deposit/${id}`);
};
const goToSavingDetail = (id) => {
  router.push(`/detail/saving/${id}`);
};
const goToCardDetail = (id) => {
  router.push(`/detail/card/${id}`);
};

// ✅ 탭 변경 시 URL 쿼리 동기화 → 뒤로가기로 돌아올 때도 유지
watch(selectedTab, (v) => {
  router.replace({ query: { ...route.query, tab: v } });
});

const loading = ref(false);
const filters = ref({ term: '전체' });
const allFavorites = ref([]);

const filteredFavorites = computed(() => {
  return allFavorites.value.filter((p) => p.type === currentTab.value);
});

const getBankLogo = (bankName) => {
  const busanLogo = new URL('@/assets/bank-Logos/BK_BUSAN_Profile.png', import.meta.url).href;
  const hanaLogo = new URL('@/assets/bank-Logos/BK_HANA_Profile.png', import.meta.url).href;

  const logoMap = {
    국민은행: new URL('@/assets/bank-Logos/BK_KB_Profile.png', import.meta.url).href,
    하나은행: hanaLogo,
    농협은행주식회사: new URL('@/assets/bank-Logos/BK_NH_Profile.png', import.meta.url).href,
    신한은행: new URL('@/assets/bank-Logos/BK_Shinhan_Profile.png', import.meta.url).href,
    우리은행: new URL('@/assets/bankLogo_images/BK_Woori_Profile.png', import.meta.url).href,
    중소기업은행: new URL('@/assets/bank-Logos/BK_IBK_Profile.png', import.meta.url).href,
    한국산업은행: new URL('@/assets/bank-Logos/BK_KDB_Profile.png', import.meta.url).href,
    수협은행: new URL('@/assets/bank-Logos/BK_SH_Profile.png', import.meta.url).href,
    경남은행: busanLogo,
    부산은행: busanLogo,
    광주은행: new URL('@/assets/bank-Logos/BK_KWANGJU_Profile.png', import.meta.url).href,
    전북은행: new URL('@/assets/bank-Logos/BK_JEONBUK_Profile.png', import.meta.url).href,
    제주은행: new URL('@/assets/bank-Logos/BK_JEJU_Profile.png', import.meta.url).href,
    아이엠뱅크: new URL('@/assets/bank-Logos/BK_DAEGU_Profile.png', import.meta.url).href,
    한국스탠다드차타드은행: new URL('@/assets/bank-Logos/BK_SC_Profile.png', import.meta.url).href,
    '주식회사 카카오뱅크': new URL('@/assets/bank-Logos/BK_KAKAO_Profile.png', import.meta.url).href,
    '주식회사 케이뱅크': new URL('@/assets/bank-Logos/BK_K_Profile.png', import.meta.url).href,
    '토스뱅크 주식회사': new URL('@/assets/bank-Logos/BK_TOSS_Profile.png', import.meta.url).href,
    '주식회사 하나은행': hanaLogo,
  };

  return logoMap[bankName] || null;
};

const getRateWithTerm = (product, rateType) => {
  if (currentTab.value === 'deposit') {
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
    if (rateType === 'max') return product.maxRate;
    if (rateType === 'base') return product.baseRate;
    return '-';
  }
};

// --- Like/Reaction logic (기존 유지) ---
const userId = ref(null);
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

onMounted(async () => {
  // ✅ 마운트 시에도 쿼리 재확인 (SSR/HMR 대비)
  const qTab = route.query.tab;
  if (qTab === 'deposit' || qTab === 'saving' || qTab === 'card') {
    selectedTab.value = qTab;
  }

  console.log('[MyFavoritePage] onMounted triggered');
  loading.value = true;
  try {
    const res = await favoriteAPI.getFavoriteProducts();
    console.log('[MyFavoritePage] API response:', res);

    allFavorites.value = [
      ...(res.depositList ?? []).map((d) => ({
        ...d,
        type: 'deposit',
        name: d.productName || d.finPrdtNm,
        bank: d.bankName || d.korCoNm,
        bankInitial: d.bankInitial || '',
        productName: d.productName || d.finPrdtNm,
        bankName: d.bankName || d.korCoNm,
        depositId: d.depositId,
        basicRate: d.basicRate,
        maxRate: d.maxRate,
        term: d.term || null,
        isStarred: d.isStarred ?? false,
        isLiked: d.isLiked ?? false,
        likeCount: d.likeCount ?? 0,
      })),
      ...(res.savingList ?? []).map((s) => ({
        ...s,
        type: 'saving',
        name: s.savingName || s.finPrdtNm,
        bank: s.bankName || s.korCoNm,
        bankInitial: s.bankInitial || '',
        savingId: s.savingId || s.savingProductId || s.id,
        basicRate: s.basicRate,
        maxRate: s.maxRate,
        maxLimit: s.maxLimit,
        term: s.term || null,
        isStarred: s.isStarred ?? false,
        isLiked: s.isLiked ?? false,
        likeCount: s.likeCount ?? 0,
      })),
      ...(res.cardList ?? []).map((c) => ({
        ...c,
        type: 'card',
        name: c.cardName,
        bank: c.issuer,
        imageUrl: c.cardImageUrl,
        cardId: c.cardId || c.id,
        annualFee: c.annualFee,
        preMonthMoney: c.preMonthMoney,
        isStarred: c.isStarred ?? false,
        isLiked: c.isLiked ?? false,
        likeCount: c.likeCount ?? 0,
      })),
    ];
  } catch (e) {
    console.error('[MyFavoritePage] 즐겨찾기 불러오기 실패:', e);
  } finally {
    loading.value = false;
  }
});
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
  .main-content {
    padding: 1rem;
  }
  .page-title {
    font-size: 1.25rem;
  }
  .card-search-results-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .card-search-results-grid .product-card {
    min-height: 0;
    height: auto;
    padding: 1rem;
  }
  .card-search-results-grid .product-content img {
    height: 120px;
  }
  .product-card-horizontal {
    align-items: stretch;
    gap: 0.5rem;
    text-align: left;
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
