<template>
  <div class="product-list">
    <BankbookProductCard
      v-for="(saving, index) in savings"
      :key="index"
      :saving="saving"
    />
  </div>
</template>
<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.product-card {
  flex: 1 1 calc(50% - var(--font-size-xs)); /* 2개씩 */
  max-width: calc(50% - var(--font-size-xs));
}

@media (max-width: 1280px) {
  .product-card {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>
<script setup>
import { ref, watch, defineProps } from 'vue';
import BankbookProductCard from './BankbookProductCard.vue';
import savingApi from '@/api/savings';
const props = defineProps({
  selectedId: String,
});
const savings = ref([]);

watch(
  () => props.selectedId,
  async (newId) => {
    if (newId == -1) {
      savings.value = [];
    } else if (newId) {
      const data = await savingApi.getRecommendSavings(newId);
      savings.value = data;

      console.log(savings.value);
    }
  },
  { immediate: true } // 초기 selectedId 값 있을 때도 실행됨
);
</script>
