<template>
  <div class="card-visual-slider">
    <div class="slider-container">
      <div
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp">
        <!-- 카드 시각 정보만 보여주는 섹션 -->
        <div v-for="(card, index) in filteredCards" :key="card.holdingId || index" class="slide-item">
          <img :src="card.imageUrl" alt="카드 이미지" class="card-image" />
          <div class="card-name">{{ card.cardName }}</div>
        </div>
      </div>
    </div>

    <!-- 슬라이더 컨트롤 -->
    <div class="slider-controls">
      <div class="slider-indicators">
        <span
          v-for="(_, index) in filteredCards.length"
          :key="index"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
});

const filteredCards = computed(() => props.cards.filter((card) => !card.isActionCard));

const currentIndex = ref(0);

const nextSlide = () => {
  if (currentIndex.value < filteredCards.value.length - 1) {
    currentIndex.value++;
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const goToSlide = (index) => {
  currentIndex.value = index;
};

// 드래그/스와이프 관련 상태
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);

const handleMouseDown = (event) => {
  if (event.button !== 0) return;
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  currentX.value = event.clientX;
};

const handleMouseUp = () => {
  if (!isDragging.value) return;
  const diffX = startX.value - currentX.value;
  const threshold = 50;
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    isDragging.value = true;
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
  }
};

const handleTouchMove = (event) => {
  if (!isDragging.value || event.touches.length !== 1) return;
  currentX.value = event.touches[0].clientX;
  const diffY = Math.abs(startY.value - event.touches[0].clientY);
  if (diffY < 50) {
    event.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  const diffX = startX.value - currentX.value;
  const threshold = 50;
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
  isDragging.value = false;
};
</script>

<style scoped>
.card-visual-slider {
  width: 100%;
  margin: 0 auto;
}
.slider-container {
  position: relative;
  width: 100%;
  height: 15rem;
  overflow: hidden;
  border-radius: 20px;
}
.slider-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  cursor: grab;
}
.slider-wrapper:active {
  cursor: grabbing;
}
.slide-item {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: 1px solid var(--color-secondary-30);
  border-radius: 1rem;
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-md);
  background-color: var(--color-primary);
  transition: transform 0.2s ease;
  transform: scale(0.95);
  cursor: pointer;

  overflow: hidden; /* 추가 */
}

.slide-item:hover {
  transform: scale(1);
}
.card-image {
  max-width: 45%;
  height: auto;
}
.card-name {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  text-align: center;
}

.slider-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding: 0 var(--spacing-sm);
}
.slider-indicators {
  display: flex;
  gap: var(--spacing-sm);
}
.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s;
}
.indicator.active {
  background: var(--color-accent);
}
.indicator:hover {
  background: var(--text-secondary);
}
.indicator.active:hover {
  background: var(--color-dark);
}
</style>
