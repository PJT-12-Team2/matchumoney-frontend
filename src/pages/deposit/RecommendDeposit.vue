<template>
  <div class="deposit-recommendations">
    <main class="main-content">
      <h2 class="page-title">예금 추천</h2>

      <!-- 계좌 슬라이더 컴포넌트 -->
      <AccountSlider
        :accounts="accounts"
        :loading="accountsLoading"
        :error="error"
        :current-slide="currentSlide"
        @refresh="refreshAccounts"
        @slide-change="handleSlideChange"
      />

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

      <!-- 상품 리스트 컴포넌트 -->
      <ProductList
        :products="products"
        :loading="loading"
        :has-searched="hasSearched"
        :customer-name="currentAccount?.nickname || '고객'"
        :balance="currentAccount?.formattedBalance || ''"
        @product-select="selectProduct"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AccountSlider from './AccountSlider.vue';
import ProductList from './ProductList.vue';

// 반응형 데이터
const products = ref([]);
const accounts = ref([]);
const loading = ref(false);
const accountsLoading = ref(true);
const currentSlide = ref(0);
const error = ref(null);
const hasSearched = ref(false);
const searchCache = ref({});

const userId = ref('3'); // 테스트 데이터

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

// Computed
const currentAccount = computed(() => {
  return accounts.value[currentSlide.value] || accounts.value[0];
});

// 계좌 정보 가져오기
const fetchAccounts = async () => {
  accountsLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`/api/deposits/accounts/${userId.value}`);
    accounts.value = response.data;
  } catch (err) {
    console.error(err);
    // 에러 발생 시 기본 계좌 정보 사용 (fallback)
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

// 계좌 새로고침
const refreshAccounts = () => {
  fetchAccounts();
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
      userId: userId.value,
      balance: balance,
      accountNumber: currentAccountData.accountNo,
    });

    // API 호출
    const response = await axios.post(
      '/api/deposits/recommendations/byBalance',
      {
        userId: userId.value,
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

// 라이프사이클
onMounted(async () => {
  await fetchAccounts();
});
</script>

<style scoped>
/* ===== 기본 설정 ===== */
.deposit-recommendations {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  color: #1a1a1a;
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
  color: #636363;
  text-align: center;
  margin-bottom: 10px;
}

/* ===== 검색 섹션 ===== */
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
  transition: all 0.3s ease;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn:hover:not(:disabled) {
  background: #507a55;
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
