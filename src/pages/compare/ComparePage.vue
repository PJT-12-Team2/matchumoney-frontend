<template>
  <div class="content">
    <TabSelector :initial-tab="activeTab" @change-tab="handleTabChange" />
    <div style="height: 1rem"></div>

    <DynamicDepositComparison
      :products="products.DEPOSIT"
      v-if="activeTab == 'DEPOSIT'"
    />
    <DynamicSavingComparison
      :products="products.SAVING"
      v-if="activeTab == 'SAVING'"
    />
    <DynamicCardComparison
      :products="[
        {
          id: '21',
          korCoName: '신한카드',
          finPrdtName: '신한카드 The F',
          productImage:
            'https://d1c5n4ri2guedi.cloudfront.net/card/43/card_img/20124/43card.png',
        },
      ]"
      v-if="activeTab == 'CARD'"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import TabSelector from '@/components/common/TabSelector.vue';
import DynamicSavingComparison from '@/components/compare/DynamicSavingComparison.vue';
import DynamicDepositComparison from '@/components/compare/DynamicDepositComparison.vue';
import DynamicCardComparison from '@/components/compare/DynamicCardComparison.vue';
import { useCompareStore } from '@/stores/compareStore';
import compareApi from '@/api/compare';

const store = useCompareStore();
const activeTab = ref('DEPOSIT');
const products = reactive({ DEPOSIT: [], SAVING: [], CARD: [] });

function handleTabChange(tab) {
  activeTab.value = tab;
  console.log('선택된 탭:', tab);
}

async function fetchProducts() {
  try {
    const tab = activeTab.value;
    const compareList = store.compareList[tab];
    console.log('compareList:', compareList);

    const result = await compareApi.getList(tab, compareList);
    console.log('API 결과:', result);

    products[tab] = result;
    console.log(products[tab]);
  } catch (e) {
    console.error('비교 리스트:', store.compareList[activeTab.value]);
    console.error('비교 리스트 불러오기 실패:', e);
  }
}

// 1. 최초 마운트 시 실행
onMounted(async () => {
  await fetchProducts();
});

// 2. activeTab이 변경될 때마다 실행
watch(
  [activeTab, () => store.compareList[activeTab.value]],
  async () => {
    await fetchProducts();
  },
  { deep: true }
);
</script>
<style scoped>
.content {
  width: 80%;
  margin: auto;
}
@media (max-width: 640px) {
  .content {
    width: 100%;
    margin: auto;
  }
}
</style>
