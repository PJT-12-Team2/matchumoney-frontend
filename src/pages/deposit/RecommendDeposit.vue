<template>
  <div class="deposit-recommendations">
    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <h2 class="page-title">예금 추천</h2>

      <!-- 계좌 카드 슬라이더 -->
      <div class="account-slider">
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
              :key="index"
              class="account-card p-5"
              :class="{ swiping: isSwiping }"
            >
              <div class="account-name">{{ account.name }}</div>
              <div class="account-details">
                <div class="balance-section">
                  <h4>잔액</h4>
                  <div class="balance-amount">
                    {{ formatCurrency(account.balance) }}
                  </div>
                </div>
                <div class="account-section">
                  <h4>계좌 번호</h4>
                  <div class="account-number">{{ account.accountNumber }}</div>
                </div>
                <div class="dropdown-arrow">
                  <h4>▶</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 슬라이더 인디케이터 -->
        <div class="slider-indicators">
          <div
            v-for="(account, index) in accounts"
            :key="`indicator-${index}`"
            class="indicator"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></div>
        </div>
      </div>

      <!-- 검색 버튼 -->
      <div class="search-section">
        <button class="search-btn" @click="searchProducts" :disabled="loading">
          {{ loading ? '검색 중...' : '검 색' }}
        </button>
      </div>

      <!-- 추천 메시지 -->
      <div v-if="!loading" class="recommendation-message slide-up fade-in">
        <div class="recommendation-text">
          <span class="recommendation-icon">✨</span>
          {{ currentAccount.ownerName }}님에게 적합한 예금 상품을 찾았어요!
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
            <div class="product-header">
              <div class="bank-logo">
                <img :src="getBankLogo(product.bankInitial)" alt="은행 로고" />
              </div>
              <div class="product-info">
                <div class="bank-name">{{ product.bank }}</div>
                <h4>{{ product.name }}</h4>
                <div class="product-details" v-html="product.details"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'DepositRecommendations',
  setup() {
    const loading = ref(true);
    const currentSlide = ref(0);
    const isSwiping = ref(false);

    // 터치/마우스 이벤트 관련
    const startX = ref(0);
    const currentX = ref(0);
    const isDragging = ref(false);
    const threshold = 50; // 스와이프 감지 임계값

    const getBankLogo = (bankInitial) => {
      const logoMap = {
        KB: new URL('@/assets/bank-Logos/BK_KB_Profile.png', import.meta.url)
          .href,
        하나: new URL(
          '@/assets/bank-Logos/BK_Hana_Profile.png',
          import.meta.url
        ).href,
        NH: new URL('@/assets/bank-Logos/BK_NH_Profile.png', import.meta.url)
          .href,
        신한: new URL(
          '@/assets/bank-Logos/BK_Shinhan_Profile.png',
          import.meta.url
        ).href,
        // 필요 시 더 추가
      };

      return logoMap[bankInitial] || '';
    };

    const accounts = ref([
      {
        name: 'KB 올인원 급여 통장',
        balance: 1374575,
        accountNumber: '******-04-181553',
        ownerName: '혜진',
      },
      {
        name: '신한 My Car 통장',
        balance: 2856320,
        accountNumber: '******-12-456789',
        ownerName: '혜진',
      },
      {
        name: '하나 Dream 적금',
        balance: 5420100,
        accountNumber: '******-98-741852',
        ownerName: '혜진',
      },
      {
        name: '우리 WON 통장',
        balance: 892140,
        accountNumber: '******-55-963741',
        ownerName: '혜진',
      },
    ]);

    const products = ref([
      {
        id: 1,
        name: 'KB Star 정기 예금',
        bank: 'KB 국민은행',
        bankInitial: 'KB',
        details: `최고 금리&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.45%</span><br>
                 기본 금리&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.15%</span><br>
                 금액&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;연 1백만원 이상<br>
                 개월 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12개월`,
      },
      {
        id: 2,
        name: '행복 3·6·9 정기예금',
        bank: '하나은행',
        bankInitial: '하나',
        details: `최고 금리&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.30%</span><br>
                 기본 금리&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.30%</span><br>
                 금액&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;연 1백만원 이상<br>
                 개월 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12개월`,
      },
      {
        id: 3,
        name: 'NH올원뱅크 정기예금',
        bank: '농협은행',
        bankInitial: 'NH',
        details: `최고 금리&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.35%</span><br>
                 기본 금리&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.20%</span><br>
                 금액&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;연 50만원 이상<br>
                 개월 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6/12개월`,
      },
      {
        id: 4,
        name: '신한 쏠편한 정기예금',
        bank: '신한은행',
        bankInitial: '신한',
        details: `최고 금리&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.40%</span><br>
                 기본 금리&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="rate-highlight">연 2.25%</span><br>
                 금액&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;연 1백만원 이상<br>
                 개월 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12/24개월`,
      },
    ]);

    const currentAccount = computed(() => {
      return accounts.value[currentSlide.value] || accounts.value[0];
    });

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

    const searchProducts = () => {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        // 검색 결과 업데이트 로직
      }, 1500);
    };

    const selectProduct = (product) => {
      // 실제로는 이벤트 emit이나 라우터 네비게이션
      console.log(`${product.name} 상품을 선택했습니다.`);
      // this.$emit('product-selected', product)
      // 또는 this.$router.push(`/products/${product.id}`)
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

    onMounted(() => {
      // 초기 로딩
      setTimeout(() => {
        loading.value = false;
      }, 1000);

      // 자동 슬라이드 시작 (선택사항)
      // startAutoSlide()
    });

    onUnmounted(() => {
      stopAutoSlide();
    });

    return {
      loading,
      currentSlide,
      isSwiping,
      accounts,
      products,
      currentAccount,
      formatCurrency,
      goToSlide,
      nextSlide,
      prevSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      searchProducts,
      selectProduct,
      getBankLogo,
    };
  },
};
</script>

<style scoped>
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

/* 메인 컨텐츠 */
.main-content {
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #636363;
  text-align: center;
  margin-bottom: 10px;
}

/* 계좌 카드 슬라이더 */
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08); /* 아래쪽 그림자만 */
  padding: 20px;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  user-select: none;
  /* margin-right 제거 → 옆 카드 안 보이게 */
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

.balance-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #636363;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1.4;
}

.account-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #636363;
  margin-bottom: 8px;
}

.account-number {
  font-size: 20px;
  font-weight: 700;
  color: #636363;
  line-height: 1.4;
}

.dropdown-arrow {
  top: 20px;
  right: 20px;
  font-size: 16px;
  font-weight: 900;
  color: #40513b;
}

/* 슬라이더 인디케이터 */
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

/* 검색 버튼 */
.search-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
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
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 추천 메시지 */
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

/* 상품 리스트 */
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
  background-color: var(--color-light);
  box-shadow: var(--shadow-card);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  width: 100%;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #609966;
}

.product-header {
  display: flex;
  flex-direction: row; /* 가로 정렬 */
  align-items: center; /* 로고를 세로 중앙 정렬 */
  gap: 16px;
}

.bank-logo {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: #609966;
}
.bank-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.product-info h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 12px;
}

.bank-name {
  font-size: 13px;
  font-weight: 700;
  color: #636363;
}

.product-details {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rate-highlight {
  color: #609966;
  font-weight: 700;
}

/* 로딩 애니메이션 */
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

/* 애니메이션 */
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

/* 터치 스와이프 효과 */
.account-card.swiping {
  transition: none;
}

/* 반응형 디자인 - 웹사이트 전체 화면 대응 */
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

  .bank-logo {
    width: 50px;
    height: 50px;
  }

  .dropdown-arrow {
    display: none; /* 작은 화면일 땐 안보이게 */
  }

  .product-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

/* 태블릿 사이즈 */
@media (min-width: 769px) {
  .bank-logo {
    margin: 0 100px 0 100px;
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

  .bank-logo {
    margin-right: 80px;
  }

  .product-info h4 {
    font-size: 16px;
  }

  .product-details {
    font-size: 13px;
  }
}
</style>
