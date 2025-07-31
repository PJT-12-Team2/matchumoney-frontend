<template>
  <div class="card-slider">
    <div class="slider-container">
      <div
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <!-- 등록된 카드들 -->
        <div
          v-for="(card, index) in cards"
          :key="card.holdingId"
          class="slide-item"
        >
          <CardSlide :card="card" />
        </div>

        <!-- 마지막 슬라이드: 카드 등록/업데이트 -->
        <div class="slide-item">
          <ActionCardSlide
            :has-cards="cards.length > 0"
            @register="$emit('register')"
            @update="$emit('update')"
          />
        </div>
      </div>
    </div>

    <!-- 슬라이더 컨트롤 -->
    <div class="slider-controls">
      <button
        class="control-btn prev"
        @click="prevSlide"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>

      <div class="slider-indicators">
        <span
          v-for="(_, index) in totalSlides"
          :key="index"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>

      <button
        class="control-btn next"
        @click="nextSlide"
        :disabled="currentIndex === totalSlides - 1"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import CardSlide from "./CardSlide.vue";
import ActionCardSlide from "./ActionCardSlide.vue";

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["register", "update", "cardChange"]);

const currentIndex = ref(0);

// 총 슬라이드 수 (카드 수 + 액션 카드 1개)
const totalSlides = computed(() => props.cards.length + 1);

// 현재 카드 정보
const currentCard = computed(() => {
  if (currentIndex.value < props.cards.length) {
    return props.cards[currentIndex.value];
  }
  return null;
});

const nextSlide = () => {
  if (currentIndex.value < totalSlides.value - 1) {
    currentIndex.value++;
    emitCardChange();
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    emitCardChange();
  }
};

const goToSlide = (index) => {
  currentIndex.value = index;
  emitCardChange();
};

// 카드 변경 이벤트 전송
const emitCardChange = () => {
  if (currentCard.value) {
    emit("cardChange", currentCard.value);
  }
};

// 컴포넌트 마운트 시 첫 번째 카드 자동 선택
onMounted(() => {
  if (props.cards.length > 0) {
    emit("cardChange", props.cards[0]);
  }
});

// 카드 목록이 변경되면 첫 번째 카드 자동 선택
watch(
  () => props.cards,
  (newCards) => {
    if (newCards.length > 0 && currentIndex.value === 0) {
      emit("cardChange", newCards[0]);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.card-slider {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 17rem;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.slider-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-item {
  flex: 0 0 100%;
  height: 100%;
}

.slider-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding: 0 var(--spacing-sm);
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: var(--color-white);
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--bg-hover);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

/* 반응형 */
@media (max-width: 768px) {
  .card-slider {
    max-width: 100%;
  }

  .slider-container {
    height: 17rem;
  }
}
</style>
