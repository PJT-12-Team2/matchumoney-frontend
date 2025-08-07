<template>
  <i
    :class="[isActive ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
    @click.stop="toggle"
    title="즐겨찾기"
  />
</template>

<script setup>
import { computed } from 'vue';
import favorite from '@/api/favorite';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  productId: { type: [String, Number], required: true },
  productType: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue', 'change']);

const isActive = computed({
  get: () => Boolean(props.modelValue),
  set: (val) => emit('update:modelValue', Boolean(val)),
});

const toggle = async () => {
  if (!props.productId) {
    console.error('❌ productId가 없습니다:', props.productId);
    return;
  }

  const newState = !isActive.value;

  // 낙관적 업데이트
  isActive.value = newState;
  emit('change', newState);

  try {
    if (newState) {
      await favorite.addFavorite(props.productId, props.productType);
      console.log('✅ 즐겨찾기 추가 성공:', props.productId);
    } else {
      await favorite.deleteFavorite(props.productId, props.productType);
      console.log('✅ 즐겨찾기 제거 성공:', props.productId);
    }
  } catch (error) {
    console.error('❌ 즐겨찾기 API 호출 실패:', error);

    // API 실패 시 롤백
    isActive.value = !newState;
    emit('change', !newState);

    // 409 에러 (이미 존재) 처리
    if (error.response?.status === 409 && newState) {
      console.log('ℹ️ 이미 즐겨찾기에 있는 상품, 상태 유지:', props.productId);
      isActive.value = true;
      emit('change', true);
    }
  }
};
</script>

<style scoped>
.favorite-icon {
  color: #ffbb00;
  font-size: 1.875rem;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.33, 1, 0.68, 1);
}

.favorite-icon:hover {
  transform: scale(1.2);
}
</style>
