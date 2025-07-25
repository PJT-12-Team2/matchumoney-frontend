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
  <br><br>
  <h3 class="filter-label">은행을 선택해주세요</h3>
  <div class="bank-grid">
    <div
      v-for="bank in bankOptions"
      :key="bank.name"
      :class="['bank-logo-option', { selected: filters.bank === bank.name }]"
      @click="filters.bank = (filters.bank === bank.name ? null : bank.name)"
    >
      <img :src="bank.logo" :alt="bank.name" class="bank-logo-img" />
      <div class="bank-label">{{ bank.name }}</div>
    </div>
  </div>
<br>
</section>
  
        <!-- 🔍 검색 결과 -->
        <section class="search-results">
          <h2 class="results-title">검색한 적금 상품</h2>
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <div>상품을 검색하고 있습니다...</div>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <div>검색 조건에 맞는 상품이 없습니다.</div>
            <div>다른 조건으로 검색해보세요.</div>
          </div>
          <div v-else-if="filteredProducts.length > 0" class="search-results-grid">
            <div
  v-for="product in filteredProducts"
  :key="product.id"
  class="product-card"
  @click="selectProduct(product)"
>
  <div class="card-content">
    <!-- 왼쪽: 은행 로고 + 이름 + 상품명 -->
    <div class="product-left">
      <img :src="getBankLogo(product.bankInitial)" alt="은행 로고" class="product-logo" />
      <div class="product-info">
        <div class="bank-name">{{ product.bank }}</div>
        <div class="product-name">{{ product.name }}</div>
      </div>
    </div>

    <!-- 오른쪽: 금리 정보 -->
<div class="product-right">
  <div class="rate-max">
    최고 <span class="highlight-max">{{ getRateWithTerm(product, 'max') }}</span>
  </div>
  <div class="rate-base">
    기본 <span class="highlight-base">{{ getRateWithTerm(product, 'base') }}</span>
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
import { ref, computed } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'

  const bankOptions = [
  { name: '국민은행', logo: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href },
  { name: '신한은행', logo: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url).href },
  { name: '우리은행', logo: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href },
  { name: '하나은행', logo: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href },
  { name: '카카오뱅크', logo: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href },
  { name: '토스뱅크', logo: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href },
  { name: '농협은행', logo: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href },
  { name: '기타', logo: new URL('@/assets/bankLogo_images/plus.png', import.meta.url).href },
  
]


  const loading = ref(false)
  const showSearchResults = ref(false)
  const selectedAmount = ref(10000)

const getRate = (product, type) => {
  const selectedTerm = filters.value.term

  if (!product.savingOptions || product.savingOptions.length === 0) return '-%'

  if (selectedTerm === '전체') {
    const allRates = product.savingOptions.map(opt =>
      type === 'base' ? opt.intrRate : opt.intrRate2
    )
    const max = Math.max(...allRates)
    return `${max.toFixed(2)}%`
  }

  const match = product.savingOptions.find(opt => opt.saveTrm === selectedTerm)
  if (!match) return '-%'
  return `${(type === 'base' ? match.intrRate : match.intrRate2).toFixed(2)}%`
}

const getRateWithTerm = (product, type) => {
  if (!product.savingOptions || product.savingOptions.length === 0) return '-%'

  const selectedTerm = filters.value.term

  if (selectedTerm === '전체') {
    const sorted = [...product.savingOptions].sort((a, b) => {
      const valA = type === 'base' ? a.intrRate : a.intrRate2
      const valB = type === 'base' ? b.intrRate : b.intrRate2
      return valB - valA
    })
    const best = sorted[0]
    return `${(type === 'base' ? best.intrRate : best.intrRate2).toFixed(2)}% (${best.saveTrm}개월)`
  }

  const match = product.savingOptions.find(opt => opt.saveTrm === selectedTerm)
  if (!match) return '-%'
  return `${(type === 'base' ? match.intrRate : match.intrRate2).toFixed(2)}% (${match.saveTrm}개월)`
}

  const filters = ref({
    term: '6',
    amount: null,
  })
  filters.value.bank = null

  const terms = [
  { label: '전체', value: '전체' },
  { label: '6개월', value: '6' },
  { label: '12개월', value: '12' },
  { label: '24개월', value: '24' },
  { label: '36개월', value: '36' }
]

  
  const carouselDeposits = ref([
    {
      id: 'd1',
      name: '우리 SUPER 주거래 적금',
      image: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
    },
    {
      id: 'd2',
      name: 'KB 특★한 적금',
      image: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
    },
    {
      id: 'd3',
      name: 'WON 적금',
      image: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url).href,
      benefit: `- 1개월 이내 : 기본이율 X 50%\n- 1개월 초과  ~ 3개월 이내 : 기본이율 X 30%\n- 3개월 초과 : 0.1%\n금리 : 연 1% ~ 연 4%`
    }
  ])
  
const allProducts = ref([])

onMounted(async () => {
  try {
    const res = await axios.post('/api/saving/search', {
      korCoNm: '',
      maxLimit: null
    })
    console.log('🎯 적금 API 응답:', res.data)
    allProducts.value = res.data.map(item => ({
  id: item.savingProductId,
  name: item.finPrdtNm,
  bank: item.korCoNm,
  bankInitial: getBankInitial(item.korCoNm),
  savingOptions: item.savingOptions,
  baseRate: item.intrRate?.toFixed(2) ?? '-',
  maxRate: item.intrRate2?.toFixed(2) ?? '-',
  image: item.image || ''
}))



  } catch (err) {
    console.error('❌ 적금 데이터 로딩 실패:', err)
  }
})

const getBankInitial = (name) => {
  if (name.includes('신한')) return 'shinhan'
  if (name.includes('하나')) return 'hana'
  if (name.includes('우리')) return 'woori'
  if (name.includes('국민')) return 'kb'
  if (name.includes('농협')) return 'nh'
  if (name.includes('카카오')) return 'kakao'
  if (name.includes('토스')) return 'toss'
  if (name.includes('부산')) return 'bnk'
  if (name.includes('광주')) return 'gwangju'
  if (name.includes('중소기업')) return 'ibk'
  if (name.includes('아이엠')) return 'im'
  if (name.includes('제주')) return 'jeju'
  if (name.includes('전북')) return 'jeonbook'
  if (name.includes('산업')) return 'sanup'
  if (name.includes('수협')) return 'su'
  if (name.includes('SC제일') || name.includes('스탠다드차타드')) return 'sc'
  if (name.includes('케이뱅크') || name.includes('K뱅크')) return 'k'
  return 'shinhan'
}
  
const getBankLogo = (initial) => {
  const logos = {
    shinhan: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url).href,
    hana: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
    woori: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
    kb: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
    nh: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
    kakao: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
    toss: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
    bnk: new URL('@/assets/bankLogo_images/bnk.png', import.meta.url).href,
    gwangju: new URL('@/assets/bankLogo_images/gwangju.png', import.meta.url).href,
    ibk: new URL('@/assets/bankLogo_images/ibk.png', import.meta.url).href,
    im: new URL('@/assets/bankLogo_images/im.png', import.meta.url).href,
    jeju: new URL('@/assets/bankLogo_images/jeju.png', import.meta.url).href,
    jeonbook: new URL('@/assets/bankLogo_images/jeonbook.png', import.meta.url).href,
    sanup: new URL('@/assets/bankLogo_images/sanup.png', import.meta.url).href,
    su: new URL('@/assets/bankLogo_images/su.png', import.meta.url).href,
    sc: new URL('@/assets/bankLogo_images/sc.png', import.meta.url).href,
    k: new URL('@/assets/bankLogo_images/k.png', import.meta.url).href
  }
  return logos[initial] || logos['shinhan']
}

const selectProduct = (product) => {
  alert(`${product.name}을 선택했습니다.`)
}

const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // 기간 필터
  if (filters.value.term !== '전체') {
    result = result.filter(p =>
      p.savingOptions?.some(opt => opt.saveTrm === filters.value.term)
    )
  }

  // 은행 필터
  if (filters.value.bank && filters.value.bank !== '기타') {
    result = result.filter(p => p.bank.includes(filters.value.bank))
  } else if (filters.value.bank === '기타') {
    result = result.filter(
      p =>
        !['국민은행', '신한은행', '우리은행', '하나은행', '카카오뱅크', '토스뱅크', '농협은행'].some(bank =>
          p.bank.includes(bank)
        )
    )
  }

  return result
})
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
  border-radius:20px;
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
.product-interest-rate {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.rate-max {
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
}

.rate-base {
  font-size: 16px;
  color: #666;
  margin-top: 2px;
}

.highlight-max {
  color: #2e7d32;
  font-weight: 700;
}

.highlight-base {
  color: #888;
  font-weight: 600;
}
.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: contain;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.product-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 90px;
}

.rate-max {
  font-size: 16px;
  font-weight: 600;
  color: #2e7d32;
}

.rate-base {
  font-size: 15px;
  color: #666;
  margin-top: 2px;
}

.highlight-max {
  color: #2e7d32;
  font-weight: 700;
}

.highlight-base {
  color: #888;
  font-weight: 600;
}


  </style>
