<template>
  <div class="card-product-search">
    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 페이지 제목 -->
      <h1 class="page-title">카드 상품 검색</h1>

      <!-- 검색 필터 섹션 -->
      <section class="search-filter-section">
        <div class="filter-container">
          <!-- 카드 종류 선택 -->
          <div class="card-type-section">
            <div class="card-type-option">
              <input type="checkbox" id="credit-card" v-model="filters.creditCard">
              <label for="credit-card">신용카드</label>
            </div>
            <div class="card-type-option">
              <input type="checkbox" id="debit-card" v-model="filters.debitCard">
              <label for="debit-card">체크카드</label>
            </div>
          </div>

          <!-- 혜택 카테고리 -->
          <div class="benefits-section">
            <h3 class="benefits-title">혜택</h3>
            <div class="benefits-grid">
              <div 
                v-for="benefit in benefitCategories" 
                :key="benefit.id"
                class="benefit-option"
              >
                <input 
                  type="checkbox" 
                  :id="benefit.id" 
                  v-model="filters.selectedBenefits"
                  :value="benefit.id"
                >
                <label :for="benefit.id">{{ benefit.name }}</label>
              </div>
            </div>
          </div>

          <!-- 검색 버튼 -->
          <div class="search-button-section">
            <button class="search-button" @click="searchProducts" :disabled="loading">
              {{ loading ? '검색 중...' : '검 색' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 페르소나 기반 추천 섹션 -->
      <section class="persona-recommendations">
        <h2 class="recommendation-title">{{ userName }} 님 유형의 사용자가 많이 선택했어요!</h2>
        
        <div class="recommended-products">
          <div 
            v-for="product in recommendedProducts" 
            :key="product.id"
            class="product-card recommended"
            @click="selectProduct(product)"
          >
            <div class="card-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="card-info">
              <div class="card-company">{{ product.company }}</div>
              <h3 class="card-name">{{ product.name }}</h3>
              <div class="card-benefits">
                <div v-for="benefit in product.benefits" :key="benefit" class="benefit-item">
                  {{ benefit }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 검색 결과 섹션 -->
      <section class="search-results" v-if="showSearchResults">
        <h2 class="results-title">검색한 카드 상품</h2>
        
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
            <div class="card-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="card-info">
              <div class="card-company">{{ product.company }}</div>
              <h3 class="card-name">{{ product.name }}</h3>
              <div class="card-benefits">
                <div v-for="benefit in product.benefits" :key="benefit" class="benefit-item">
                  {{ benefit }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  name: 'CardProductSearch',
  setup() {
    const loading = ref(false)
    const showSearchResults = ref(false)
    const userName = ref('혜진')

    // 필터 상태
    const filters = reactive({
      creditCard: false,
      debitCard: false,
      selectedBenefits: []
    })

    // 혜택 카테고리
    const benefitCategories = ref([
      { id: 'transport', name: '교통' },
      { id: 'mart', name: '마트/편의점' },
      { id: 'gas', name: '주유' },
      { id: 'telecom', name: '통신' },
      { id: 'shopping', name: '쇼핑' },
      { id: 'cafe', name: '카페/디저트' },
      { id: 'beauty', name: '뷰티' },
      { id: 'hospital', name: '병원' },
      { id: 'education', name: '교육' },
      { id: 'leisure', name: '레저/스포츠' },
      { id: 'culture', name: '문화' },
      { id: 'overseas', name: '해외' },
      { id: 'airline', name: '항공' },
      { id: 'travel', name: '여행/숙박' },
      { id: 'no-performance', name: '무실적' }
    ])

    // 추천 상품 (페르소나 기반)
    const recommendedProducts = ref([
      {
        id: 'rec1',
        name: 'KB국민 My WE:SH 카드',
        company: 'KB 국민카드',
        image: '/api/placeholder/300/200',
        benefits: [
          '음식점 및 편의점 10%',
          '이동통신요금 10%',
          'OTT 30%',
          '카페 5%'
        ]
      },
      {
        id: 'rec2',
        name: 'KB국민 My WE:SH 카드',
        company: 'KB 국민카드',
        image: '/api/placeholder/300/200',
        benefits: [
          '음식점 및 편의점 10%',
          '이동통신요금 10%',
          'OTT 30%',
          '카페 5%'
        ]
      }
    ])

    // 검색 결과
    const searchResults = ref([])

    // 전체 상품 데이터 (검색용)
    const allProducts = ref([
      {
        id: 1,
        name: 'KB국민 My WE:SH 카드',
        company: 'KB 국민카드',
        image: '/api/placeholder/300/200',
        benefits: ['음식점 및 편의점 10%', '이동통신요금 10%', 'OTT 30%', '카페 5%'],
        categories: ['mart', 'telecom', 'cafe'],
        cardType: 'credit'
      },
      {
        id: 2,
        name: '신한카드 Deep Dream',
        company: '신한카드',
        image: '/api/placeholder/300/200',
        benefits: ['주유 10%', '마트 5%', '교통 10%'],
        categories: ['gas', 'mart', 'transport'],
        cardType: 'credit'
      },
      {
        id: 3,
        name: '하나카드 원큐페이',
        company: '하나카드',
        image: '/api/placeholder/300/200',
        benefits: ['쇼핑 15%', '카페 10%', '뷰티 5%'],
        categories: ['shopping', 'cafe', 'beauty'],
        cardType: 'debit'
      },
      {
        id: 4,
        name: '우리카드 THE GREAT',
        company: '우리카드',
        image: '/api/placeholder/300/200',
        benefits: ['항공 20%', '여행 15%', '해외 10%'],
        categories: ['airline', 'travel', 'overseas'],
        cardType: 'credit'
      },
      {
        id: 5,
        name: 'NH농협카드 올바른',
        company: 'NH농협카드',
        image: '/api/placeholder/300/200',
        benefits: ['무실적 2%', '교육 10%', '병원 5%'],
        categories: ['no-performance', 'education', 'hospital'],
        cardType: 'debit'
      },
      {
        id: 6,
        name: '롯데카드 PINK',
        company: '롯데카드',
        image: '/api/placeholder/300/200',
        benefits: ['뷰티 20%', '쇼핑 15%', '문화 10%'],
        categories: ['beauty', 'shopping', 'culture'],
        cardType: 'credit'
      }
    ])

    // 검색 실행
    const searchProducts = async () => {
      loading.value = true
      showSearchResults.value = true

      // 시뮬레이션: 검색 지연
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 필터링 로직
      let filtered = allProducts.value

      // 카드 종류 필터
      if (filters.creditCard || filters.debitCard) {
        filtered = filtered.filter(product => {
          if (filters.creditCard && filters.debitCard) return true
          if (filters.creditCard) return product.cardType === 'credit'
          if (filters.debitCard) return product.cardType === 'debit'
          return false
        })
      }

      // 혜택 카테고리 필터
      if (filters.selectedBenefits.length > 0) {
        filtered = filtered.filter(product => 
          filters.selectedBenefits.some(benefit => 
            product.categories.includes(benefit)
          )
        )
      }

      searchResults.value = filtered
      loading.value = false
    }

    // 상품 선택
    const selectProduct = (product) => {
      console.log('선택된 상품:', product)
      // 실제로는 상품 상세 페이지로 이동 또는 모달 표시
      alert(`${product.name}을 선택했습니다.`)
    }

    // 초기화
    onMounted(() => {
      // 초기 추천 상품 로드 등
    })

    return {
      loading,
      showSearchResults,
      userName,
      filters,
      benefitCategories,
      recommendedProducts,
      searchResults,
      searchProducts,
      selectProduct
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.card-product-search {
  font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  min-height: 100vh;
}

/* PC 헤더 */
.pc-header {
  background: #40513b;
  color: white;
  height: 72px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: #609966;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-family: 'Noto Sans KR';
  font-weight: 700;
  font-size: 24px;
  color: #ffffff;
}

.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 60px;
}

.nav-item {
  font-family: 'DM Sans';
  font-weight: 400;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
}

.user-profile {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #40513b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* 메인 컨텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.page-title {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 35px;
  color: #000000;
  margin-bottom: 40px;
  text-align: center;
}

/* 검색 필터 섹션 */
.search-filter-section {
  margin-bottom: 60px;
}

.filter-container {
  background: #edf1d6;
  border-radius: 20px;
  padding: 40px;
  position: relative;
}

.card-type-section {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
}

.card-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-type-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid #609966;
  border-radius: 2px;
}

.card-type-option label {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 18px;
  color: #40513b;
  cursor: pointer;
}

.benefits-section {
  margin-bottom: 30px;
}

.benefits-title {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 18px;
  color: #636363;
  margin-bottom: 20px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  max-width: 800px;
}

.benefit-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benefit-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid #609966;
  border-radius: 2px;
}

.benefit-option label {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 15px;
  color: #40513b;
  cursor: pointer;
  white-space: nowrap;
}

.search-button-section {
  display: flex;
  justify-content: flex-end;
}

.search-button {
  background: #609966;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 25px;
  font-family: 'Noto Sans';
  font-weight: 900;
  font-size: 15px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: #4f7c55;
  transform: translateY(-2px);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 페르소나 추천 섹션 */
.persona-recommendations {
  margin-bottom: 60px;
}

.recommendation-title {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 23px;
  color: #518f5c;
  margin-bottom: 30px;
  text-align: center;
}

.recommended-products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* 검색 결과 섹션 */
.search-results {
  margin-bottom: 60px;
}

.results-title {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 25px;
  color: #40513b;
  margin-bottom: 40px;
  text-align: center;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

/* 상품 카드 */
.product-card {
  background: #f5f7f9;
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 20px;
  min-height: 230px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.product-card.recommended {
  border: 2px solid #518f5c;
  box-shadow: 0 4px 20px rgba(81, 143, 92, 0.1);
}

.card-image {
  width: 120px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-company {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 15px;
  color: #636363;
}

.card-name {
  font-family: 'Noto Sans';
  font-weight: 700;
  font-size: 22px;
  color: #40513b;
  margin: 5px 0;
}

.card-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefit-item {
  font-family: 'Noto Sans';
  font-weight: 600;
  font-size: 18px;
  color: #898989;
  line-height: 1.4;
}

/* 로딩 및 빈 상태 */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 40px;
  color: #636363;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #609966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }

  .main-nav {
    display: none;
  }

  .main-content {
    padding: 20px;
  }

  .page-title {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .filter-container {
    padding: 20px;
  }

  .card-type-section {
    flex-direction: column;
    gap: 15px;
  }

  .benefits-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .recommended-products, .search-results-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .product-card {
    flex-direction: column;
    min-height: auto;
    padding: 20px;
  }

  .card-image {
    width: 100%;
    height: 180px;
    align-self: center;
    max-width: 200px;
  }

  .recommendation-title {
    font-size: 20px;
  }

  .results-title {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .brand-name {
    display: none;
  }

  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .benefit-option label {
    font-size: 13px;
  }

  .card-name {
    font-size: 18px;
  }

  .benefit-item {
    font-size: 16px;
  }
}

@media (min-width: 1200px) {
  .recommended-products, .search-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>