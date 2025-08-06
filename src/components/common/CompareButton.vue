<template>
  <button
    class="compare-button remove"
    @click.stop="onCompareClick"
    v-if="isAlreadyCompared"
  >
    ⊖ 비교제거
  </button>
  <button class="compare-button" @click.stop="onCompareClick" v-else>
    ⊕ 비교추가
  </button>
</template>

<script setup>
import { useCompareStore } from '@/stores/compareStore';
import { defineProps, computed } from 'vue';
const compareStore = useCompareStore();

const props = defineProps({
  productId: {
    type: Number,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
});
const isAlreadyCompared = computed(() =>
  compareStore.isCompared(props.productId, props.productType)
);
const onCompareClick = () => {
  if (isAlreadyCompared.value) {
    console.log(`${props.productId} (${props.productType}) 비교 제거 클릭됨`);
    compareStore.removeProduct({
      id: props.productId,
      type: props.productType,
    });
  } else {
    console.log(`${props.productId} (${props.productType}) 비교 추가 클릭됨`);
    compareStore.addProduct({
      id: props.productId,
      type: props.productType,
    });
  }
};
</script>

<style scoped>
.compare-button {
  font-size: 0.8rem;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease;
  background: none;
  border: none;
  padding: 0.4rem;
}
.compare-button:hover {
  transform: scale(1.05);
}
.remove {
  color: red;
}
@media (max-width: 1024px) {
  .compare-button {
    font-size: var(--font-size-sm);
  }
}
</style>
