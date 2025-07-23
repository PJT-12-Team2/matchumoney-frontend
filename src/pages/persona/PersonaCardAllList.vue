<template>
  <div class="card-product-search">
    <main class="main-content">
      <h1 class="page-title">페르소나 추천</h1>

      <!-- 🐰 캐러셀 추천 -->
      <section class="persona-carousel-section">
        <h2 class="persona-carousel-title">
          <span class="highlight">토끼형</span>    유형에게 추천되는 카드
        </h2>
        <div class="carousel-card-list">
          <div
            v-for="card in carouselCards"
            :key="card.id"
            class="carousel-card"
            @click="selectProduct(card)"
          >
            <img :src="card.image" :alt="card.name" class="carousel-card-image" />
            <div class="carousel-card-name">{{ card.name }}</div>
            <div class="carousel-card-benefit">{{ card.benefit }}</div>
          </div>
        </div>
      </section>
      <br>
<hr>
  <br>
  <h1 class="page-title">직접 찾아보는 카드</h1>
      <!-- ✅ 카드 종류 + 혜택 선택 영역 -->
      <section class="filter-selection-section">
        <h3 class="filter-label">카드 종류 선택</h3>
        <div class="card-type-toggle">
          <button :class="['type-btn', filters.creditCard ? 'active' : '']" @click="filters.creditCard = !filters.creditCard">신용카드</button>
          <button :class="['type-btn', filters.debitCard ? 'active' : '']" @click="filters.debitCard = !filters.debitCard">체크카드</button>
        </div>

        <h3 class="filter-label">카드 혜택 선택</h3>
        <div class="benefit-grid">
          <div
            v-for="benefit in benefitCategories"
            :key="benefit.id"
            class="benefit-button"
            :class="{ selected: filters.selectedBenefits.includes(benefit.id) }"
            @click="toggleBenefit(benefit.id)"
          >
            <span class="emoji">{{ benefit.emoji }}</span>
            <span>{{ benefit.name }}</span>
          </div>
        </div>

        <div class="search-button-wrap">
          <button class="search-button" @click="searchProducts">검색된 카드 보기</button>
        </div>
      </section>

      <!-- 🔍 검색 결과 -->
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
import { ref } from 'vue'

export default {
  name: 'CardSearchPage',
  setup() {
    const loading = ref(false)
    const showSearchResults = ref(false)

    const filters = ref({
      creditCard: true,
      debitCard: true,
      selectedBenefits: []
    })

    const toggleBenefit = (id) => {
      const index = filters.value.selectedBenefits.indexOf(id)
      if (index === -1) filters.value.selectedBenefits.push(id)
      else filters.value.selectedBenefits.splice(index, 1)
    }

    const benefitCategories = ref([
  { id: 'all', name: '모든가맹점', emoji: '🏢' },
  { id: 'transport', name: '교통', emoji: '🚗' },
  { id: 'gas', name: '주유', emoji: '🛢️' },
  { id: 'telecom', name: '통신', emoji: '📱' },
  { id: 'mart', name: '마트/편의점', emoji: '🛒' },
  { id: 'shopping', name: '쇼핑', emoji: '🎁' },
  { id: 'food', name: '푸드', emoji: '🍽️' },
  { id: 'cafe', name: '카페/디저트', emoji: '☕' },
  { id: 'beauty', name: '뷰티/피트니스', emoji: '🚨' },
  { id: 'noCondition', name: '무실적', emoji: '💰' },
  { id: 'rental', name: '공과금/렌탈', emoji: '🧾' },
  { id: 'hospital', name: '병원/약국', emoji: '🏥' },
  { id: 'pet', name: '애완동물', emoji: '🐱' },
  { id: 'childcare', name: '교육/육아', emoji: '✏️' },
  { id: 'car', name: '자동차/하이패스', emoji: '🚗' },
  { id: 'sports', name: '레저/스포츠', emoji: '⚾' },
  { id: 'ott', name: 'OTT/영화/문화', emoji: '🎬' },
  { id: 'easyPayment', name: '간편결제', emoji: '💳' },
  { id: 'airline', name: '항공마일리지', emoji: '✈️' },
  { id: 'airportLounge', name: '공항라운지/PP', emoji: '💺' },
  { id: 'premium', name: '프리미엄', emoji: '💎' },
  { id: 'travel', name: '여행/숙박', emoji: '🧳' },
  { id: 'abroad', name: '해외', emoji: '🌍' },
  { id: 'business', name: '비즈니스', emoji: '💼' }
])

    const carouselCards = ref([
      {
        id: 'card1',
        name: 'KB국민 My WE:SH 카드',
        image: 'https://d1c5n4ri2guedi.cloudfront.net/card/13/card_img/28201/13card.png',
        benefit: '음식점 및 편의점 10%'
      },
      {
        id: 'card2',
        name: 'KB국민 My WE:SH 카드',
        image: 'https://d1c5n4ri2guedi.cloudfront.net/card/2376/card_img/27725/2376card.png',
        benefit: 'OTT 30%'
      },
      {
        id: 'card3',
        name: 'KB국민 My WE:SH 카드',
        image: 'https://d1c5n4ri2guedi.cloudfront.net/card/2846/card_img/42434/2846card_1.png',
        benefit: '카페 5%'
      }
    ])

    const allProducts = ref([
      {
        id: 1,
        name: '신한카드 Deep Dream',
        bank: '신한카드',
        bankInitial: 'shinhan',
        details: '주유 10% / 마트 5% / 교통 10%',
        categories: ['gas', 'mart', 'transport'],
        cardType: 'credit'
      },
      {
        id: 2,
        name: '하나카드 원큐페이',
        bank: '하나카드',
        bankInitial: 'hana',
        details: '쇼핑 15% / 카페 10% / 뷰티 5%',
        categories: ['shopping', 'cafe', 'beauty'],
        cardType: 'debit'
      }
    ])

    const searchResults = ref([])

    const getBankLogo = (initial) => {
      const logos = {
        shinhan: 'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png',
        hana: 'https://d1c5n4ri2guedi.cloudfront.net/card/718/card_img/28063/718card.png'
      }
      return logos[initial] || 'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png'
    }

    const selectProduct = (product) => {
      alert(`${product.name}을 선택했습니다.`)
    }

    const searchProducts = () => {
      loading.value = true
      showSearchResults.value = true

      setTimeout(() => {
        let result = allProducts.value

        if (filters.value.creditCard || filters.value.debitCard) {
          result = result.filter(p =>
            (filters.value.creditCard && p.cardType === 'credit') ||
            (filters.value.debitCard && p.cardType === 'debit')
          )
        }

        if (filters.value.selectedBenefits.length > 0) {
          result = result.filter(p =>
            filters.value.selectedBenefits.some(tag => p.categories.includes(tag))
          )
        }

        searchResults.value = result
        loading.value = false
      }, 800)
    }

    return {
      loading,
      showSearchResults,
      filters,
      benefitCategories,
      toggleBenefit,
      searchProducts,
      carouselCards,
      searchResults,
      getBankLogo,
      selectProduct
    }
  }
}
</script>

<style scoped>
.card-product-search {
  font-family: 'Noto Sans', sans-serif;
  background: #fff;
  min-height: 100vh;
}
.main-content {
  max-width: 1200px;
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
.carousel-card-list {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.carousel-card {
  width: 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 16px;
  cursor: pointer;
}
.carousel-card-image {
  width: 100%;
  border-radius: 8px;
}
.carousel-card-name {
  font-size : 22px;
  font-weight: bold;
  margin: 10px 0 4px;
}
.carousel-card-benefit {
  font-size: 18px;
  color: #666;
}
.filter-selection-section {
  text-align: left;
  margin-bottom: 40px;
  padding: 30px;
  border: 2px solid #ccc;
  border-radius: 16px;
  background: #fafafa;
}
.card-type-toggle {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.type-btn {
  padding: 10px 20px;
  margin: 0 5px;
  border: 2px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 8px;
}
.type-btn.active {
  background: #609966;
  color: white;
  border-color: #609966;
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 0 12px;
}
.benefit-button {
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
}
.benefit-button.selected {
  background: #609966;
  color: white;
  border-color: #609966;
}
.benefit-button .emoji {
  display: block;
  font-size: 20px;
  margin-bottom: 4px;
}
.search-button-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-button {
  padding: 12px 24px;
  font-size: 16px;
  background: #609966;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
.highlight{
  font-size : 30px;
  text-decoration: underline;
}
.filter-label {
  font-size: 18px;
  font-weight: 700;
  color: #40513b;
  margin-bottom: 12px;
  text-align: left;
}
</style>