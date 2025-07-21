<template>
    <div class="recommendation-page">
      <!-- ✅ 카드 추천 3개 꽉차게 -->
      <section class="recommendation-section">
        <h2><span class="highlight">토끼형</span> 유형에게 추천되는 카드</h2>
        <div class="card-row">
          <div class="card-box" v-for="card in recommendedCards" :key="card.name">
            <img :src="card.image" class="card-image" />
            <div class="card-title">{{ card.name }}</div>
            <div class="card-benefit">{{ card.benefit }}</div>
          </div>
        </div>
      </section>
  
      <!-- ✅ 필터링 바 -->
      <section class="filter-section">
        <div class="search-count">{{cardFilterCount}}개 신용카드 검색 결과</div>
  
        <div class="filter-bar">
          <div class="filter-group">
            <label>연회비</label>
            <input type="range" v-model="filters.feeRange" min="0" max="5" />
          </div>
          <div class="filter-group">
            <label>전월실적</label>
            <input type="range" v-model="filters.performanceRange" min="0" max="5" />
          </div>
          <select v-model="filters.company">
            <option value="">전체카드사</option>
            <option value="신한">신한</option>
            <option value="KB">KB</option>
          </select>
          <select v-model="filters.brand">
            <option value="">전체브랜드</option>
          </select>
          <select v-model="filters.sort">
            <option value="popular">인기순</option>
          </select>
          <button class="reset-btn" @click="resetFilter">⟲</button>
        </div>
  
        <div class="filter-buttons">
          <button class="gray-btn">모든가맹점</button>
          <button class="yellow-btn" @click="applyFilter">재검색</button>
        </div>
      </section>
  
      <!-- ✅ 필터링된 카드 목록 -->
      <section class="card-list">
        <div class="card-item" v-for="(card, idx) in filteredCards" :key="idx">
          <img :src="card.image" class="card-thumb" />
          <div class="card-info">
            <div class="card-name">{{ card.name }}</div>
            <div class="card-desc">{{ card.benefit }}</div>
          </div>
          <button class="detail-btn">자세히 보기</button>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const recommendedCards = [
    {
      name: '신한 딥드림 카드',
      image: new URL('@/assets/card.png', import.meta.url).href,
      benefit: '캐시백 + 포인트 이중 혜택',
    },
    {
      name: 'KB 올쇼핑 카드',
      image: new URL('@/assets/card.png', import.meta.url).href,
      benefit: '온라인 쇼핑 10% 할인',
    },
    {
      name: '우리 캐시백 체크카드',
      image: new URL('@/assets/card.png', import.meta.url).href,
      benefit: '간편결제 최대 2% 적립',
    },
  ]
  
  const allCards = ref([
    ...recommendedCards,
    {
      name: '삼성 iD SIMPLE 카드',
      image: new URL('@/assets/card.png', import.meta.url).href,
      benefit: '영화 3,000원 할인, 온라인쇼핑 50% 할인',
      feeRange: 2,
      performanceRange: 1,
      company: '삼성',
    },
    {
      name: '현대카드 ZERO Up',
      image: new URL('@/assets/card.png', import.meta.url).href,
      benefit: '27.5만원 캐시백, 실적 없음',
      feeRange: 1,
      performanceRange: 0,
      company: '현대',
    },
  ])
  
  const filters = ref({
    feeRange: 5,
    performanceRange: 5,
    company: '',
    brand: '',
    sort: 'popular',
  })
  
  const resetFilter = () => {
    filters.value = {
      feeRange: 5,
      performanceRange: 5,
      company: '',
      brand: '',
      sort: 'popular',
    }
  }
  
  const filteredCards = computed(() => {
    return allCards.value.filter(card => {
      return (
        (card.feeRange ?? 0) <= filters.value.feeRange &&
        (card.performanceRange ?? 0) <= filters.value.performanceRange &&
        (!filters.value.company || card.company === filters.value.company)
      )
    })
  })
  
  const applyFilter = () => {}
  </script>
  
  <style scoped>
  .recommendation-page {
    padding: 2rem;
    background-color: #f9f9f9;
    font-family: 'Noto Sans KR';
  }
  .recommendation-section h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  .highlight {
    color: #ff6600;
  }
  .card-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .card-box {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 1rem;
    flex: 1;
    text-align: center;
  }
  .card-image {
    width: 100%;
    border-radius: 8px;
  }
  .card-title {
    font-weight: bold;
    margin: 0.5rem 0;
  }
  .card-benefit {
    color: #555;
  }
  
  .filter-section {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 2rem;
  }
  .search-count {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
  }
  .reset-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .filter-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  .gray-btn, .yellow-btn {
    border-radius: 10px;
    padding: 0.5rem 1.2rem;
    font-weight: bold;
  }
  .gray-btn {
    background: #eee;
    color: #000;
  }
  .yellow-btn {
    background: #ffc940;
    color: black;
  }
  
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .card-item {
    display: flex;
    background: white;
    border-radius: 12px;
    padding: 1rem;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }
  .card-thumb {
    width: 80px;
    border-radius: 10px;
  }
  .card-info {
    flex: 1;
    margin-left: 1rem;
  }
  .card-name {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .card-desc {
    color: #777;
  }
  .detail-btn {
    background: black;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }
  </style>
  