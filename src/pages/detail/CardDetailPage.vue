<template>
  <div class="container" v-if="cardData">
    <div class="saving-detail-page">
      <section class="card-header-wrapper">
        <section class="card-header">
          <div class="card-image-wrapper">
            <div class="favorite-wrapper">
              <FavoriteToggle
                v-model="isFavorite"
                :productId="cardData.cardProductId"
                :productType="productType"
              />
            </div>
            <img
              :src="cardData.cardImageUrl"
              alt="카드 이미지"
              class="card-image"
            />
            <div class="reaction-group">
              <LikeToggle
                :productId="cardData.cardProductId"
                productType="card-products"
                :initialLiked="isLiked"
                :initialCount="likeCount"
                @update="
                  ({ liked, count }) => {
                    isLiked = liked;
                    likeCount = count;
                  }
                "
              />
              <button class="compare-button">➕ 비교함 담기</button>
            </div>
          </div>
          <div class="card-info">
            <h2 class="card-title">{{ cardData.name }}</h2>
            <p class="subtitle">{{ cardData.issuer }}({{ cardData.type }})</p>
            <p class="card-meta">
              전월 실적:
              <strong>{{
                cardData.preMonthMoney
                  ? Number(cardData.preMonthMoney).toLocaleString() + '원'
                  : '없음'
              }}</strong>
              &nbsp;|&nbsp; 연회비:
              <strong>{{ cardData.annualFee || '정보 없음' }}</strong>
            </p>
            <div class="benefit-hashtags">
              <span
                v-for="(option, index) in cardData.options.slice(0, 3)"
                :key="index"
                class="hashtag"
              >
                #{{ option.title }}
              </span>
            </div>
            <ul class="card-benefits">
              <!-- other benefits can be listed here -->
            </ul>
            <div class="button-group">
              <button class="go-to-card" @click="goToCardSite">
                카드사 바로가기
              </button>
              <button class="compare-link">비교함 바로가기</button>
            </div>
          </div>
        </section>
      </section>

      <section class="persona-banner-section">
        <div class="info-banner">
          <p class="badge">
            <span class="highlight">{{ personaName }}</span> 유형이 많이 찾는
            상품
          </p>
        </div>
      </section>

      <section class="interest-section">
        <h2 class="section-title">혜택 안내</h2>
        <div class="benefits-section">
          <div v-if="cardData.options && cardData.options.length">
            <div
              v-for="(option, idx) in cardData.options"
              :key="idx"
              :class="
                option.title.includes('유의사항')
                  ? ''
                  : 'collapsible-card green-card'
              "
              @click="
                !option.title.includes('유의사항') &&
                  (option.expanded = !option.expanded)
              "
            >
              <div
                class="benefit-header-line"
                v-if="!option.title.includes('유의사항')"
              >
                <span class="benefit-icon-inline">🏷️</span>
                <div class="benefit-title-wrapper">
                  <strong class="benefit-title-text">{{ option.title }}</strong>
                  <span class="benefit-discount-black"
                    >최대 {{ formatValue(option.value) }} 할인</span
                  >
                </div>
              </div>
              <p
                class="note-paragraph"
                v-if="option.title.includes('유의사항')"
                v-html="
                  formatDescription(option.description).replaceAll('\n', '<br>')
                "
              ></p>
              <transition name="slide-fade">
                <div
                  class="benefit-expand-box"
                  v-if="option.expanded && !option.title.includes('유의사항')"
                >
                  <p v-if="!option.showFull">
                    {{ formattedBrief(option.description) }}
                    <span class="see-more" @click.stop="option.showFull = true"
                      >더보기</span
                    >
                  </p>
                  <p v-else>
                    <span
                      v-for="(line, idx) in formattedLines(option.description)"
                      :key="idx"
                    >
                      {{ line }}<br />
                    </span>
                    <span class="see-less" @click.stop="option.showFull = false"
                      >접기</span
                    >
                  </p>
                </div>
              </transition>
            </div>
          </div>
          <div v-else>
            <p>등록된 혜택 정보가 없습니다.</p>
          </div>
        </div>
      </section>
      <section class="recommend-buttons">
        <router-link to="/persona/cards" class="recommend-button green"
          >나의 페르소나로 카드 추천 받기</router-link
        >
        <router-link to="/mydata/cards" class="recommend-button"
          >마이데이터 기반 카드 추천 받기</router-link
        >
      </section>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import LikeToggle from '@/components/common/LikeToggle.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import { ProductType } from '@/constants/productTypes';

const productType = ProductType.CARD;

const personaNameMap = {
  1: '거북이',
  2: '다람쥐',
  3: '개미',
  4: '부엉이',
  5: '토끼',
  6: '고양이',
  7: '호랑이',
  8: '펭귄',
  9: '기타',
};

const route = useRoute();

const cardData = ref(null);
const likeCount = ref(0);
const isLiked = ref(false);
const isFavorite = ref(false);
const savingData = ref(null);
const userId = ref(null);
const router = useRouter();
const personaName = computed(() => {
  return personaNameMap[cardData.value?.personaId] || '기타';
});

function formatValue(value) {
  const num = parseFloat(value);
  return num >= 100 ? `${num.toLocaleString()}원` : `${num}%`;
}

function formattedLines(text) {
  return text
    .replace('Powered by Froala Editor', '')
    .split(/ - |\* /)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function formattedBrief(text) {
  const lines = formattedLines(text);
  return lines.slice(0, 3).join(' · ') + '...';
}

onMounted(() => {
  // Extract userId from sessionStorage
  let uid = null;
  try {
    uid = sessionStorage.getItem('userId');
    if (uid) uid = Number(uid);
  } catch (e) {
    uid = null;
  }
  userId.value = uid;

  const id = route.params.cardId;
  api.get(`/card-products/${id}`).then((res) => {
    cardData.value = res.data;
    savingData.value = res.data; // Assuming savingData is part of cardData or same data
    if (cardData.value.options && Array.isArray(cardData.value.options)) {
      cardData.value.options.forEach((option) => {
        option.expanded = false;
        option.showFull = false;
      });
    }
    isLiked.value = res.data.liked;
    likeCount.value = res.data.likeCount;
    isFavorite.value = res.data.starred; // 즐겨찾기 상태 설정
  });
});

function formatDescription(text) {
  if (!text) return '';
  return text
    .replaceAll(' - ', '\n- ')
    .replaceAll(' ※', '\n※')
    .replaceAll(' ①', '\n①')
    .replaceAll(' ②', '\n②')
    .replaceAll(' ③', '\n③')
    .replaceAll(' ④', '\n④');
}

function goToCardSite() {
  if (cardData.value?.requestPcUrl) {
    window.open(cardData.value.requestPcUrl, '_blank');
  }
}
</script>

<style scoped>
.benefit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.benefit-table th,
.benefit-table td {
  border: 1px solid #e0e0e0;
  padding: 10px 8px;
  text-align: center;
  font-size: 15px;
}
.benefit-table th {
  background: #e6f4ec;
  color: #2e7d32;
  font-weight: bold;
}
.benefit-table td strong {
  color: #388e3c;
}
.underline {
  text-decoration: underline;
}
.container {
  max-width: 960px;
  margin: 0 auto;
}
.saving-detail-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 40px;
}

.card-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
  position: relative;
}

.card-image {
  width: 160px;
  height: auto;
  border-radius: 12px;
  margin-bottom: 10px;
}

.compare-button {
  background: none;
  border: none;
  color: #333;
  font-weight: bold;
  cursor: pointer;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.badge {
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
}

.card-benefits {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.card-benefits li {
  font-size: 16px;
  margin-bottom: 6px;
}

.button-group {
  display: flex;
  width: 100%;
  gap: 12px;
}

.button-group > .go-to-card,
.button-group > .compare-link {
  flex: 1 1 0;
  width: 100%;
  text-align: center;
}

.full-width {
  width: 100%;
}

.go-to-card {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 0;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;
}

.go-to-card:hover {
  background-color: #3e8e41;
}

.compare-link {
  background-color: #81c784;
  color: white;
  border: none;
  padding: 12px 0;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.compare-link:hover {
  background-color: #66bb6a;
}

.card-meta span {
  display: inline-block;
  margin-right: 16px;
  font-size: 13px;
  color: #777;
}

.benefits-section {
  margin-top: 30px;
}

.benefit-paragraph h4 {
  font-size: 16px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 4px;
}

.benefit-paragraph p {
  font-size: 14px;
  color: #444;
  margin-bottom: 12px;
}

.highlight {
  color: #2e7d32;
  font-weight: 900;
  font-size: 18px;
  text-decoration: underline;
}

.reaction-group {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.reaction-button,
.compare-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reaction-button:hover,
.compare-button:hover {
  background-color: #e0e0e0;
}

.card-header-wrapper {
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}


.favorite-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.favorite-icon:hover {
  transform: scale(1.2);
}


/* 금리 안내 스타일 */
.interest-section {
  margin-top: 40px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.interest-summary {
  margin-bottom: 20px;
}

.saving-amount .value {
  font-size: 24px;
  font-weight: bold;
  margin: 4px 0 12px;
}

.rate-tab {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.rate-tab .tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #ddd;
}

.rate-tab .tab:last-child {
  border-right: none;
}

.rate-tab .tab.active {
  background: #e6f4ec;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  border-radius: 6px;
  margin: -1px;
}

.payout-summary {
  background: #e6f4ec;
  padding: 16px;
  border-radius: 8px;
}

.payout-summary div {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

.payout-summary .total {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-top: 10px;
}

.term-rates table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.term-rates th,
.term-rates td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.term-rates th {
  background: #f0f0f0;
}

.rate-conditions h4 {
  margin-top: 20px;
}

.rate-conditions ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

.rate-type {
  font-weight: bold;
  margin-top: 10px;
}

/* New styles */
.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #2e7d32;
}

.subsection {
  background-color: #f5fdf7;
  padding: 12px 16px 16px 16px;
  border-radius: 10px;
  margin-top: 20px;
  border: 1px solid #d6eddc;
}

.subsection h4 {
  font-size: 18px;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 8px;
  margin-top: 0;
}

.subsection ul {
  margin: 0;
  padding-left: 20px;
}

.subsection p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #444;
}

/* .collapsible-card styles can be omitted in favor of .green-card for benefit list */

.green-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-left: none;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.green-card .card-header {
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 6px;
}

.green-card .card-content {
  margin-top: 4px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.benefit-hashtags .hashtag {
  display: inline-block;
  background-color: #e6f4ec;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 20px;
  margin-right: 8px;
  font-size: 13px;
  font-weight: 500;
}

.benefit-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.benefit-icon {
  font-size: 28px;
  margin-right: 20px;
}

.benefit-title {
  color: #2e7d32;
  font-size: 17px;
  font-weight: bold;
}

.benefit-desc {
  font-size: 15px;
  color: #333;
}

.note-row {
  cursor: default;
}

.note-row .benefit-title {
  font-size: 15px;
  color: #444;
  font-weight: 600;
}

.note-row .benefit-description {
  padding-left: 0;
  margin-top: 6px;
  font-size: 14px;
  color: #555;
}

.see-more,
.see-less {
  color: #2e7d32;
  font-weight: bold;
  cursor: pointer;
  margin-left: 6px;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 200px;
  opacity: 1;
}

.benefit-block {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 20px;
}

.benefit-block h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 6px;
}

.benefit-block p {
  font-size: 14px;
  color: #444;
  margin: 0;
}

.won-label {
  position: absolute;
  right: 0;
  bottom: 6px;
  font-weight: bold;
  font-size: 20px;
  color: #333;
}

.info-banner {
  background-color: #f0f8f5;
  border: 1px solid #d2e8dd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  text-align: center;
}

.persona-banner-section {
  margin-top: 20px;
}

.max-limit {
  color: #2e7d32;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  text-decoration: underline;
}

.saving-amount .label {
  font-weight: bold;
  font-size: 14px;
  color: #444;
  margin-bottom: 6px;
}

.amount-input {
  font-size: 28px;
  font-weight: bold;
  border: none;
  outline: none;
  width: 100%;
  padding-right: 40px;
  background: transparent;
  text-align: left;
}

.formatted-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border-bottom: 2px solid #222;
  padding-bottom: 6px;
  margin-top: 4px;
}

.input-guide {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.interest-caption {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.benefit-description {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  padding-left: 48px;
  white-space: pre-line;
}

.note-paragraph {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin-top: 12px;
  white-space: pre-line;
}
</style>
<style scoped>
.benefit-header-line {
  display: flex;
  align-items: center;
  font-size: 17px;
  color: #2e7d32;
  font-weight: bold;
  margin-bottom: 6px;
  gap: 10px;
}

.benefit-icon-inline {
  font-size: 22px;
}

.benefit-inline-text {
  font-size: 18px;
}
.benefit-expand-box {
  background-color: #f0f8f5;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  margin-left: 8px;
  margin-right: 8px;
  font-size: 15px;
  color: #333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid #e0e0e0;
}

.benefit-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit-title-text {
  font-size: 17px;
  color: #2e7d32;
  font-weight: bold;
}

.benefit-discount-black {
  font-size: 15px;
  color: #000;
  font-weight: 500;
}
.recommend-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

.recommend-button {
  display: inline-block;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  background-color: #fff;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
}

.recommend-button.green {
  background-color: #2e7d32;
  color: #fff;
  border: none;
}

.recommend-button.green:hover {
  background-color: #27682a;
}

.recommend-button:hover {
  background-color: #e0f3e7;
}

.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}

</style>
