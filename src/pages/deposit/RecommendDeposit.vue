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

        <!-- 상품 리스트 컴포넌트 -->
        <ProductList
          :products="products"
          :loading="loading || userInfoLoading"
          :has-searched="hasSearched"
          :customer-name="getCustomerName()"
          :balance="getBalance()"
          :is-kb-only="isKBOnlyMode"
          @product-select="selectProduct"
          @favorite-changed="handleFavoriteChanged"
        />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import depositApi from '@/api/deposit';
import favorite from '@/api/favorite';
import AccountSlider from './AccountSlider.vue';
import ProductList from './ProductList.vue';

// 로그인 페이지로 리다이렉트
const redirectToLogin = () => {
  router.push('/login');
};

// 기존 인증 스토어 사용
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
const userInfo = ref(null);
const userInfoLoading = ref(false);

// Props (선택사항)
const props = defineProps({
  userId: {
    type: String,
    required: false,
  },
});

// JWT 디코딩 함수
const parseJwt = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

// 토큰에서 userId 추출
const getUserIdFromToken = () => {
  try {
    const token =
      authStore.accessToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null);

    if (token) {
      const payload = parseJwt(token);
      return payload?.userId;
    }
  } catch (error) {
    // 에러 처리는 silent로
  }
  return null;
};

// effectiveUserId 계산
const effectiveUserId = computed(() => {
  const propUserId = props.userId;
  const storeUserId = authStore.userId;
  const tokenUserId = getUserIdFromToken();

  const isValidValue = (value) => {
    return (
      value !== null &&
      value !== undefined &&
      value !== 'undefined' &&
      value !== ''
    );
  };

  let result = null;
  if (isValidValue(propUserId)) {
    result = String(propUserId);
  } else if (isValidValue(storeUserId)) {
    result = String(storeUserId);
  } else if (isValidValue(tokenUserId)) {
    result = String(tokenUserId);
  }

  return result;
});

// 로그인 상태 확인
const isLoggedIn = computed(() => {
  return !!(authStore.accessToken && effectiveUserId.value);
});

// 현재 사용자 정보
const currentUser = computed(() => {
  if (!effectiveUserId.value) return null;
  return {
    userId: effectiveUserId.value,
    nickname: authStore.nickname,
  };
});

// 현재 계좌 정보
const currentAccount = computed(() => {
  return accounts.value[currentSlide.value] || accounts.value[0];
});

// KB국민은행 전용 모드인지 확인
const isKBOnlyMode = computed(() => {
  return accounts.value.length === 0;
});

// 🆕 즐겨찾기 상태 로드 함수 (수정됨)
const loadFavoriteStatus = async (productList) => {
  if (!effectiveUserId.value || !productList.length) {
    return productList.map((product) => ({
      ...product,
      isFavorite: false,
      isStarred: false,
    }));
  }

  try {
    // 서버에서 사용자의 전체 즐겨찾기 목록 가져오기
    const favoriteList = await favorite.getFavorites();
    console.log('🔍 서버에서 가져온 즐겨찾기 원본 데이터:', favoriteList);

    // FavoriteVO 구조에 맞게 즐겨찾기 ID 추출
    const favoriteDepositIds = new Set(
      favoriteList
        .filter(
          (fav) =>
            fav.depositProductId !== null && fav.depositProductId !== undefined
        )
        .map((fav) => Number(fav.depositProductId))
    );

    console.log('🔍 추출된 즐겨찾기 예금 상품 ID들:', favoriteDepositIds);

    return productList.map((product) => {
      // depositProductId를 사용해서 즐겨찾기 여부 확인
      const productId = Number(product.depositProductId);
      const isFavorite = favoriteDepositIds.has(productId);

      console.log(
        `🎯 상품 "${product.productName}" (ID: ${productId}) 즐겨찾기 상태:`,
        isFavorite
      );

      return {
        ...product,
        isFavorite,
        isStarred: isFavorite, // 둘 다 동일한 값으로 설정
      };
    });
  } catch (error) {
    console.log('즐겨찾기 상태 로드 실패:', error);
    return productList.map((product) => ({
      ...product,
      isFavorite: false,
      isStarred: false,
    }));
  }
};

// 🆕 즐겨찾기 변경 핸들러 (수정됨)
const handleFavoriteChanged = async (productId, isStarred) => {
  console.log('🎯 RecommendDeposit에서 즐겨찾기 변경 감지:', {
    productId,
    isStarred,
  });

  // 현재 products 배열에서 해당 상품의 isStarred 상태 업데이트
  const updatedProducts = products.value.map((product) => {
    if (Number(product.depositProductId) === Number(productId)) {
      return {
        ...product,
        isFavorite: isStarred,
        isStarred,
      };
    }
    return product;
  });

  products.value = updatedProducts;

  // 캐시도 업데이트
  Object.keys(searchCache.value).forEach((cacheKey) => {
    const cachedData = searchCache.value[cacheKey];
    if (cachedData && cachedData.products) {
      cachedData.products = cachedData.products.map((product) => {
        if (Number(product.depositProductId) === Number(productId)) {
          return {
            ...product,
            isFavorite: isStarred,
            isStarred,
          };
        }
        return product;
      });
    }
  });

  console.log('✅ RecommendDeposit 즐겨찾기 상태 업데이트 완료');
};

// 고객명 가져오기
const getCustomerName = () => {
  if (accounts.value.length > 0) {
    return (
      currentAccount.value?.nickname || currentUser.value?.nickname || '고객'
    );
  }
  return currentUser.value?.nickname || '고객';
};

// 잔액 가져오기
const getBalance = () => {
  if (accounts.value.length > 0) {
    return currentAccount.value?.formattedBalance || '';
  }
  return '';
};

// KB국민은행 상품 검색 (즐겨찾기 상태 없는 API 사용)
const searchKBProducts = async () => {
  loading.value = true;

  try {
    const kbProducts = await depositApi.getKBProducts();

    // 🆕 즐겨찾기 상태 추가
    const productsWithFavorites = await loadFavoriteStatus(kbProducts);

    hasSearched.value = true;
    products.value = productsWithFavorites;
  } catch (error) {
    hasSearched.value = true;
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 상품 검색
const searchProducts = async () => {
  if (!effectiveUserId.value) {
    return;
  }

  if (accounts.value.length === 0) {
    await searchKBProducts();
    return;
  }

  loading.value = true;

  try {
    const currentAccountData = currentAccount.value;
    if (!currentAccountData) return;

    // 캐시 확인
    const accountKey = currentAccountData.accountNo || currentSlide.value;
    const cachedData = searchCache.value[accountKey];

    if (cachedData) {
      // 🆕 캐시된 데이터도 최신 즐겨찾기 상태로 업데이트
      const updatedProducts = await loadFavoriteStatus(cachedData.products);
      hasSearched.value = true;
      products.value = updatedProducts;
      loading.value = false;
      return;
    }

    // 잔액 추출
    const balanceString = currentAccountData.formattedBalance || '0원';
    const balance = parseInt(balanceString.replace(/[^\d]/g, '')) || 0;

    const requestData = {
      userId: effectiveUserId.value,
      balance: balance,
      accountNumber: currentAccountData.accountNo,
    };

    const data = await depositApi.getProductsByBalance(requestData);

    // 🆕 즐겨찾기 상태 추가
    const productsWithFavorites = await loadFavoriteStatus(data);

    hasSearched.value = true;
    products.value = productsWithFavorites;

    // 캐시에 저장 (원본 데이터만)
    saveCachedResults(currentAccountData, data);
  } catch (error) {
    if (error.message && error.message.includes('500')) {
      try {
        // 🔄 getAllProducts -> getAllDepositProducts로 변경 (즐겨찾기 정보가 포함된 API)
        const allProducts = await depositApi.getAllProducts();
        hasSearched.value = true;
        products.value = allProducts; // 이미 즐겨찾기 정보가 포함되어 있음
      } catch (fallbackError) {
        hasSearched.value = true;
        products.value = [];
      }
    } else {
      hasSearched.value = true;
      products.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// 계좌 정보 가져오기
const fetchAccounts = async () => {
  if (!effectiveUserId.value) {
    accountsLoading.value = false;
    return;
  }

  accountsLoading.value = true;
  error.value = null;

  try {
    const data = await depositApi.getUserAccounts(effectiveUserId.value);
    accounts.value = data;

    if (data.length > 0) {
      currentSlide.value = 0;
      await searchProducts();
    } else {
      await searchKBProducts();
    }
  } catch (err) {
    if (err.message && err.message.includes('404')) {
      accounts.value = [];
      await searchKBProducts();
    } else if (err.message && err.message.includes('500')) {
      accounts.value = [];
      error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else {
      accounts.value = [];
      error.value =
        '계좌 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
  } finally {
    accountsLoading.value = false;
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
};

// 계좌 새로고침
const refreshAccounts = async () => {
  hasSearched.value = false;
  products.value = [];
  searchCache.value = {};
  await fetchAccounts();
};

// 계좌 연결 성공 핸들러
const handleConnectSuccess = () => {
  refreshAccounts();
};

// 슬라이드 변경 핸들러
const handleSlideChange = async (index) => {
  currentSlide.value = index;

  const currentAccountData = currentAccount.value;
  if (!currentAccountData) return;

  const accountKey = currentAccountData.accountNo || currentSlide.value;
  const cachedData = searchCache.value[accountKey];

  if (cachedData) {
    const updatedProducts = await loadFavoriteStatus(cachedData.products);
    hasSearched.value = true;
    products.value = updatedProducts;
  } else {
    await searchProducts();
  }
};

// 상품 선택 핸들러
const selectProduct = (product) => {
  // 상품 선택 로직
};

// 로그인 상태 변경 감지
watch(isLoggedIn, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    await refreshAccounts();
  } else if (!newValue && oldValue) {
    accounts.value = [];
    products.value = [];
    hasSearched.value = false;
    searchCache.value = {};
    userInfo.value = null;
    accountsLoading.value = false;
  }
});

// 사용자 ID 변경 감지
watch(
  effectiveUserId,
  async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      await refreshAccounts();
    }
  },
  { immediate: false }
);

// 라이프사이클
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (isLoggedIn.value && effectiveUserId.value) {
    await fetchAccounts();
  } else {
    accountsLoading.value = false;
  }
});
</script>

<style scoped>
/* 기존 스타일과 동일 */
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

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-title);
  text-align: center;
  margin-bottom: 10px;
}

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
