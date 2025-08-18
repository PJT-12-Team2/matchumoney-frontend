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

    <!-- 계좌 정보가 없을 때 - BankConnectModal 사용 -->
    <div v-else-if="accounts.length === 0" class="no-accounts">
      <div class="saving-card" @click.stop="openModal">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="product-logo"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="#40513B"
            d="M296 256c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm192 200v-48c0-4.4-3.6-8-8-8H296c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8m-48 396H208V148h560v344c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V108c0-17.7-14.3-32-32-32H168c-17.7 0-32 14.3-32 32v784c0 17.7 14.3 32 32 32h272c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m104.1-115.6c1.8-34.5 16.2-66.8 40.8-91.4c26.2-26.2 62-41 99.1-41c37.4 0 72.6 14.6 99.1 41c3.2 3.2 6.3 6.6 9.2 10.1L769.2 673a8 8 0 0 0 3 14.1l93.3 22.5c5 1.2 9.8-2.6 9.9-7.7l.6-95.4a8 8 0 0 0-12.9-6.4l-20.3 15.8C805.4 569.6 748.1 540 684 540c-109.9 0-199.6 86.9-204 195.7c-.2 4.5 3.5 8.3 8 8.3h48.1c4.3 0 7.8-3.3 8-7.6M880 744h-48.1c-4.3 0-7.8 3.3-8 7.6c-1.8 34.5-16.2 66.8-40.8 91.4c-26.2 26.2-62 41-99.1 41c-37.4 0-72.6-14.6-99.1-41c-3.2-3.2-6.3-6.6-9.2-10.1l23.1-17.9a8 8 0 0 0-3-14.1l-93.3-22.5c-5-1.2-9.8 2.6-9.9-7.7l-.6 95.4a8 8 0 0 0 12.9 6.4l20.3-15.8C562.6 918.4 619.9 948 684 948c109.9 0 199.6-86.9 204-195.7c.2-4.5-3.5-8.3-8-8.3"
          />
        </svg>
        <div class="card-content">
          <div class="card-title">내 예/적금 불러오기</div>
          <div class="card-info label">
            예/적금 정보를 불러와<br />
            지금 바로 시작해보세요!
          </div>
        </div>
      </div>
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
            </div>
          </div>

          <!-- 마지막 카드: 계좌 추가 연결 카드 + BankConnectModal -->
          <div
            class="account-card add-account-card"
            :class="{ swiping: isSwiping }"
            @click.stop="openModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="product-logo"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="#40513B"
                d="M296 256c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm192 200v-48c0-4.4-3.6-8-8-8H296c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8m-48 396H208V148h560v344c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V108c0-17.7-14.3-32-32-32H168c-17.7 0-32 14.3-32 32v784c0 17.7 14.3 32 32 32h272c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m104.1-115.6c1.8-34.5 16.2-66.8 40.8-91.4c26.2-26.2 62-41 99.1-41c37.4 0 72.6 14.6 99.1 41c3.2 3.2 6.3 6.6 9.2 10.1L769.2 673a8 8 0 0 0 3 14.1l93.3 22.5c5 1.2 9.8-2.6 9.9-7.7l.6-95.4a8 8 0 0 0-12.9-6.4l-20.3 15.8C805.4 569.6 748.1 540 684 540c-109.9 0-199.6 86.9-204 195.7c-.2 4.5 3.5 8.3 8 8.3h48.1c4.3 0 7.8-3.3 8-7.6M880 744h-48.1c-4.3 0-7.8 3.3-8 7.6c-1.8 34.5-16.2 66.8-40.8 91.4c-26.2 26.2-62 41-99.1 41c-37.4 0-72.6-14.6-99.1-41c-3.2-3.2-6.3-6.6-9.2-10.1l23.1-17.9a8 8 0 0 0-3-14.1l-93.3-22.5c-5-1.2-9.8 2.6-9.9-7.7l-.6 95.4a8 8 0 0 0 12.9 6.4l20.3-15.8C562.6 918.4 619.9 948 684 948c109.9 0 199.6-86.9 204-195.7c.2-4.5-3.5-8.3-8-8.3"
              />
            </svg>
            <div class="card-content">
              <div class="card-title">예/적금 다시 불러오기</div>
              <div class="card-info label">
                예/적금 정보를 다시 불러와<br />
                최신 상태로 확인해보세요!
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

    <!-- BankConnectModal 사용 -->
    <BankConnectModal
      v-model="showModal"
      :requireBirthdate="requireBirth"
      :connectedCodes="connected"
      @update:connectedCodes="connected = $event"
      @connected="onConnected"
      @edited="onEdited"
      @removedAll="onRemovedAll"
      @loadPrevious="onLoadPrevious"
    />

    <!-- 로딩 화면 -->
    <div
      v-if="isLoading"
      style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        src="@/assets/loading/loading_character.gif"
        alt="로딩 중..."
        style="height: 30vh; max-height: 250px; min-height: 120px; width: auto"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
import BankConnectModal from '@/components/savings/BankConnectModal.vue';
import { useAuthStore } from '@/stores/auth';
import codefApi from '@/api/codef';

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

// BankConnectModal 관련
const showModal = ref(false);
const requireBirth = ref(false);
const connected = ref([]);
const isLoading = ref(false);

// 전체 슬라이드 수 (계좌 + 추가 카드)
const totalSlides = computed(() => {
  return props.accounts.length > 0 ? props.accounts.length + 1 : 0;
});

// 실제 사용할 userId
const effectiveUserId = computed(() => {
  return props.userId || authStore.userId;
});

// 초기화 시 연결된 은행 정보 로드
onMounted(async () => {
  connected.value = await codefApi.getBankByConnectedId();
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

// 연결 성공 핸들러
const handleConnectSuccess = () => {
  emit('connect-success');
  emit('refresh'); // 계좌 목록 새로고침
};

// 모달 열기
const openModal = () => {
  showModal.value = true;
};

// BankConnectModal 이벤트 핸들러들
const onLoadPrevious = async () => {
  isLoading.value = true;
  try {
    await codefApi.syncAccountsPre();
    alert('예/적금 연결 성공!');
    showModal.value = false;
    window.location.reload();
  } catch (e) {
    console.error(e);
    const errorList = e.response?.data?.errors || [];
    let errorMessage = '';
    for (const error of errorList) {
      console.log(error.code);
      if (error.code === 'CF-12855') {
        console.log('생일 입력 필요!!');
        requireBirth.value = true;
      }
      errorMessage += (error.message || '') + '\n';
    }
    alert('예/적금 연결 실패\n' + errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const onRemovedAll = async () => {
  isLoading.value = true;
  console.log('제거를 시작합니다!');
  try {
    await codefApi.deleteConnectedId();
    alert('제거 완료');
    showModal.value = false;
    window.location.reload();
  } catch (e) {
    console.error(e);
    alert('제거 실패\n');
  } finally {
    isLoading.value = false;
  }
};

const onEdited = async (loginDto) => {
  isLoading.value = true;
  console.log('업데이트를 시작합니다!');
  try {
    await codefApi.updateConnectedId(loginDto);
    alert('예/적금 연결 성공!');
    showModal.value = false;
    window.location.reload();
  } catch (e) {
    console.error(e);
    const errorList = e.response?.data?.errors || [];
    let errorMessage = '';
    for (const error of errorList) {
      console.log(error.code);
      if (error.code === 'CF-12855') {
        console.log('생일 입력 필요!!');
        requireBirth.value = true;
      }
      errorMessage += (error.message || '') + '\n';
    }
    alert('예/적금 연결 실패\n' + errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const onConnected = async (loginDto) => {
  isLoading.value = true;
  try {
    await codefApi.syncAccounts(loginDto);
    alert('예/적금 연결 성공!');
    showModal.value = false;
    window.location.reload();
  } catch (e) {
    console.error(e);
    const errorList = e.response?.data?.errors || [];
    let errorMessage = '';
    for (const error of errorList) {
      console.log(error.code);
      if (error.code === 'CF-12855') {
        console.log('생일 입력 필요!!');
        requireBirth.value = true;
      }
      errorMessage += (error.message || '') + '\n';
    }
    alert('예/적금 연결 실패\n' + errorMessage);
  } finally {
    isLoading.value = false;
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
.saving-card {
  background-color: var(--color-light);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--spacing-lg);
  gap: var(--spacing-md);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  width: 100%;
}

.product-logo {
  width: 24%;
  max-width: 200px;
  max-height: 100px;
}

.card-title {
  font-weight: bold;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: end;
  font-size: var(--font-size-base);
  color: var(--color-title);
}
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
  box-shadow: var(--shadow-card);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--spacing-lg);
  position: relative;
  cursor: pointer;
  user-select: none;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.account-card.swiping {
  transition: none;
}

.account-name {
  font-weight: bold;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.account-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  justify-content: space-between;
  align-items: flex-end;
}

.balance-section h4,
.account-section h4 {
  font-size: var(--font-size-xl);
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

/* ===== 🆕 계좌 추가 연결 카드 ===== */
.add-account-card {
  background: var(--color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-account-card:hover {
  box-shadow: var(--box-shadow);
  border-color: var(--color-dark);
}

/* ===== 로딩/에러/빈 상태 ===== */
.loading-container,
.error-container,
.no-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 10px;
  margin: 20px 0;
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
  box-shadow: var(--box-shadow);
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
@media (max-width: 420px) {
  .account-card {
    min-height: 120px;
  }
  .account-name {
    font-size: var(--font-size-2xl);
  }

  .balance-section h4,
  .account-section h4 {
    font-size: var(--font-size-lg);
  }

  .balance-amount,
  .account-number {
    font-size: var(--font-size-lg);
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
}
</style>
