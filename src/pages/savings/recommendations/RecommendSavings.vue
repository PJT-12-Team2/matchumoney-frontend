<script setup>
import { ref } from 'vue';
import SavingMyProductSlider from '@/components/savings/SavingMyProductSlider.vue';
import BankbookProductList from '@/components/bankbook/BankbookProductList.vue';
import RecommendationLayout from '@/components/layouts/RecommendationLayout.vue';
// ✅ 이 부분 추가!
const selectedId = ref(null);
</script>

<template>
  <RecommendationLayout title="적금 추천">
    <template #slider>
      <SavingMyProductSlider @select="(id) => (selectedId = id)" />
    </template>

    <template #highlight> 지금보다 더 좋은 적금 상품을 찾았어요! </template>

    <template #content>
      <BankbookProductList :selectedId="selectedId" />
    </template>
  </RecommendationLayout>
</template>
