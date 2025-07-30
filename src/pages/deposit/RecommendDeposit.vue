<template>
  <div class="deposit-recommendations">
    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <h2 class="page-title">예금 추천</h2>

      <!-- 계좌 카드 슬라이더 -->
      <div class="account-slider">
        <!-- 계좌 로딩 중일 때 -->
        <div v-if="accountsLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>계좌 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 발생 시 -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <p>{{ error }}</p>
            <button @click="refreshAccounts" class="retry-button">
              다시 시도
            </button>
          </div>
        </div>

        <!-- 계좌 정보가 없을 때 -->
        <div v-else-if="accounts.length === 0" class="no-accounts">
          <p>등록된 계좌가 없습니다.</p>
          <button @click="refreshAccounts" class="refresh-button">
            새로고침
          </button>
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
                class="account-card p-5"
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
                  <!-- <div class="account-owner" v-if="account.ownerName">
                    <h4>예금주</h4>
                    <div class="owner-name">{{ account.ownerName }}</div>
                  </div> -->
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
          <!-- 새로고침 버튼 (옵션) -->
          <!-- <div class="refresh-section">
            <button @click="refreshAccounts" class="refresh-button-small">
              🔄 새로고침
            </button>
          </div> -->
        </div>
      </div>

      <!-- 검색 버튼 -->
      <div class="search-section">
        <button
          class="search-btn"
          @click="searchProducts"
          :disabled="loading || accountsLoading || !currentAccount"
        >
          {{ loading ? '검색 중...' : '가입 가능한 상품 검색' }}
        </button>
      </div>

      <!-- 추천 메시지 -->
      <!-- 추천 메시지 -->
      <div
        v-if="!loading && products.length > 0"
        class="recommendation-message slide-up fade-in"
      >
        <div class="recommendation-text">
          <span class="recommendation-icon">💰</span>
          {{ currentAccount?.nickname }}님의
          {{ currentAccount?.formattedBalance }} 잔액으로 가입 가능한
          {{ products.length }}개 상품을 찾았어요!
        </div>
      </div>

      <!-- 상품 리스트 -->
      <section class="products-section">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <div>맞춤 상품을 찾고 있습니다...</div>
        </div>

        <div v-else class="product-list fade-in">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="product-card"
            @click="selectProduct(product)"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="product-card-horizontal">
              <!-- 왼쪽: 로고 -->
              <div class="bank-logo-container">
                <img :src="getBankLogo(product.bankName)" alt="은행 로고" />
              </div>

              <!-- 가운데: 은행명 + 상품명 -->
              <div class="product-name-block">
                <div class="bank-name-bold">{{ product.bankName }}</div>
                <div class="product-name-bold">{{ product.productName }}</div>
              </div>

              <!-- 오른쪽: 금리 및 기타 정보 -->
              <div class="product-info-block">
                <div class="rate-line">
                  <span class="label-bold">최고 금리 : </span>
                  <span class="highlight-rate"
                    >{{ product.maxIntrRate2 }}%</span
                  >
                </div>
                <div class="rate-line">
                  최저 금리 : {{ product.maxIntrRate }}%
                </div>
                <div class="rate-line">
                  최소 가입 금액 : {{ product.minAmount }}
                </div>
                <div class="rate-line">
                  기준 기간 : {{ product.maxSaveTrm }}개월
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { errorMessages } from 'vue/compiler-sfc';

// 반응형 데이터
const products = ref([]);
const accounts = ref([]); // 빈 배열로 초기화 (API에서 가져올 예정)
const loading = ref(true);
const accountsLoading = ref(true); // 계좌 로딩 상태 추가
const currentSlide = ref(0);
const isSwiping = ref(false);
const error = ref(null); // 에러 상태 추가
const userId = ref('3');

// 터치/마우스 이벤트 관련
const startX = ref(0);
const currentX = ref(0);
const isDragging = ref(false);
const threshold = 50; // 스와이프 감지 임계값

// Props (부모 컴포넌트에서 userId를 받는 경우)
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const currentAccount = computed(() => {
  return accounts.value[currentSlide.value] || accounts.value[0];
});

// 계좌 정보 가져오기 (새로 추가된 API)
const fetchAccounts = async () => {
  accountsLoading.value = true;
  error.value = null;

  //${props.userId}
  try {
    const response = await axios.get(`/api/deposits/accounts/${userId.value}`); // 테스트 버전
    accounts.value = response.data;
  } catch (err) {
    // 에러 발생 시 기본 계좌 정보 사용 (fallback)
    console.err(err);
    accounts.value = [
      {
        accountName: 'KB 올인원 급여 통장',
        formattedBalance: '1,374,575원',
        accountNo: '******-04-181553',
        nickname: '혜진',
      },
      {
        accountName: '신한 My Car 통장',
        formattedBalance: '2,374,575원',
        accountNo: '******-12-456789',
        nickname: '혜진',
      },
      {
        accountName: '하나 Dream 적금',
        formattedBalance: '3,374,575원',
        accountNo: '******-98-741852',
        nickname: '혜진',
      },
      {
        accountName: '우리 WON 통장',
        formattedBalance: '4,374,575원',
        accountNo: '******-55-963741',
        nickname: '혜진',
      },
    ];
  } finally {
    accountsLoading.value = false;
  }
};

// 상품 정보 가져오기
const fetchProducts = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8080/api/deposits/recommendations/allProducts'
    );
    products.value = response.data; // 백엔드에서 넘어온 상품 리스트
  } catch (error) {
    console.error('상품 조회 오류:', error);
  } finally {
    loading.value = false;
  }
};

// 계좌 새로고침 함수
const refreshAccounts = () => {
  fetchAccounts();
};

const getBankLogo = (bankName) => {
  // 공통 로고 파일
  const busanLogo = new URL(
    '@/assets/bank-Logos/BK_BUSAN_Profile.png',
    import.meta.url
  ).href;
  const hanaLogo = new URL(
    '@/assets/bank-Logos/BK_HANA_Profile.png',
    import.meta.url
  ).href;

  const logoMap = {
    // 주요 시중은행
    국민은행: new URL('@/assets/bank-Logos/BK_KB_Profile.png', import.meta.url)
      .href,
    하나은행: hanaLogo,
    농협은행주식회사: new URL(
      '@/assets/bank-Logos/BK_NH_Profile.png',
      import.meta.url
    ).href,
    신한은행: new URL(
      '@/assets/bank-Logos/BK_Shinhan_Profile.png',
      import.meta.url
    ).href,
    우리은행: new URL(
      '@/assets/bank-Logos/BK_Woori_Profile.png',
      import.meta.url
    ).href,

    // 특수은행
    중소기업은행: new URL(
      '@/assets/bank-Logos/BK_IBK_Profile.png',
      import.meta.url
    ).href,
    한국산업은행: new URL(
      '@/assets/bank-Logos/BK_KDB_Profile.png',
      import.meta.url
    ).href,
    수협은행: new URL('@/assets/bank-Logos/BK_SH_Profile.png', import.meta.url)
      .href,

    // 지방은행
    경남은행: busanLogo,
    부산은행: busanLogo,
    광주은행: new URL(
      '@/assets/bank-Logos/BK_KWANGJU_Profile.png',
      import.meta.url
    ).href,
    전북은행: new URL(
      '@/assets/bank-Logos/BK_JEONBUK_Profile.png',
      import.meta.url
    ).href,
    제주은행: new URL(
      '@/assets/bank-Logos/BK_JEJU_Profile.png',
      import.meta.url
    ).href,
    아이엠뱅크: new URL(
      '@/assets/bank-Logos/BK_DAEGU_Profile.png',
      import.meta.url
    ).href,

    // 외국계은행
    한국스탠다드차타드은행: new URL(
      '@/assets/bank-Logos/BK_SC_Profile.png',
      import.meta.url
    ).href,

    // 인터넷은행
    '주식회사 카카오뱅크': new URL(
      '@/assets/bank-Logos/BK_KAKAO_Profile.png',
      import.meta.url
    ).href,
    '주식회사 케이뱅크': new URL(
      '@/assets/bank-Logos/BK_K_Profile.png',
      import.meta.url
    ).href,
    '토스뱅크 주식회사': new URL(
      '@/assets/bank-Logos/BK_TOSS_Profile.png',
      import.meta.url
    ).href,

    // 주식회사 명칭 포함
    '주식회사 하나은행': hanaLogo,
  };

  return logoMap[bankName] || '';
};

const selectProduct = (product) => {
  // 클릭한 상품 처리 예시
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
};

const goToSlide = (index) => {
  if (index >= 0 && index < accounts.value.length) {
    currentSlide.value = index;
  }
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % accounts.value.length;
};

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0
      ? accounts.value.length - 1
      : currentSlide.value - 1;
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

// 마우스 이벤트 핸들러 (데스크톱 지원)
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

const searchProducts = async () => {
  loading.value = true;

  try {
    // 현재 선택된 계좌의 정보 가져오기
    const currentAccountData = currentAccount.value;

    if (!currentAccountData) {
      console.error('선택된 계좌가 없습니다.');
      return;
    }

    // formattedBalance에서 숫자만 추출 (예: "1,374,575원" → 1374575)
    const balanceString = currentAccountData.formattedBalance || '0원';
    const balance = parseInt(balanceString.replace(/[^\d]/g, '')) || 0;

    console.log('검색 요청 데이터:', {
      userId: userId.value,
      balance: balance,
      accountNumber: currentAccountData.accountNo,
    });

    // 잔액 기반 상품 추천 API 호출
    const response = await axios.post(
      '/api/deposits/recommendations/byBalance',
      {
        userId: userId.value,
        balance: balance,
        accountNumber: currentAccountData.accountNo,
      }
    );

    products.value = response.data;
    console.log('추천 상품 조회 성공:', response.data);
  } catch (error) {
    console.error('상품 검색 오류:', error);

    // 에러 발생 시 기본 상품 목록으로 fallback
    try {
      const fallbackResponse = await axios.get(
        'http://localhost:8080/api/deposits/recommendations/allProducts'
      );
      products.value = fallbackResponse.data;
      console.log('기본 상품 목록으로 fallback');
    } catch (fallbackError) {
      console.error('fallback 상품 조회도 실패:', fallbackError);
    }
  } finally {
    loading.value = false;
  }
};

// 자동 슬라이드 (옵션)
let autoSlideInterval = null;

const startAutoSlide = () => {
  autoSlideInterval = setInterval(() => {
    if (!isDragging.value) {
      nextSlide();
    }
  }, 5000);
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};

// 라이프사이클 훅
onMounted(async () => {
  // 병렬로 API 호출
  await Promise.all([fetchProducts(), fetchAccounts()]);

  // 전체 로딩 완료
  loading.value = false;

  // 자동 슬라이드 시작 (선택사항)
  // startAutoSlide()
});

onUnmounted(() => {
  stopAutoSlide();
});

// 다른 컴포넌트에서 사용할 수 있도록 expose
defineExpose({
  refreshAccounts,
  fetchAccounts,
});
</script>

<style scoped>
/* ===== 기본 설정 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.deposit-recommendations {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  color: #1a1a1a;
  line-height: 1.6;
  width: 100%;
  min-height: 100vh;
}

.mobile-container {
  max-width: 393px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  position: relative;
}

/* ===== 페이지 제목 ===== */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #636363;
  text-align: center;
  margin-bottom: 10px;
}

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
.current-balance-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  text-align: right;
}

.search-btn {
  background: #609966;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.search-btn {
  background: #609966;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-button-small {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.refresh-button-small:hover {
  background-color: #545b62;
  transform: translateY(-1px);
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

/* ===== 검색 섹션 ===== */
.search-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

/* ===== 추천 메시지 ===== */
.recommendation-message {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 4px solid #609966;
}

.recommendation-text {
  font-size: 14px;
  font-weight: 700;
  color: #609966;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendation-icon {
  font-size: 16px;
}

/* ===== 상품 리스트 ===== */
.products-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #636363;
  margin-bottom: 20px;
}

.product-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.product-card {
  background: var(--color-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: var(--shadow-card);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

/* ===== 상품 카드 내부 레이아웃 ===== */
.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
}

.bank-logo-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.product-name-block {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

/* ===== 상품 텍스트 스타일 ===== */
.bank-name-bold {
  font-size: 14px;
  font-weight: 700;
  color: #1e2b4e;
  margin-bottom: 2px;
}

.product-name-bold {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.rate-line {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.label-bold {
  font-weight: bold;
  color: #333;
}

.highlight-rate {
  font-size: 18px;
  color: #609966;
  font-weight: bold;
}

/* ===== 로딩 애니메이션 ===== */
.loading {
  text-align: center;
  padding: 40px;
  color: #636363;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #609966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ===== 페이드 애니메이션 ===== */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 393px) {
  .deposit-recommendations {
    padding: 20px;
  }

  .mobile-container {
    max-width: 100%;
    box-shadow: none;
    border-radius: 20px;
    overflow: hidden;
  }

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

  .bank-logo-container {
    width: 4rem;
    height: 4rem;
  }

  .product-name-block {
    padding: 0 12px;
  }
}

@media (min-width: 1200px) {
  .mobile-container {
    margin: 0 auto;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.15);
    max-width: 800px;
  }

  .product-list {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .product-card {
    padding: 18px;
  }
}
</style>
