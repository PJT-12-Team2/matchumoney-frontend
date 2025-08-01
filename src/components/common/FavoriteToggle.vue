<template>
  <i
    :class="[isActive ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
    @click="toggle"
    title="즐겨찾기"
  ></i>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import favorite from '@/api/favorite';

const props = defineProps({
  modelValue: {
    type: Boolean, // "true" / "false" 문자열로 전달됨
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isActive = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val), // ✅ 올바른 setter
});

const toggle = async () => {
  if (isActive.value) {
    try {
      await favorite.deleteFavorite(props.productId, props.productType);
      isActive.value = !isActive.value;
      console.log(
        props.productType + '의 ' + props.productId + ' 상품 즐겨찾기 제거'
      );
    } catch (e) {
      console.log(e);
    } finally {
    }
  } else {
    try {
      await favorite.addFavorite(props.productId, props.productType);
      isActive.value = !isActive.value;
      console.log(
        props.productType + '의 ' + props.productId + ' 상품 즐겨찾기 추가'
      );
    } catch (e) {
      console.log(e);
    } finally {
    }
  }
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
