<!-- src/components/base/CompareButton.vue -->
<template>
  <div class="compare-button" @click.stop="$emit('click')">⊕ {{ label }}</div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '비교 추가',
  },
});
defineEmits(['click']);
</script>

<style scoped>
.compare-button {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease;
}
.compare-button:hover {
  transform: scale(1.05);
}
</style>
