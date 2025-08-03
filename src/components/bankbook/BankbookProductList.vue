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
  padding: 2% 6%;
}

@media (max-width: 1024px) {
  .product-card {
    flex: 1 1 calc(50% - var(--font-size-xs)); /* 2개씩 */
    max-width: calc(50% - var(--font-size-xs));
    padding: 4%;
  }
}

@media (max-width: 600px) {
  .product-card {
    flex: 1 1 100%;
    max-width: 100%;
    padding: 4% 8%;
  }
}
@media (max-width: 480px) {
  .product-card {
    flex: 1 1 100%;
    max-width: 100%;
    padding: 4%;
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
