<!-- src/components/common/LikeToggle.vue -->
<template>
  <span
    class="reaction-button"
    :class="{ active: internalLiked }"
    @click="handleClick"
  >
    {{ internalLiked ? '❤️' : '🤍' }} {{ likeCount }}
  </span>
</template>

<script setup>
import { ref, watch } from 'vue';
import likeAPI from '@/api/like';
import { useRouter } from 'vue-router';

const props = defineProps({
  productId: { type: [String, Number], required: true },
  productType: { type: String, required: true }, // 예: 'card-products'
  initialLiked: { type: Boolean, required: true },
  initialCount: { type: Number, default: 0 }
});

const emit = defineEmits(['update']);

const router = useRouter();
const userId = ref(sessionStorage.getItem('userId'));

const internalLiked = ref(props.initialLiked);
const likeCount = ref(props.initialCount);

const handleClick = async () => {
  if (!userId.value) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
      router.push('/login');
    }
    return;
  }

  try {
    const data = await likeAPI.toggleLike(props.productId, props.productType, internalLiked.value);
    internalLiked.value = data.liked;
    likeCount.value = data.likeCount;
    emit('update', { liked: data.liked, count: data.likeCount }); // 부모에게도 알림
  } catch (error) {
    console.error('좋아요 처리 중 오류:', error);
  }
};
</script>

<style scoped>
.reaction-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.reaction-button:hover {
  background-color: #e0e0e0;
}
.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}
</style>