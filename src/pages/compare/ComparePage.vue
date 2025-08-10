<template>
  <div class="content-compare">
    <header class="compare-header">
      <div class="ch-left">
        <h1 class="ch-title">비교하기</h1>
        <p class="ch-sub">관심 상품을 한눈에 비교해보세요. 탭을 바꿔 예금/적금/카드를 전환할 수 있어요.</p>
      </div>
      <div class="ch-meta">
        <span>비교함 담긴 개수 :</span>
        <span
          class="meta-chip"
          :class="{ active: activeTab === 'DEPOSIT' }"
          :data-tip="'예금 비교함에 담긴 상품 수'"
          aria-label="예금 비교함에 담긴 상품 수"
        >
          예금 <strong>{{ counts.DEPOSIT }}</strong>
        </span>
        <span
          class="meta-chip"
          :class="{ active: activeTab === 'SAVING' }"
          :data-tip="'적금 비교함에 담긴 상품 수'"
          aria-label="적금 비교함에 담긴 상품 수"
        >
          적금 <strong>{{ counts.SAVING }}</strong>
        </span>
        <span
          class="meta-chip"
          :class="{ active: activeTab === 'CARD' }"
          :data-tip="'카드 비교함에 담긴 상품 수'"
          aria-label="카드 비교함에 담긴 상품 수"
        >
          카드 <strong>{{ counts.CARD }}</strong>
        </span>
      </div>
    </header>

    <div class="tab-wrap">
      <TabSelector :initial-tab="activeTab" @change-tab="handleTabChange" />
    </div>

    <div class="compare-body">
      <DynamicDepositComparison
        :products="products.DEPOSIT"
        v-if="activeTab === 'DEPOSIT'"
      />
      <DynamicSavingComparison
        :products="products.SAVING"
        v-if="activeTab === 'SAVING'"
      />
      <DynamicCardComparison
        :products="products.CARD"
        v-if="activeTab === 'CARD'"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabSelector from '@/components/common/TabSelector.vue';
import DynamicSavingComparison from '@/components/compare/DynamicSavingComparison.vue';
import DynamicDepositComparison from '@/components/compare/DynamicDepositComparison.vue';
import DynamicCardComparison from '@/components/compare/DynamicCardComparison.vue';
import { useCompareStore } from '@/stores/compareStore';
import compareApi from '@/api/compare';

const route = useRoute();
const router = useRouter();

const store = useCompareStore();
const activeTab = ref('DEPOSIT');
const products = reactive({ DEPOSIT: [], SAVING: [], CARD: [] });

const counts = computed(() => ({
  DEPOSIT: store.compareList.DEPOSIT?.length ?? 0,
  SAVING: store.compareList.SAVING?.length ?? 0,
  CARD: store.compareList.CARD?.length ?? 0,
}));

//  URL 쿼리로부터 초기 탭 설정
const compareType = computed(() => {
  const type = (route.query.type || '').toString().toUpperCase();
  return ['DEPOSIT', 'SAVING', 'CARD'].includes(type) ? type : 'DEPOSIT';
});
activeTab.value = compareType.value;

// 탭 변경 핸들러 (URL에도 반영)
function handleTabChange(tab) {
  activeTab.value = tab;

  // URL 쿼리 변경 (history push)
  router.push({
    query: { type: tab },
  });

  console.log('선택된 탭:', tab);
}

//  비교 데이터 불러오기
async function fetchProducts() {
  try {
    const tab = activeTab.value;
    const compareList = store.compareList[tab];

    const result = await compareApi.getList(tab, compareList);
    products[tab] = result;
  } catch (e) {
    console.error('비교 리스트 불러오기 실패:', e);
  }
}
//  탭 또는 비교 리스트 변경 시 fetch
// route 쿼리 → activeTab 연결
watch(
  () => route.query.type,
  (newType) => {
    const upper = (newType || '').toString().toUpperCase();
    if (['DEPOSIT', 'SAVING', 'CARD'].includes(upper)) {
      activeTab.value = upper;
    }
  },
  { immediate: true }
);

// activeTab or compareList → 데이터 fetch
watch(
  [activeTab, () => store.compareList[activeTab.value]],
  async () => {
    await fetchProducts();
  },
  { immediate: true, deep: true }
);
</script>
<style scoped>
.content-compare {
  width: 100%;
  max-width: 1120px;
  margin: 2rem auto;
  padding: 0 20px;
}

/* Hero/Header */
.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #f3faf6 0%, #ffffff 100%);
  border: 1px solid #e2f0e8;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}
.ch-left { flex: 1; }
.ch-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1b5e20;
}
.ch-sub {
  margin: 6px 0 0;
  color: #517a5c;
  font-size: 14px;
}
.ch-meta { display: flex; gap: 8px; align-items: center; }
.meta-label {
  font-size: 12px;
  font-weight: 700;
  color: #2e7d32;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eaf6ef;
  border: 1px solid #d6ecdf;
  margin-right: 4px;
}
.meta-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f4f7f6;
  border: 1px solid #e1e7e5;
  font-weight: 700;
  font-size: 12px;
  color: #476256;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}
.meta-chip strong { font-weight: 800; }
.meta-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  background: #f8fbfa;
}
.meta-chip.active {
  background: #e6f4ec;
  border-color: #cfe7d8;
  color: #2e7d32;
  animation: glowPulse 900ms ease-in-out 1;
}

/* Tooltip using data-tip attribute */
.meta-chip[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%);
  white-space: nowrap;
  background: #1f2937;
  color: #fff;
  padding: 6px 8px;
  font-size: 11px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
  pointer-events: none;
  z-index: 10;
}
.meta-chip[data-tip]:hover::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1f2937;
}

/* Sticky tab area */
.tab-wrap {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #ffffff;
  padding-top: 12px;
  margin-top: 12px;
}

/* Body spacing card */
.compare-body {
  background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
  border: 1px solid #f1f1f1;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  margin-top: 14px;
}


/* Entrance animations */
.compare-header { animation: fadeSlideIn 420ms ease both; }
.compare-body { animation: fadeSlideIn 520ms ease 60ms both; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes glowPulse {
  0% { box-shadow: 0 0 0 rgba(46,125,50,0.0); }
  50% { box-shadow: 0 0 0 8px rgba(46,125,50,0.12); }
  100% { box-shadow: 0 0 0 rgba(46,125,50,0.0); }
}

@media (max-width: 900px) {
  .compare-header { flex-direction: column; align-items: flex-start; }
  .ch-meta { align-self: stretch; }
}

@media (max-width: 640px) {
  .content-compare {
    width: 100%;
    margin: 1.25rem auto;
    padding: 0 14px;
  }
  .ch-title { font-size: 20px; }
  .meta-chip { padding: 6px 10px; font-size: 11px; }
}
</style>
