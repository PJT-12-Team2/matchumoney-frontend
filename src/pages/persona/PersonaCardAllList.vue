<template>
  <div class="card-product-search">
    <main class="main-content">
      <!-- 🔷 페르소나 추천 캐러셀 -->
      <h1 class="page-title">페르소나 추천</h1>
      <section class="persona-carousel-section">
        <h2 class="persona-carousel-title">
          <span class="highlight">{{ userPersonaType }}</span>
          유형에게 추천하는 카드
        </h2>
        <Swiper
          v-if="isMobile"
          :slides-per-view="1.2"
          :space-between="16"
          :pagination="{
            clickable: true,
          }"
          :modules="modules"
          class="carousel-swiper">
          <SwiperSlide v-for="card in carouselCards" :key="card.id" class="carousel-card" @click="selectProduct(card)">
            <img :src="card.image" :alt="card.name" class="carousel-card-image" />
            <div class="carousel-card-name">{{ card.name }}</div>
            <div>{{ card.issuer || "카드사 미정" }}</div>
            <div class="carousel-card-benefit">
              <div>
                <span class="label">전월실적금액:</span>
                {{ card.preMonthMoney ? card.preMonthMoney.toLocaleString() + "원" : "정보 없음" }}
              </div>
              <div>
                <span class="label">연회비 정보:</span>
                {{ card.annualFee || "정보 없음" }}
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
        <div v-if="!isMobile" class="carousel-card-list">
          <div v-for="card in carouselCards" :key="card.id" class="carousel-card" @click="selectProduct(card)">
            <img :src="card.image" :alt="card.name" class="carousel-card-image" />
            <div class="carousel-card-name">{{ card.name }}</div>
            <div>{{ card.issuer || "카드사 미정" }}</div>
            <div class="carousel-card-benefit">
              <div>
                <span class="label">전월실적금액:</span>
                {{ card.preMonthMoney ? card.preMonthMoney.toLocaleString() + "원" : "정보 없음" }}
              </div>
              <div>
                <span class="label">연회비 정보:</span>
                {{ card.annualFee || "정보 없음" }}
              </div>
            </div>
          </div>
        </div>
      </section>
      <br />
      <hr />
      <br />
      <!-- 🔷 직접 검색 필터 영역 -->
      <h1 class="page-title">직접 찾아보는 카드</h1>
      <section class="filter-selection-section">
        <h3 class="filter-label">카드 종류 선택</h3>
        <div class="card-type-toggle">
          <button
            :class="['type-btn', filters.creditCard ? 'active' : '']"
            @click="
              () => {
                filters.creditCard = !filters.creditCard;
                searchProducts();
              }
            ">
            신용카드
          </button>
          <button
            :class="['type-btn', filters.debitCard ? 'active' : '']"
            @click="
              () => {
                filters.debitCard = !filters.debitCard;
                searchProducts();
              }
            ">
            체크카드
          </button>
        </div>

        <h3 class="filter-label">카드 혜택 선택</h3>
        <div class="benefit-grid">
          <div
            v-for="benefit in benefitCategories"
            :key="benefit.id"
            class="benefit-button"
            :class="{
              selected: filters.selectedBenefits.includes(benefit.id),
            }"
            @click="toggleBenefit(benefit.id)">
            <span class="emoji">{{ benefit.emoji }}</span>
            <span>{{ benefit.name }}</span>
          </div>
        </div>
      </section>

      <!-- 🔷 직접 검색 결과 리스트 -->
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
            :key="product.id || product.cardId"
            class="product-card"
            @click="selectProduct(product)">
            <div class="product-content">
              <img
                :src="product.imageUrl || product.cardImageUrl || getBankLogo('default')"
                :alt="product.name || product.cardName"
                class="product-image" />
              <div class="product-info">
                <h4>{{ product.name || product.cardName }}</h4>
                <div>
                  <span class="label">카드사:</span>
                  {{ product.issuer || "카드사 미정" }}
                </div>
                <div>
                  <span class="label">전월실적금액:</span>
                  {{ product.preMonthMoney ? product.preMonthMoney.toLocaleString() + "원" : "정보 없음" }}
                </div>
                <div>
                  <span class="label">연회비 정보:</span>
                  {{ product.annualFee || "정보 없음" }}
                </div>
                <!-- 수정된 부분: topBenefits 표시 -->
                <div v-if="product.topBenefits && product.topBenefits.length > 0" class="top-benefits">
                  <span class="label">주요 혜택 TOP 3</span>
                  <div class="benefit-tags">
                    <span v-for="benefit in product.topBenefits" :key="benefit" class="benefit-tag">
                      {{ benefit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<!--
  name: 'CardSearchPage'
-->
<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
const modules = [Pagination];

const isMobile = ref(window.innerWidth <= 768);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};
onMounted(() => {
  window.addEventListener("resize", handleResize);
});

// 📦 로딩 및 검색 결과 표시 상태
const loading = ref(false);
const showSearchResults = ref(true); // Always show the search results section

// 📦 필터 상태 정의
const filters = ref({
  creditCard: true,
  debitCard: true,
  selectedBenefits: [],
});

// 📦 혜택 카테고리 정의
const benefitCategories = ref([
  { id: "모든가맹점", name: "모든가맹점", emoji: "🏢" },
  { id: "교통", name: "교통", emoji: "🚗" },
  { id: "주유", name: "주유", emoji: "🛢️" },
  { id: "통신", name: "통신", emoji: "📱" },
  { id: "마트/편의점", name: "마트/편의점", emoji: "🛒" },
  { id: "쇼핑", name: "쇼핑", emoji: "🎁" },
  { id: "푸드", name: "푸드", emoji: "🍽️" },
  { id: "카페/디저트", name: "카페/디저트", emoji: "☕" },
  { id: "뷰티/피트니스", name: "뷰티/피트니스", emoji: "🚨" },
  { id: "무실적", name: "무실적", emoji: "💰" },
  { id: "공과금/렌탈", name: "공과금/렌탈", emoji: "🧾" },
  { id: "병원/약국", name: "병원/약국", emoji: "🏥" },
  { id: "애완동물", name: "애완동물", emoji: "🐱" },
  { id: "교육/육아", name: "교육/육아", emoji: "✏️" },
  { id: "자동차/하이패스", name: "자동차/하이패스", emoji: "🚗" },
  { id: "레저/스포츠", name: "레저/스포츠", emoji: "⚾" },
  { id: "OTT/영화/문화", name: "OTT/영화/문화", emoji: "🎬" },
  { id: "간편결제", name: "간편결제", emoji: "💳" },
  { id: "항공마일리지", name: "항공마일리지", emoji: "✈️" },
  { id: "공항라운지/PP", name: "공항라운지/PP", emoji: "💺" },
  { id: "프리미엄", name: "프리미엄", emoji: "💎" },
  { id: "여행/숙박", name: "여행/숙박", emoji: "🧳" },
  { id: "해외", name: "해외", emoji: "🌍" },
  { id: "비즈니스", name: "비즈니스", emoji: "💼" },
]);

// 📦 추천 캐러셀 카드 및 페르소나명
const carouselCards = ref([]);
const userPersonaType = ref("");

// 📦 추천 카드 불러오기
const fetchRecommendedCards = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 1. 사용자 personaId 가져오기
    const personaIdRes = await api.get("/cards/recommendations/user/persona-id", config);
    const personaCode = personaIdRes.data.personaId;

    // 2. 사용자 페르소나 카드 추천 가져오기
    const recommendationRes = await api.get("/cards/recommendations/user/recommendation", config);
    const result = recommendationRes.data.result;

    userPersonaType.value = result.personaName || "토끼형";
    carouselCards.value = (result.cards || []).map((item) => ({
      id: item.cardId,
      name: item.cardName,
      image: item.cardImageUrl || "",
      issuer: item.issuer || "",
      preMonthMoney: item.preMonthMoney,
      annualFee: item.annualFee,
      topBenefits: item.topBenefits || [],
    }));
  } catch (err) {
    console.error("❌ 사용자 기반 페르소나 카드 불러오기 실패:", err);
    userPersonaType.value = "토끼형";
    carouselCards.value = [];
  }
};

// 📦 카드 검색 결과
const searchResults = ref([]);

// 📦 카드 검색 API 호출
const searchProducts = async () => {
  loading.value = true;
  showSearchResults.value = true;
  try {
    const response = await api.post("/persona/cardsearch", {
      creditCard: filters.value.creditCard,
      debitCard: filters.value.debitCard,
      selectedBenefits: filters.value.selectedBenefits
        .map((id) => benefitCategories.value.find((b) => b.id === id)?.name)
        .filter(Boolean),
    });
    searchResults.value = response.data;
  } catch (error) {
    console.error("카드 검색 오류:", error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// 📦 혜택 토글 함수
const toggleBenefit = (id) => {
  const index = filters.value.selectedBenefits.indexOf(id);
  if (index === -1) filters.value.selectedBenefits.push(id);
  else filters.value.selectedBenefits.splice(index, 1);
  searchProducts(); // trigger filter
};

// 📦 카드 선택 동작
const selectProduct = (product) => {
  window.location.href = `/detail/card/${product.id}`;
};

// 📦 은행 로고 가져오기 (for compatibility)
const getBankLogo = (initial) => {
  const logos = {
    shinhan: "https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png",
    hana: "https://d1c5n4ri2guedi.cloudfront.net/card/718/card_img/28063/718card.png",
  };
  return logos[initial] || "https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png";
};

onMounted(() => {
  fetchRecommendedCards();
  searchProducts(); // 페이지 로드시 자동 실행
});
</script>

<style scoped>
/* 🔷 Layout 및 전체 구조 */
.card-product-search {
  font-family: "Noto Sans", sans-serif;
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
.carousel-card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 0 auto var(--spacing-2xl);
  max-width: 75rem;
  padding: 0 1rem;
}
.carousel-card {
  width: 400px;
  min-height: 400px;
  height: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}
.carousel-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
.carousel-card-image {
  width: 100%;
  height: 60%;
  object-fit: contain;
  border-radius: 12px;
}
.carousel-card-name {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}
.carousel-card-benefit {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  text-align: left;
  margin-top: 0.5rem;
  text-align: center;
}

.carousel-card-content {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  margin-right: 4px;
  color: #333;
}

/* 🔷 필터 영역 스타일 */
.filter-selection-section {
  background: #f9fafc;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 2rem;
  margin: 0 auto var(--spacing-2xl);
  max-width: 75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.card-type-toggle {
  margin-bottom: var(--spacing-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}
.type-btn {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  background: var(--color-white);
  cursor: pointer;
  border-radius: var(--spacing-md);
  font-size: var(--font-size-base);
}
.type-btn.active {
  background: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 1rem;
  margin: var(--spacing-lg) 0;
  padding: 0 var(--spacing-md);
}
.benefit-button {
  width: 6.5rem;
  height: 6.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border: 1.5px solid #dcdcdc;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease-in-out;
}
.benefit-button:hover {
  background-color: #f1fdf6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.benefit-button.selected {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}
.benefit-button .emoji {
  font-size: 1.7rem;
  margin-bottom: 0.4rem;
}

/* 🔷 검색 결과 카드 스타일 */
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
.product-info h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: bold;
}
.product-details {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
.highlight {
  font-size: var(--font-size-2xl);
  text-decoration: underline;
}
.filter-label {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  text-align: left;
}

/* 🔷 반응형 (모바일) 스타일 */
@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }
  .benefit-grid {
    display: flex;
    overflow-x: auto;
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
    scroll-snap-type: x mandatory;
  }
  .benefit-button {
    flex: 0 0 auto;
    scroll-snap-align: start;
    min-width: 6rem;
  }
  .carousel-card-list {
    justify-content: center;
    overflow-x: hidden;
  }
  .carousel-card {
    width: 220px;
    height: 320px;
  }
}
</style>
<style scoped>
.product-card {
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  text-align: center;
}
.product-card:hover {
  transform: translateY(-0.3125rem);
}

/* --- Product Content 2-column layout --- */
.product-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
}

.product-content img {
  height: 150px;
  width: 100%;
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.product-info > div,
.product-info > h4 {
  line-height: 1.6;
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
<style scoped>
.carousel-swiper {
  width: 100%;
  padding-bottom: 1.5rem;
}
.swiper-pagination-bullets {
  text-align: center;
}
.swiper-pagination-bullet {
  background: #4caf50;
  opacity: 0.4;
}
.swiper-pagination-bullet-active {
  opacity: 1;
}
</style>
