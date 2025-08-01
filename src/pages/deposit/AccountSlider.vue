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

    <!-- 계좌 정보가 없을 때 - 연결 카드만 표시 -->
    <div v-else-if="accounts.length === 0" class="no-accounts">
      <DepositConnectCard
        :user-id="userId"
        @connect-success="handleConnectSuccess"
      />
    </div>

    <!-- 계좌가 있을 때 - 계좌 + 추가 연결 카드 표시 -->
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
          <!-- 기존 계좌 카드들 -->
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

          <!-- 🆕 마지막 카드: 계좌 추가 연결 카드 -->
          <div
            class="account-card add-account-card"
            :class="{ swiping: isSwiping }"
          >
            <div class="add-account-content" @click="openConnectModal">
              <div class="add-account-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="plus-icon"
                >
                  <path
                    fill="#609966"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                  />
                </svg>
              </div>
              <div class="add-account-text">
                <div class="add-account-title">계좌 추가 연결</div>
                <div class="add-account-subtitle">
                  새로운 은행 계좌를<br />추가로 연결해보세요
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 슬라이더 인디케이터 (계좌 + 추가 카드 포함) -->
      <div class="slider-indicators" v-if="totalSlides > 1">
        <div
          v-for="index in totalSlides"
          :key="`indicator-${index - 1}`"
          class="indicator"
          :class="{
            active: currentSlide === index - 1,
            'add-indicator': index - 1 === accounts.length,
          }"
          @click="goToSlide(index - 1)"
        ></div>
      </div>
    </div>

    <!-- 🆕 계좌 연결 모달 -->
    <SavingConnectModal
      v-model:visible="showConnectModal"
      v-model:loading="isConnecting"
      @submit="handleConnect"
    />

    <!-- 🆕 계좌 재연결 모달 -->
    <SavingConnectModal
      v-model:visible="showReconnectModal"
      v-model:loading="isReconnecting"
      @submit="handleReconnect"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import SavingConnectModal from '@/components/savings/SavingConnectModal.vue';
import DepositConnectCard from './DepositConnectCard.vue';
import { useAuthStore } from '@/stores/auth';
import depositsApi from '@/api/deposit.js';

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
  userId: {
    type: String,
    required: false,
  },
});

// Emits
const emit = defineEmits(['refresh', 'slideChange', 'connect-success']);

// Auth Store
const authStore = useAuthStore();

// 반응형 데이터
const isSwiping = ref(false);
const startX = ref(0);
const currentX = ref(0);
const isDragging = ref(false);
const threshold = 50;

// 🆕 연결 관련
const showConnectModal = ref(false);
const isConnecting = ref(false);

// 🆕 재연결 관련
const showReconnectModal = ref(false);
const isReconnecting = ref(false);

// 🆕 전체 슬라이드 수 (계좌 + 추가 카드)
const totalSlides = computed(() => {
  return props.accounts.length > 0 ? props.accounts.length + 1 : 0;
});

// 실제 사용할 userId
const effectiveUserId = computed(() => {
  return props.userId || authStore.userId;
});

// 슬라이드 이동 함수들
const goToSlide = (index) => {
  if (index >= 0 && index < totalSlides.value) {
    emit('slideChange', index);
  }
};

const nextSlide = () => {
  const newIndex = (props.currentSlide + 1) % totalSlides.value;
  emit('slideChange', newIndex);
};

const prevSlide = () => {
  const newIndex =
    props.currentSlide === 0 ? totalSlides.value - 1 : props.currentSlide - 1;
  emit('slideChange', newIndex);
};

// 🆕 연결 성공 핸들러
const handleConnectSuccess = () => {
  emit('connect-success');
  emit('refresh'); // 계좌 목록 새로고침
};

// 🆕 계좌 추가 연결 모달 열기
const openConnectModal = () => {
  console.log('🔧 계좌 추가 연결 모달 열기:', {
    effectiveUserId: effectiveUserId.value,
    authStoreUserId: authStore.userId,
    propsUserId: props.userId,
  });

  if (!effectiveUserId.value) {
    console.error('❌ 사용자 ID가 없습니다');
    alert('로그인이 필요합니다.');
    return;
  }
  showConnectModal.value = true;
};

// 🆕 계좌 연결 처리
const handleConnect = async (loginData) => {
  if (!effectiveUserId.value) {
    alert('사용자 정보를 찾을 수 없습니다.');
    return;
  }

  isConnecting.value = true;

  try {
    console.log('계좌 추가 연결 시도:', {
      userId: effectiveUserId.value,
      loginData: { id: loginData.id, password: '***' },
    });

    // 🔧 개발 환경에서 특정 테스트 계정은 성공 시뮬레이션
    if (
      import.meta.env.DEV &&
      loginData.id === 'testuser' &&
      loginData.password === '1234'
    ) {
      console.log('🔧 개발 환경: 계좌 추가 연결 성공 시뮬레이션');

      // 성공 시뮬레이션용 딜레이
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('계좌 추가 연결 성공! (개발 테스트)');
      showConnectModal.value = false;
      emit('connect-success');
      return;
    }

    // 실제 API 호출
    const response = await depositsApi.connectAccount({
      userId: effectiveUserId.value,
      bankLoginId: loginData.id,
      bankPassword: loginData.password,
    });

    console.log('계좌 추가 연결 응답:', response);

    alert('계좌 추가 연결 성공!');
    showConnectModal.value = false;
    emit('connect-success');
  } catch (error) {
    console.error('계좌 추가 연결 실패:', error);

    // 에러 타입별 메시지 처리
    let errorMessage = '계좌 추가 연결에 실패했습니다.';

    if (error.response?.status === 401) {
      errorMessage = '은행 로그인 정보가 올바르지 않습니다.';
    } else if (error.response?.status === 404) {
      errorMessage = '해당 은행에서 계좌를 찾을 수 없습니다.';
    } else if (error.response?.status === 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    alert(errorMessage);
  } finally {
    isConnecting.value = false;
  }
};

// 🆕 재연결 관련 함수들
const openReconnectModal = () => {
  showReconnectModal.value = true;
};

const handleReconnect = async (loginData) => {
  isReconnecting.value = true;

  try {
    console.log('계좌 재연결 시도:', loginData);

    // 임시 딜레이 (실제로는 API 호출)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert('계좌 재연결 성공!');
    showReconnectModal.value = false;
    emit('refresh'); // 계좌 목록 새로고침
  } catch (error) {
    console.error('계좌 재연결 실패:', error);
    alert('계좌 재연결에 실패했습니다. 다시 시도해주세요.');
  } finally {
    isReconnecting.value = false;
  }
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
  background-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  padding: 40px 20px 20px 40px;
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
  color: var(--color-dark);
  margin-bottom: 30px;
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
  color: var(--color-title);
  margin-bottom: 5px;
}

.balance-amount,
.account-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1.4;
}

.account-number {
  color: var(--color-title);
}

.dropdown-arrow {
  font-size: 16px;
  font-weight: 900;
  color: var(--color-dark);
}

/* ===== 🆕 계좌 추가 연결 카드 ===== */
.add-account-card {
  background: var(--color-light);
  border: 2px dashed var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.add-account-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-dark);
}

.add-account-card:hover .plus-icon {
  transform: scale(1.2);
}

.add-account-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-align: center;
  width: 100%;
}

.add-account-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  width: 50px;
  height: 50px;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.add-account-text {
  text-align: center;
}

.add-account-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 8px;
}

.add-account-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-accent);
  line-height: 1.4;
}

/* ===== 🆕 재연결 버튼 ===== */
.reconnect-section {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.reconnect-button {
  background: rgba(96, 153, 102, 0.9);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reconnect-button:hover {
  background: var(--color-dark);
  transform: scale(1.1);
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
  background-color: var(--color-primary);
}

.error-container {
  background-color: #fee;
  border: 1px solid #fecaca;
}

.no-accounts {
  background: transparent;
  padding: 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-container p,
.error-message p {
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
.retry-button {
  background-color: var(--color-accent);
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

.retry-button:hover {
  background-color: var(--color-dark);
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
  background: var(--color-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--color-accent);
  transform: scale(1.2);
}

.indicator.add-indicator {
  background: var(--color-dark);
  border: 2px solid var(--color-accent);
}

.indicator.add-indicator.active {
  background: var(--color-accent);
  border-color: var(--color-dark);
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

  .add-account-title {
    font-size: 20px;
  }

  .add-account-subtitle {
    font-size: 12px;
  }

  .plus-icon {
    width: 40px;
    height: 40px;
  }

  .loading-container,
  .error-container {
    min-height: 150px;
    padding: 1.5rem;
  }

  .loading-container p,
  .error-message p {
    font-size: 14px;
  }

  .retry-button {
    padding: 0.6rem 1.2rem;
    font-size: 14px;
  }

  .reconnect-button {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}
</style>
