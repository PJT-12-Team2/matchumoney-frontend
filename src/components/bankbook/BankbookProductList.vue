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
import { defineProps } from 'vue';
import BankbookProductCard from './BankbookProductCard.vue';

const props = defineProps({
  selectedId: String,
  savings: {
    type: Array,
  },
});
</script>
