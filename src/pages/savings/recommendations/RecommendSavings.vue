<script setup>
import { ref, watch } from 'vue';
import SavingMyProductSlider from '@/components/savings/SavingMyProductSlider.vue';
import BankbookProductList from '@/components/bankbook/BankbookProductList.vue';
import RecommendationLayout from '@/components/layouts/RecommendationLayout.vue';
import savingApi from '@/api/savings';

const selectedId = ref(null);
const savings = ref([]);

// ✅ selectedId 자체를 감시하세요.
watch(
  selectedId,
  async (newId) => {
    if (newId != null) {
      const data = await savingApi.getRecommendSavings(newId);
      savings.value = data;
      console.log(savings.value);
    }
  },
  { immediate: true }
);
</script>

<template>
  <RecommendationLayout title="적금 추천">
    <template #slider>
      <SavingMyProductSlider @select="(id) => (selectedId = id)" />
    </template>

    <!-- 다시 불러오기 의 경우 -->
    <template #highlight v-if="selectedId == -1">
      혹시 이런 상품은 어떠세요?
    </template>
    <!-- 추천하는 적금이 있으면 -->
    <template #highlight v-else-if="savings.length > 0">
      지금보다 더 좋은 적금 상품을 찾았어요!
    </template>

    <!-- 더 좋은 적금이 없으면 -->
    <template #highlight v-else>
      지금보다 더 좋은 상품을 찾지 못했어요.
    </template>
    <template #content v-if="savings.length > 0">
      <BankbookProductList :selectedId="selectedId" :savings="savings" />
    </template>
  </RecommendationLayout>
</template>
