<template>
  <i
    :class="[modelValue ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
    @click="toggle"
    title="즐겨찾기"
  ></i>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean, // "true" / "false" 문자열로 전달됨
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isActive = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val.toString()), // ✅ 올바른 setter
});

const toggle = () => {
  isActive.value = !isActive.value;
  console.log('즐겨찾기 변경:', isActive.value);
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
