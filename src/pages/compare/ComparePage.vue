<template>
  <div class="content-compare">
    <TabSelector :initial-tab="activeTab" @change-tab="handleTabChange" />
    <div style="height: 1rem"></div>

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
  width: 80%;
  margin: 2rem auto;
}
@media (max-width: 640px) {
  .content-compare {
    width: 90%;
    margin: 2rem auto;
  }
}
</style>
