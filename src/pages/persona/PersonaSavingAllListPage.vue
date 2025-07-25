<template>
    <div class="deposit-search-page">
      <main class="main-content">
        <!-- 💡 페르소나 추천 -->
        <h1 class="page-title">페르소나 추천</h1>
        <section class="persona-carousel-section">
          <h2 class="persona-carousel-title">
            <span class="highlight">토끼형</span> 유형에게 추천되는 적금
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
        <h1 class="page-title">직접 찾아보는 적금
        </h1>
  
        <!-- ✅ 필터 영역 -->
<section class="filter-selection-section">
  <h3 class="filter-label">은행을 선택해주세요</h3>
  <div class="bank-grid">
    <div
      v-for="bank in bankOptions"
      :key="bank.name"
      :class="['bank-logo-option', { selected: filters.bank === bank.name }]"
      @click="filters.bank = bank.name"
    >
      <img :src="bank.logo" :alt="bank.name" class="bank-logo-img" />
      <div class="bank-label">{{ bank.name }}</div>
    </div>
  </div>

  <div class="amount-filter-container">
    <br><br><br>
    <h3 class="filter-label">매월 저축 금액 설정</h3>
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
    <button class="confirm-btn" @click="searchProducts">검색된 적금 보기</button>
  </div>
</section>
  
        <!-- 🔍 검색 결과 -->
        <section class="search-results" v-if="showSearchResults">
          <h2 class="results-title">검색한 적금 상품</h2>
  
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
    <img
      :src="getBankLogo(product.bankInitial)"
      alt="은행 로고"
      class="clickable-logo"
      @click="selectProduct(product)"
    />
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

  const bankOptions = [
  { name: '국민은행', logo: new URL('@/assets/kb.png', import.meta.url).href },
  { name: '신한은행', logo: new URL('@/assets/shinhan.png', import.meta.url).href },
  { name: '우리은행', logo: new URL('@/assets/woori.png', import.meta.url).href },
  { name: '하나은행', logo: new URL('@/assets/hana.png', import.meta.url).href },
  { name: '카카오뱅크', logo: new URL('@/assets/kakao.png', import.meta.url).href },
  { name: '토스뱅크', logo: new URL('@/assets/toss.png', import.meta.url).href },
  { name: '농협은행', logo: new URL('@/assets/nh.png', import.meta.url).href },
  { name: '기타', logo: new URL('@/assets/plus.png', import.meta.url).href },
]


  const loading = ref(false)
  const showSearchResults = ref(false)
  const selectedAmount = ref(10000)

  
  const filters = ref({
    term: '전체',
    amount: null,
  })
  filters.value.bank = null

  const terms = [
    { label: '전체', value: '전체' },
    { label: '6개월', value: '6개월' },
    { label: '12개월', value: '12개월' },
    { label: '24개월', value: '24개월' },
  ]
  
  const carouselDeposits = ref([
    {
      id: 'd1',
      name: '우리 SUPER 주거래 적금',
      image: new URL('@/assets/woori.jpg', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
    },
    {
      id: 'd2',
      name: 'KB 특★한 적금',
      image: new URL('@/assets/hana.jpg', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
    },
    {
      id: 'd3',
      name: 'WON 적금',
      image: new URL('@/assets/shinhan.jpeg', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
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
  if (filters.value.bank) {
  result = result.filter(p => p.bank === filters.value.bank)
}

  const selectProduct = (product) => {
    alert(`${product.name}을 선택했습니다.`)
  }
  
  const searchProducts = () => {
    loading.value = true
    showSearchResults.value = true
  
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
    background: #ffffff;
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
.bank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  justify-content: center; /* ✅ 가운데 정렬 */
  margin: 0 auto;           /* ✅ 중간정렬 보조 */
  place-items: center;
}

.bank-logo-option {
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px;
  background: white;
  transition: all 0.3s ease;
  text-align: center;
}

.bank-logo-option:hover {
  transform: translateY(-4px);
  border-color: #ccc;
}

.bank-logo-option.selected {
  border-color: #4caf50;
  background: #e6f4ea;
}



.bank-label {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}
.bank-button {
  border: 2px solid transparent;
  border-radius: 12px;
  background-color: transparent;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bank-button:hover {
  border-color: #4caf50;
  background-color: #e6f4ea;
}

.bank-logo-img {
  width: 110px;
  height: 110px;
  object-fit: contain;     /* 이미지 비율 유지하면서 여백 채우기 */
  background-color: white; /* 필요시 배경 추가 */
  border-radius: 50%;
  padding: 4px;             /* 이미지 안 잘리게 */
}
.clickable-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}
  </style>