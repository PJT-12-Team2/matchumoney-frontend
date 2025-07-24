<template>
  <i
    :class="[isActive ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
    @click="toggle"
    title="즐겨찾기"
  ></i>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isActive = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    isActive.value = val;
  }
);

const toggle = () => {
  isActive.value = !isActive.value;
  console.log('즐겨찾기 변경');
  emit('update:modelValue', isActive.value);
};
</script>

<style scoped>
.favorite-icon {
  color: #ffbb00;
  font-size: var(--font-size-3xl);
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.33, 1, 0.68, 1);
}

.favorite-icon:hover {
  transform: scale(1.2);
}
</style>
