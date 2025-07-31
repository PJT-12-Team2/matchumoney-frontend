<template>
  <div class="deposit-recommendations">
    <main class="main-content">
      <h2 class="page-title">예금 추천</h2>

      <!-- 로그인하지 않은 경우-->
      <div v-if="!isLoggedIn" class="auth-required">
        <div class="auth-message">
          <div class="auth-icon">🔐</div>
          <div class="auth-text">
            <h3>로그인이 필요합니다</h3>
            <p>맞춤형 예금 상품 추천을 받으려면<br />먼저 로그인해주세요.</p>
          </div>
          <button @click="redirectToLogin" class="login-button">
            로그인하기
          </button>
        </div>
      </div>

      <!-- 로그인한 경우 기존 기능 -->
      <template v-else>
        <!-- 계좌 슬라이더 컴포넌트 -->
        <AccountSlider
          :accounts="accounts"
          :loading="accountsLoading"
          :error="error"
          :current-slide="currentSlide"
          :user-id="effectiveUserId"
          @refresh="refreshAccounts"
          @slide-change="handleSlideChange"
          @connect-success="handleConnectSuccess"
        />

        <!-- 검색 버튼 - 계좌가 있을 때만 표시 -->
        <div v-if="accounts.length > 0" class="search-section">
          <button
            class="search-btn"
            @click="searchProducts"
            :disabled="loading || accountsLoading || !currentAccount"
          >
            {{ loading ? '검색 중...' : '가입 가능한 상품 검색' }}
          </button>
        </div>

        <!-- 상품 리스트 컴포넌트 -->
        <ProductList
          :products="products"
          :loading="loading"
          :has-searched="hasSearched"
          :customer-name="
            currentAccount?.nickname || currentUser?.nickname || '고객'
          "
          :balance="currentAccount?.formattedBalance || ''"
          @product-select="selectProduct"
        />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import AccountSlider from './AccountSlider.vue';
import ProductList from './ProductList.vue';

// 🆕 기존 인증 스토어 사용
const authStore = useAuthStore();
const router = useRouter();

// 반응형 데이터
const products = ref([]);
const accounts = ref([]);
const loading = ref(false);
const accountsLoading = ref(true);
const currentSlide = ref(0);
const error = ref(null);
const hasSearched = ref(false);
const searchCache = ref({});

// Props (선택사항)
const props = defineProps({
  userId: {
    type: String,
    required: false,
  },
});

// 실제 사용할 userId (auth store 구조에 맞게 수정)
const effectiveUserId = computed(() => {
  return props.userId || authStore.userId || null;
});

// 로그인 상태 확인 (auth store 구조에 맞게 수정)
const isLoggedIn = computed(() => {
  return !!(authStore.accessToken && authStore.userId);
});

// 현재 사용자 정보 (auth store 구조에 맞게 수정)
const currentUser = computed(() => {
  if (!authStore.userId) return null;
  return {
    userId: authStore.userId,
    nickname: authStore.nickname,
  };
});

// Computed
const currentAccount = computed(() => {
  return accounts.value[currentSlide.value] || accounts.value[0];
});

// 로그인 페이지로 리다이렉트
const redirectToLogin = () => {
  router.push('/login');
};

// 계좌 정보 가져오기
const fetchAccounts = async () => {
  if (!effectiveUserId.value) {
    console.warn('사용자 ID가 없습니다.');
    accountsLoading.value = false;
    return;
  }

  accountsLoading.value = true;
  error.value = null;

  try {
    console.log(`사용자 ${effectiveUserId.value}의 계좌 정보 조회 중...`);

    const response = await axios.get(
      `/api/deposits/accounts/${effectiveUserId.value}`
    );
    accounts.value = response.data;

    console.log(`${response.data.length}개의 계좌를 찾았습니다.`);

    // 계좌 연결 후 첫 번째 계좌로 슬라이드 초기화
    if (response.data.length > 0) {
      currentSlide.value = 0;
    }
  } catch (err) {
    console.error('계좌 조회 실패:', err);

    // 실제 에러 발생 시 빈 배열로 설정 (연결 카드 표시)
    if (err.response?.status === 404) {
      console.log('연결된 계좌가 없습니다. 계좌 연결 카드를 표시합니다.');
      accounts.value = [];
    } else if (err.response?.status === 500) {
      console.error('서버 오류가 발생했습니다.');
      accounts.value = [];
      error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else {
      // 네트워크 오류 등의 경우 에러 메시지 표시
      accounts.value = [];
      error.value =
        '계좌 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
  } finally {
    accountsLoading.value = false;
  }
};

// 계좌 새로고침
const refreshAccounts = () => {
  // 검색 상태도 함께 초기화
  hasSearched.value = false;
  products.value = [];
  searchCache.value = {};

  fetchAccounts();
};

// 계좌 연결 성공 핸들러
const handleConnectSuccess = () => {
  console.log('계좌 연결 성공! 계좌 목록을 새로고침합니다.');
  refreshAccounts();
};

// 슬라이드 변경 핸들러
const handleSlideChange = (index) => {
  currentSlide.value = index;
  loadCachedResults();
};

// 캐시된 검색 결과 로드
const loadCachedResults = () => {
  const currentAccountData = currentAccount.value;
  if (!currentAccountData) return;

  const accountKey = currentAccountData.accountNo || currentSlide.value;
  const cachedData = searchCache.value[accountKey];

  if (cachedData) {
    hasSearched.value = true;
    products.value = cachedData.products;
    console.log(`캐시된 결과 로드: ${cachedData.products.length}개 상품`);
  } else {
    hasSearched.value = false;
    products.value = [];
  }
};

// 검색 결과 캐시 저장
const saveCachedResults = (accountData, searchResults) => {
  const accountKey = accountData.accountNo || currentSlide.value;
  searchCache.value[accountKey] = {
    products: [...searchResults],
    timestamp: Date.now(),
    accountInfo: {
      accountNo: accountData.accountNo,
      balance: accountData.formattedBalance,
    },
  };
  console.log(
    `검색 결과 캐시 저장: ${accountKey}, ${searchResults.length}개 상품`
  );
};

// 상품 검색
const searchProducts = async () => {
  if (!effectiveUserId.value) {
    console.error('사용자 ID가 없습니다.');
    return;
  }

  loading.value = true;

  try {
    const currentAccountData = currentAccount.value;

    if (!currentAccountData) {
      console.error('선택된 계좌가 없습니다.');
      return;
    }

    // 캐시 확인
    const accountKey = currentAccountData.accountNo || currentSlide.value;
    const cachedData = searchCache.value[accountKey];

    if (cachedData) {
      console.log('캐시된 결과 사용:', cachedData.products.length, '개 상품');
      hasSearched.value = true;
      products.value = cachedData.products;
      loading.value = false;
      return;
    }

    // 잔액 추출
    const balanceString = currentAccountData.formattedBalance || '0원';
    const balance = parseInt(balanceString.replace(/[^\d]/g, '')) || 0;

    console.log('검색 요청 데이터:', {
      userId: effectiveUserId.value,
      balance: balance,
      accountNumber: currentAccountData.accountNo,
    });

    // API 호출
    const response = await axios.post(
      '/api/deposits/recommendations/byBalance',
      {
        userId: effectiveUserId.value,
        balance: balance,
        accountNumber: currentAccountData.accountNo,
      }
    );

    hasSearched.value = true;
    products.value = response.data;

    // 캐시에 저장
    saveCachedResults(currentAccountData, response.data);

    console.log('추천 상품 조회 성공:', response.data);
  } catch (error) {
    console.error('상품 검색 오류:', error);
    hasSearched.value = true;
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 상품 선택 핸들러
const selectProduct = (product) => {
  console.log('선택된 상품:', product);
  // 상품 선택 로직 구현
};

// 로그인 상태 변경 감지 (auth store 구조에 맞게 수정)
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // 로그인됨
    console.log('로그인 감지됨. 계좌 정보를 조회합니다.');
    refreshAccounts();
  } else if (!newValue && oldValue) {
    // 로그아웃됨
    console.log('로그아웃 감지됨. 데이터를 초기화합니다.');
    accounts.value = [];
    products.value = [];
    hasSearched.value = false;
    searchCache.value = {};
    accountsLoading.value = false;
  }
});

// 사용자 ID 변경 감지
watch(
  effectiveUserId,
  (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      console.log(`사용자 ID 변경: ${oldUserId} -> ${newUserId}`);
      refreshAccounts();
    }
  },
  { immediate: false }
);

// 라이프사이클
onMounted(async () => {
  // 임시 로그인 테스트 - 개발 환경에서만 임시 로그인 자동 설정
  // if (import.meta.env.DEV) {
  //   console.log('🔧 개발 환경: 임시 로그인 강제 설정');

  //   // 개발 환경에서는 항상 특정 사용자로 강제 설정
  //   authStore.logout(); // 기존 상태 클리어

  //   // 새로운 임시 사용자로 설정
  //   authStore.setAuth({
  //     accessToken: 'dev-temp-token',
  //     userId: '5', // 이미 계좌가 있는 사용자로 다시 변경
  //     nickname: '개발테스트',
  //     email: 'dev@test.com',
  //   });

  //   // Vue의 반응성 업데이트 대기
  //   await nextTick();

  //   console.log('임시 로그인 후 상태:', {
  //     isLoggedIn: isLoggedIn.value,
  //     currentUser: currentUser.value,
  //     effectiveUserId: effectiveUserId.value,
  //   });
  // }

  // 최종 조건 체크 후 계좌 정보 조회
  console.log('최종 상태 체크:', {
    isLoggedIn: isLoggedIn.value,
    effectiveUserId: effectiveUserId.value,
  });

  if (isLoggedIn.value && effectiveUserId.value) {
    console.log('✅ 조건 만족: 계좌 정보 조회 시작');
    await fetchAccounts();
  } else {
    console.log('❌ 조건 불만족:', {
      isLoggedIn: isLoggedIn.value,
      effectiveUserId: effectiveUserId.value,
    });
    accountsLoading.value = false;
  }
});
</script>

<style scoped>
/* ===== 기본 설정 ===== */
.deposit-recommendations {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  color: black;
  line-height: 1.6;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding: 20px;
}

/* ===== 페이지 제목 ===== */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-title);
  text-align: center;
  margin-bottom: 10px;
}

/* ===== 🆕 인증 필요 메시지 ===== */
.auth-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.auth-message {
  background: var(--color-light);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.auth-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.auth-text h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-title);
  margin-bottom: 15px;
}

.auth-text p {
  font-size: 16px;
  color: var(--color-title);
  margin-bottom: 30px;
  line-height: 1.6;
}

.login-button {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(96, 153, 102, 0.3);
}

.login-button:hover {
  background: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(96, 153, 102, 0.4);
}

/* ===== 검색 섹션 ===== */
.search-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.search-btn {
  background: var(--color-accent);
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

.search-btn:hover:not(:disabled) {
  background: var(--color-dark);
  transform: translateY(-1px);
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 393px) {
  .main-content {
    padding: 15px;
  }

  .page-title {
    font-size: 20px;
  }

  .auth-message {
    padding: 30px 20px;
  }

  .auth-icon {
    font-size: 50px;
  }

  .auth-text h3 {
    font-size: 20px;
  }

  .auth-text p {
    font-size: 14px;
  }

  .login-button {
    padding: 10px 25px;
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .deposit-recommendations {
    max-width: 80%;
    margin: 0 auto;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.15);
  }
}
</style>
