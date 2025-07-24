<template>
    <div class="deposit-search-page">
      <main class="main-content">
        <!-- 💡 페르소나 추천 -->
        <h1 class="page-title">페르소나 추천</h1>
        <section class="persona-carousel-section">
          <h2 class="persona-carousel-title">
            <span class="highlight">토끼형</span> 유형에게 추천되는 예금
          </h2>
          <div class="carousel-deposit-list">
            <div
              v-for="deposit in carouselDeposits"
              :key="deposit.id"
              class="carousel-deposit"
              @click="selectProduct(deposit)"
            >
              <img :src="deposit.image" :alt="deposit.name" class="carousel-deposit-image" />
              <div class="carousel-deposit-name">{{ deposit.name }}</div>
              <div class="carousel-deposit-benefit" v-html="deposit.benefit.replace(/\n/g, '<br>')"></div>
            </div>
          </div>
        </section>
  
        <br /><hr /><br />
  
        <!-- 🔍 직접 찾아보기 -->
        <h1 class="page-title">직접 찾아보는 예금</h1>
  
        <!-- ✅ 필터 영역 -->
        <section class="filter-selection-section">
          <div class="term-selector">
            <div
              v-for="(term, idx) in terms"
              :key="term.value"
              :class="['term-button', { active: filters.term === term.value }]"
              @click="filters.term = term.value"
            >
              {{ term.label }}
            </div>
          </div>
          <div class="amount-filter-container">
            <h3 class="filter-label">예치 금액 설정</h3>
            <div class="slider-box">
              <input
                type="range"
                v-model="selectedAmount"
                :min="10000"
                :max="1000000"
                :step="1000"
                class="amount-slider"
              />
              <div class="slider-value">{{ formatCurrency(selectedAmount) }}</div>
            </div>
          </div>
          <div class="text-center" style="margin-top: 20px">
            <button class="confirm-btn" @click="searchProducts">검색된 카드 보기</button>
          </div>
        </section>
  
        <!-- 🔍 검색 결과 -->
        <section class="search-results" v-if="showSearchResults">
          <h2 class="results-title">검색한 예금 상품</h2>
  
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <div>상품을 검색하고 있습니다...</div>
          </div>
  
          <div v-else-if="searchResults.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <div>검색 조건에 맞는 상품이 없습니다.</div>
            <div>다른 조건으로 검색해보세요.</div>
          </div>
  
          <div v-else class="search-results-grid">
            <div
              v-for="product in searchResults"
              :key="product.id"
              class="product-card"
              @click="selectProduct(product)"
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
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  
  const loading = ref(false)
  const showSearchResults = ref(false)
  const selectedAmount = ref(10000)

  
  const filters = ref({
    term: '전체',
    amount: null,
  })
  
  const terms = [
    { label: '전체', value: '전체' },
    { label: '6개월', value: '6개월' },
    { label: '12개월', value: '12개월' },
    { label: '24개월', value: '24개월' },
  ]
  
  const carouselDeposits = ref([
    {
      id: 'd1',
      name: 'KB Star 정기예금',
      image: new URL('@/assets/shinhan.jpeg', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과 ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n가입금액 : 1백만원 이상`
    },
    {
      id: 'd2',
      name: '쏠편한 정기예금',
      image: new URL('@/assets/hana.jpg', import.meta.url).href,
      benefit: `- 1개월 이하: (일반) 정기예금 기본금리 1/2\n- 1개월 초과~6개월 이하: 기본금리의 1/4\n- 6개월 초과: 0.10%\n가입금액 : 1만원 이상`
    },
    {
      id: 'd3',
      name: 'WON플러스예금',
      image: new URL('@/assets/woori.jpg', import.meta.url).href,
      benefit: `- 1개월이내 : 만기시점약정이율×50%\n- 6개월이내: 만기시점약정이율×30%\n- 6개월초과 : ×20%\n가입금액 : 1만원 이상`
    }
  ])
  
  const allProducts = ref([
    {
      id: 1,
      name: '신한 예금 A',
      bank: '신한은행',
      bankInitial: 'shinhan',
      details: '기본이율 1.5%, 6개월 이상 가능',
      term: '6개월',
      minAmount: 100000
    },
    {
      id: 2,
      name: '하나 예금 B',
      bank: '하나은행',
      bankInitial: 'hana',
      details: '기본이율 2.0%, 12개월 고정',
      term: '12개월',
      minAmount: 500000
    }
  ])
  
  const searchResults = ref([])
  
  const getBankLogo = (initial) => {
    const logos = {
      shinhan: new URL('@/assets/woori.jpg', import.meta.url).href,
      hana: new URL('@/assets/hana.jpg', import.meta.url).href,
    }
    return logos[initial] || logos['shinhan']
  }
  
  const selectProduct = (product) => {
    alert(`${product.name}을 선택했습니다.`)
  }
  
  const searchProducts = async () => {
    loading.value = true
    showSearchResults.value = true
    try {
    const res = await axios.get('/api/deposits', {
      params: {
        term: filters.value.term,
        amount: selectedAmount.value
      }
    })
    searchResults.value = res.data
  } catch (err) {
    console.error("백엔드 API 에러:", err)
    searchResults.value = []
  } finally {
    loading.value = false
  }
    setTimeout(() => {
      let result = allProducts.value
  
      if (filters.value.term !== '전체') {
        result = result.filter(p => p.term === filters.value.term)
      }
  
      if (filters.value.amount) {
        result = result.filter(p => filters.value.amount >= p.minAmount)
      }
  
      searchResults.value = result
      loading.value = false
    }, 500)
  }
  const formatCurrency = (val) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(val)
}
  </script>
  
  <style scoped>
  .deposit-search-page {
    font-family: 'Noto Sans', sans-serif;
    background: #fff;
    min-height: 100vh;
  }
  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
  }
  .page-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
  }
  .persona-carousel-title {
    font-size: 22px;
    margin-bottom: 20px;
    text-align: center;
  }
  .carousel-deposit-list {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: nowrap;
  overflow-x: auto;   /* ✅ 넘치면 스크롤 */
    margin-bottom: 40px;
  }
  .carousel-deposit {
    width: 300px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 16px;
    cursor: pointer;
  }
  .carousel-deposit-image {
    width: 100%;
    border-radius: 8px;
  }
  .carousel-deposit-name {
    font-size: 20px;
    font-weight: bold;
    margin: 10px 0 4px;
  }
  .carousel-deposit-benefit {
    font-size: 16px;
    color: #666;
  }
  .highlight {
    font-size: 26px;
    text-decoration: underline;
  }
  .filter-selection-section {
    padding: 20px;
    border: 2px solid #ccc;
    border-radius: 12px;
    background: #fafafa;
    margin-bottom: 40px;
  }
  .term-selector {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .term-button {
    flex: 1;
    text-align: center;
    padding: 10px;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    color: gray;
  }
  .term-button.active {
    color: #4caf50;
    border-color: #4caf50;
    font-weight: bold;
  }
  .amount-input-box {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  .amount-input {
    flex: 1;
    padding: 12px;
    font-size: 16px;
    border: none;
    border-bottom: 2px solid #ccc;
  }
  .clear-btn {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  .confirm-btn {
    padding: 10px 20px;
    background: #ccc;
    border: none;
    border-radius: 5px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
  }
  .confirm-btn:enabled {
    background: #4caf50;
  }
  .info-text {
    position: absolute;
    top: 100%;
    left: 0;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
  .search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }
  .product-card {
    background: #f5f7f9;
    border-radius: 20px;
    padding: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-5px);
  }
  .product-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .bank-logo img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 10px;
  }
  .product-info h4 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }
  .bank-name {
    font-size: 14px;
    color: #888;
  }
  .product-details {
    margin-top: 6px;
    font-size: 14px;
    color: #444;
  }

  .amount-filter-container {
  margin: 40px 0;
}

.slider-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.amount-slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
}

.amount-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #609966;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.amount-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #609966;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 120px;
  font-weight: bold;
  font-size: 18px;
  color: #333;
}
.filter-label{
    font-size: 18px;
  font-weight: 700;
  color: #40513b;
  margin-bottom: 12px;
  text-align: left;
}
  </style>