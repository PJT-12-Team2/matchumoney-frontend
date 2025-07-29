<template>
  <div class="loading-overlay">
    <img src="../../assets/loading/loading_character.gif" style="width: 8rem" />
  </div>
</template>
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  loading: Boolean,
});
</script>
<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-modal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--spacing-md);
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease;
}
</style>
