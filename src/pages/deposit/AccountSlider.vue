<template>
  <div class="account-slider">
    <!-- 계좌 로딩 중일 때 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>계좌 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 발생 시 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <p>{{ error }}</p>
        <button @click="$emit('refresh')" class="retry-button">
          다시 시도
        </button>
      </div>
    </div>

    <!-- 계좌 정보가 없을 때 -->
    <div v-else-if="accounts.length === 0" class="no-accounts">
      <p>등록된 계좌가 없습니다.</p>
      <button @click="$emit('refresh')" class="refresh-button">새로고침</button>
    </div>

    <!-- 정상적으로 계좌 정보가 있을 때 -->
    <div v-else>
      <div class="slider-container">
        <div
          class="slider-wrapper"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        >
          <div
            v-for="(account, index) in accounts"
            :key="account.id || index"
            class="account-card"
            :class="{ swiping: isSwiping }"
          >
            <div class="account-name">
              {{ account.name || account.accountName || '계좌명 없음' }}
            </div>
            <div class="account-details">
              <div class="balance-section">
                <h4>잔액</h4>
                <div class="balance-amount">
                  {{ account.formattedBalance }}
                </div>
              </div>
              <div class="account-section">
                <h4>계좌 번호</h4>
                <div class="account-number">
                  {{ account.accountNo || '계좌번호 없음' }}
                </div>
              </div>
              <div class="dropdown-arrow">
                <h4>▶</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 슬라이더 인디케이터 -->
      <div class="slider-indicators" v-if="accounts.length > 1">
        <div
          v-for="(account, index) in accounts"
          :key="`indicator-${account.id || index}`"
          class="indicator"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

// Props
const props = defineProps({
  accounts: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  currentSlide: {
    type: Number,
    default: 0,
  },
});

// Emits
const emit = defineEmits(['refresh', 'slideChange']);

// 반응형 데이터
const isSwiping = ref(false);
const startX = ref(0);
const currentX = ref(0);
const isDragging = ref(false);
const threshold = 50;

// 슬라이드 이동 함수들
const goToSlide = (index) => {
  if (index >= 0 && index < props.accounts.length) {
    emit('slideChange', index);
  }
};

const nextSlide = () => {
  const newIndex = (props.currentSlide + 1) % props.accounts.length;
  emit('slideChange', newIndex);
};

const prevSlide = () => {
  const newIndex =
    props.currentSlide === 0
      ? props.accounts.length - 1
      : props.currentSlide - 1;
  emit('slideChange', newIndex);
};

// 터치 이벤트 핸들러
const handleTouchStart = (e) => {
  startX.value = e.touches[0].clientX;
  isDragging.value = true;
  isSwiping.value = true;
};

const handleTouchMove = (e) => {
  if (!isDragging.value) return;
  currentX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  const deltaX = startX.value - currentX.value;

  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }

  isDragging.value = false;
  isSwiping.value = false;
};

// 마우스 이벤트 핸들러
const handleMouseDown = (e) => {
  startX.value = e.clientX;
  isDragging.value = true;
  isSwiping.value = true;
  e.preventDefault();
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  currentX.value = e.clientX;
  e.preventDefault();
};

const handleMouseUp = () => {
  if (!isDragging.value) return;

  const deltaX = startX.value - currentX.value;

  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }

  isDragging.value = false;
  isSwiping.value = false;
};
</script>

<style scoped>
/* ===== 계좌 슬라이더 ===== */
.account-slider {
  position: relative;
  margin-bottom: 10px;
}

.slider-container {
  overflow: hidden;
  border-radius: 20px;
}

.slider-wrapper {
  display: flex;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  padding-bottom: 5px;
}

.account-card {
  min-width: 100%;
  background-color: var(--color-primary, #f8f9fa);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.account-card.swiping {
  transition: none;
}

.account-name {
  font-size: 24px;
  font-weight: 700;
  color: #40513b;
  margin-bottom: 15px;
}

.account-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.balance-section h4,
.account-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #636363;
  margin-bottom: 5px;
}

.balance-amount,
.account-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent, #609966);
  line-height: 1.4;
}

.account-number {
  color: #636363;
}

.dropdown-arrow {
  font-size: 16px;
  font-weight: 900;
  color: #40513b;
}

/* ===== 로딩/에러/빈 상태 ===== */
.loading-container,
.error-container,
.no-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 10px;
}

.loading-container {
  background-color: var(--color-primary, #f8f9fa);
}

.error-container {
  background-color: #fee;
  border: 1px solid #fecaca;
}

.no-accounts {
  background-color: var(--color-primary, #f8f9fa);
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #609966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-container p,
.error-message p,
.no-accounts p {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
}

.error-message {
  text-align: center;
  color: #dc3545;
}

/* ===== 버튼 스타일 ===== */
.retry-button,
.refresh-button {
  background-color: #609966;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(96, 153, 102, 0.2);
}

.retry-button:hover,
.refresh-button:hover {
  background-color: #507a55;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(96, 153, 102, 0.3);
}

/* ===== 슬라이더 인디케이터 ===== */
.slider-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9d9;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #609966;
  transform: scale(1.2);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 393px) {
  .account-name {
    font-size: 20px;
  }

  .balance-section h4,
  .account-section h4 {
    font-size: 12px;
  }

  .balance-amount,
  .account-number {
    font-size: 16px;
  }

  .dropdown-arrow {
    display: none;
  }

  .loading-container,
  .error-container,
  .no-accounts {
    min-height: 150px;
    padding: 1.5rem;
  }

  .loading-container p,
  .error-message p,
  .no-accounts p {
    font-size: 14px;
  }

  .retry-button,
  .refresh-button {
    padding: 0.6rem 1.2rem;
    font-size: 14px;
  }
}
</style>
