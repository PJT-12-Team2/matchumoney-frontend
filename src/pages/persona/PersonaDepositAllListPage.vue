<template>
  <div class="deposit-search-page">
    <main class="main-content">

      <!-- 🔷 페르소나 추천 캐러셀 -->
      <h1 class="page-title">페르소나 추천</h1>
      <section class="persona-carousel-section">
        <h2 class="persona-carousel-title">
          <span class="highlight">{{ userPersonaType }}</span> 유형에게 추천되는 예금
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
            <div>{{ deposit.bankName }}</div>
            <div class="carousel-deposit-rates-inline">
              <span>최고 금리: <strong style="color:#2e7d32">{{ deposit.maxRate }}</strong></span>
              <br />
              <span>기본 금리: {{ deposit.baseRate }}</span>
            </div>
          </div>
        </div>
      </section>

      <br /><hr /><br />

      <!-- 🔷 직접 검색 필터 영역 -->
      <h1 class="page-title">직접 찾아보는 예금</h1>
      <section class="filter-selection-section">
        <div class="term-selector">
          <div
            v-for="(term, idx) in terms"
            :key="term.value"
            :class="['term-button', { active: filters?.term === term.value }]"
            @click="filters.term = term.value"
          >
            {{ term.label }}
          </div>
        </div>
        
        <br><br>
        <h3 class="filter-label">은행을 선택해주세요</h3>
        <div class="bank-grid">
          <div
            v-for="bank in bankOptions"
            :key="bank.name"
            :class="['bank-logo-option', { selected: filters?.bank === bank.name }]"
            @click="filters.bank = (filters?.bank === bank.name ? null : bank.name)"
          >
            <img :src="bank.logo" :alt="bank.name" class="bank-logo-img" />
            <div class="bank-label">{{ bank.name }}</div>
          </div>
        </div>
        <br>
      </section>

      <!-- 🔷 직접 검색 결과 리스트 -->
      <section class="search-results">
        <h2 class="results-title">검색한 예금 상품</h2>
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
            <div class="product-card-horizontal">
              <div class="bank-logo-container">
                <img :src="getBankLogo(product.bankInitial)" alt="은행 로고" class="bank-logo-round" />
              </div>
              <div class="product-name-block">
                <div class="bank-name-bold">{{ product.bank }}</div>
                <div class="product-name-bold">{{ product.name }}</div>
              </div>
              <div class="product-info-block">
                <div class="rate-line"><span class="label-bold">최고 금리 :</span> <span class="highlight-rate">{{ getRateWithTerm(product, 'max') }}</span></div>
                <div class="rate-line">최저 금리 : {{ getRateWithTerm(product, 'base') }}</div>
                <div class="rate-line">
                  최소 가입 금액 :
                  {{
                    getMinAmountWithTerm(product) || '100만원'
                  }}
                </div>
                <div class="rate-line">
                  기준 기간 :
                  {{
                    filters.term !== '전체'
                      ? filters.term + '개월'
                      : (() => {
                          const best = product.depositOptions?.reduce((prev, curr) => {
                            const prevRate = prev?.intrRate2 ?? 0;
                            const currRate = curr?.intrRate2 ?? 0;
                            return currRate > prevRate ? curr : prev;
                          }, null);
                          return best?.saveTrm ? best.saveTrm + '개월' : '정보 없음';
                        })()
                  }}
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
import api from '@/api'
import { onMounted } from 'vue'
import { watch } from 'vue'

// 📦 은행 로고 설정
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

// 📦 필터 관련 상태 및 초기값
const loading = ref(false)
const showSearchResults = ref(false)
const selectedAmount = ref(10000)
const filters = ref({
  term: '12',
  amount: null,
})
filters.value.bank = null

// selectedAmount를 filters에 동기화
watch(selectedAmount, (val) => {
  filters.value.amount = val
})

const terms = [
  { label: '전체', value: '전체' },
  { label: '1개월', value: '1' },
  { label: '3개월', value: '3' },
  { label: '6개월', value: '6' },
  { label: '12개월', value: '12' },
  { label: '24개월', value: '24' },
  { label: '36개월', value: '36' }
]

const userPersonaType = ref('') // default 빈값

// 📦 페르소나 추천 예금 목록
const personaRecommendedDeposits = ref([])

// 📦 데이터 정제 함수
const getRate = (product, type) => {
  const selectedTerm = filters.value?.term
  if (!product.depositOptions || product.depositOptions.length === 0) return '-%'
  if (selectedTerm === '전체') {
    const allRates = product.depositOptions.map(opt =>
      type === 'base' ? opt.intrRate : opt.intrRate2
    )
    const max = Math.max(...allRates)
    return `${max.toFixed(2)}%`
  }
  const match = product.depositOptions.find(opt => opt.saveTrm === selectedTerm)
  if (!match) return '-%'
  return `${(type === 'base' ? match.intrRate : match.intrRate2).toFixed(2)}%`
}

const getRateWithTerm = (product, type) => {
  if (!product.depositOptions || product.depositOptions.length === 0) return '-%'
  const selectedTerm = filters.value?.term
  if (selectedTerm === '전체') {
    const sorted = [...product.depositOptions].sort((a, b) => {
      const valA = type === 'base' ? a.intrRate : a.intrRate2
      const valB = type === 'base' ? b.intrRate : b.intrRate2
      return valB - valA
    })
    const best = sorted[0]
    if (!best) return '-%'
    const val = type === 'base' ? best.intrRate : best.intrRate2
    return typeof val === 'number' ? `${val.toFixed(2)}%` : '-%'
  }
  const match = product.depositOptions.find(opt => opt.saveTrm === selectedTerm)
  if (!match) return '-%'
  const value = type === 'base' ? match.intrRate : match.intrRate2
  return typeof value === 'number' ? `${value.toFixed(2)}%` : '-%'
}

const get12MonthRate = (product, type) => {
  if (!product.depositOptions || product.depositOptions.length === 0) return '-%'
  const match = product.depositOptions.find(opt => opt.saveTrm === '12')
  if (!match) return '-%'
  const val = type === 'base' ? match.intrRate : match.intrRate2
  return typeof val === 'number' ? `${val.toFixed(2)}%` : '-%'
}

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

const formatCurrency = (val) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(val)
}

const getMinAmountWithTerm = (product) => {
  if (!product.depositOptions || product.depositOptions.length === 0) return null;
  const selectedTerm = filters.value?.term;
  if (!selectedTerm || selectedTerm === '전체') return null;
  const matchedOption = product.depositOptions.find(opt => String(opt.saveTrm) === selectedTerm);
  return matchedOption?.minAmount || null;
};

// 📦 API 통신 (onMounted)
const allProducts = ref([])
const carouselDeposits = computed(() => {
  return personaRecommendedDeposits.value.map(d => ({
    id: d.depositId,
    name: d.productName,
    bankName : d.bankName,
    image: d.companyImage,
    maxRate: `${d.maxRate.toFixed(2)}%`,
    baseRate: `${d.basicRate.toFixed(2)}%`
  }))
})

onMounted(async () => {
  let personaCode = null;
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    // 1. 사용자 personaId 가져오기
    const personaIdRes = await api.get('/deposits/recommendations/user/persona-id', config);
    personaCode = personaIdRes.data.personaId;

    // 2. 사용자 페르소나 예금 추천 가져오기
    const recommendationRes = await api.get('/deposits/recommendations/user/recommendation', config);
    const result = recommendationRes.data.result;

    userPersonaType.value = result.personaName || '토끼형';
    personaRecommendedDeposits.value = (result.deposits || []).map((item) => ({
      depositId: item.depositId,
      productName: item.productName,
      bankName : item.bankName,
      companyImage: item.companyImage || getBankLogo(getBankInitial(item.bankName || '')),
      maxRate: item.maxRate ?? 0,
      basicRate: item.basicRate ?? 0
    }));
  } catch (err) {
    console.error('❌ 사용자 기반 페르소나 예금 불러오기 실패:', err);
    userPersonaType.value = '토끼형';
    personaRecommendedDeposits.value = [];
  }

  try {
    // 전체 적금 리스트
    const allRes = await api.post('/deposit/search', {
      korCoNm: '',
      maxLimit: null
    });
    const fullList = allRes.data.map(item => ({
      id: item.depositProductId,
      name: item.finPrdtNm,
      bank: item.korCoNm,
      bankInitial: getBankInitial(item.korCoNm),
      depositOptions: item.depositOptions,
      baseRate: item.intrRate?.toFixed(2) ?? '-',
      maxRate: item.intrRate2?.toFixed(2) ?? '-',
      image: item.image || '',
      personaType: item.personaType || ''
    }));
    allProducts.value = fullList;
  } catch (err) {
    console.error('❌ 전체 상품 불러오기 실패:', err);
  }
});

// 📦 정렬 및 필터링 로직
const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // 기간 필터: "전체"가 아닌 다른 값이 선택된 경우에만 필터링
  if (filters.value?.term && filters.value?.term !== '전체') {
    result = result.filter(p =>
      p.depositOptions?.some(opt => String(opt.saveTrm) === filters.value?.term)
    )
  }

  // 예치금액 필터 추가
  if (selectedAmount.value) {
    result = result.filter(p =>
      p.depositOptions?.some(opt => {
        const amountNum = parseInt(opt.minAmount?.replace(/[^\d]/g, '')) || 0
        return selectedAmount.value >= amountNum
      })
    )
  }

  // 은행 필터
  if (filters.value?.bank && filters.value?.bank !== '기타') {
    result = result.filter(p => p.bank.includes(filters.value?.bank))
  } else if (filters.value?.bank === '기타') {
    result = result.filter(
      p =>
        !['국민은행', '신한은행', '우리은행', '하나은행', '카카오뱅크', '토스뱅크', '농협은행'].some(bank =>
          p.bank.includes(bank)
        )
    )
  }

  // 🔽 선택된 기간의 최대 금리 기준 내림차순 정렬
  result.sort((a, b) => {
    const aMax = Math.max(...(a.depositOptions?.map(opt => opt.intrRate2) || [0]))
    const bMax = Math.max(...(b.depositOptions?.map(opt => opt.intrRate2) || [0]))
    return bMax - aMax
  })

  return result
})

const selectProduct = (product) => {
  alert(`${product.name}을 선택했습니다.`)
}
</script>


<style scoped>

/* 🔷 Layout 및 전체 구조 */
.deposit-search-page {
  font-family: 'Noto Sans', sans-serif;
  background: var(--color-white);
  min-height: 100vh;
}
.main-content {
  max-width: 75rem;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}
.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

/* 🔷 페르소나 추천 캐러셀 스타일 */
.persona-carousel-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}
.carousel-deposit-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}
.carousel-deposit {
  width: 300px; /* 고정 크기 */
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}
.carousel-deposit-image {
  width: 50%;
  border-radius: var(--spacing-sm);
  padding-bottom: 2rem;
}
.carousel-deposit-name {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
}
.persona-carousel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.highlight {
  font-size: var(--font-size-3xl);
  text-decoration: underline;
}

/* 🔷 필터 영역 스타일 */
.filter-selection-section {
  padding: var(--spacing-xl);
  border: 2px solid var(--border-light);
  border-radius: var(--spacing-xl);
  background: var(--bg-card);
  margin-bottom: var(--spacing-2xl);
}
.term-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}
.term-button {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md);
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: var(--text-secondary);
}
.term-button.active {
  color: var(--color-success);
  border-color: var(--color-success);
  font-weight: bold;
}
.amount-filter-container {
  margin: var(--spacing-2xl) 0;
}
.slider-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}
.amount-slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--color-gray-300);
  outline: none;
}
.amount-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-success);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -7px;
}
.amount-slider::-moz-range-thumb {
  background: var(--color-success);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
}
.slider-value {
  min-width: 120px;
  font-weight: bold;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}
.filter-label {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  text-align: left;
}
.bank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  justify-content: center;
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
  border-radius: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--color-white);
  transition: all 0.3s ease;
  text-align: center;
}
.bank-logo-option:hover {
  transform: translateY(-4px);
  border-color: var(--border-medium);
}
.bank-logo-option.selected {
  border-color: var(--color-success);
  background: var(--color-success-light);
}
.bank-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
}
.bank-logo-img {
  width: 110px;
  height: 110px;
  object-fit: contain;
  background-color: var(--color-white);
  border-radius: 50%;
  padding: 4px;
}

/* 🔷 검색 결과 카드 스타일 */
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
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
.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}
/* Left: logo */
.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
}
.bank-logo-round {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: contain;
  background: var(--color-white);
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.04);
  border: 0.1rem solid var(--color-gray-200);
}
/* Center: name block */
.product-name-block {
  flex: 1;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Right: info block */
.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}
.bank-name-bold {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: #1e2b4e; /* strong navy blue */
  margin-bottom: 0.1rem;
}
.product-name-bold {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}
.rate-line {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 0.1rem;
}
.label-bold {
  font-weight: bold;
  color: var(--color-dark);
}
.highlight-rate {
  font-size: 18px;
  color: #609966;
  font-weight: bold;
}

/* 🔷 반응형 (모바일) 스타일 */
@media (max-width: 768px) {
  .carousel-deposit-list {
    grid-template-columns: 1fr;
  }
  .search-results-grid {
    grid-template-columns: 1fr;
  }
  .bank-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .carousel-deposit-name,
  .carousel-deposit-benefit {
    font-size: var(--font-size-sm);
  }
  .product-card-horizontal {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  .bank-logo-container {
    width: 4rem;
    height: 4rem;
  }
  .bank-logo-round {
    width: 4rem;
    height: 4rem;
  }
  .product-info-block {
    align-items: flex-start;
    width: 100%;
  }
}

/* 🔷 페르소나 추천 캐러셀 금리 인라인 스타일 */
.carousel-deposit-rates-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

/* 🔷 Empty state 스타일 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px #ccc;
  border-radius: 1rem;
  color: var(--text-secondary);
  font-size: 1rem;
  margin-top: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>

