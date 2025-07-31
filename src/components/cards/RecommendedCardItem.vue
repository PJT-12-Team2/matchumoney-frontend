<template>
  <div class="recommended-card-item">
    <div class="card-header">
      <div class="card-image">
        <img :src="card.cardImageUrl" :alt="card.cardName" @error="handleImageError" />
      </div>
      <div class="card-info">
        <h3 class="card-name">{{ card.cardName }}</h3>
        <p class="card-issuer">{{ card.issuer }}</p>
        <span class="card-type" :class="cardTypeClass">{{ card.cardType }}</span>
      </div>
      <div class="benefit-amount">
        <span class="benefit-label">예상 혜택</span>
        <span class="benefit-value">{{ formatCurrency(card.estimatedBenefit) }}원</span>
      </div>
    </div>
    
    <div class="card-details">
      <div class="detail-row">
        <span class="detail-label">연회비</span>
        <span class="detail-value">{{ card.annualFee || '정보 없음' }}</span>
      </div>
      <div class="detail-row" v-if="card.preMonthMoney">
        <span class="detail-label">전월 실적</span>
        <span class="detail-value">{{ formatCurrency(card.preMonthMoney) }}원</span>
      </div>
    </div>

    <div class="card-actions">
      <button
        class="btn-apply"
        @click="openApplicationLink('pc')"
        v-if="card.requestPcUrl"
      >
        PC에서 신청
      </button>
      <button
        class="btn-apply mobile"
        @click="openApplicationLink('mobile')"
        v-if="card.requestMobileUrl"
      >
        모바일에서 신청
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecommendedCardItem',
  props: {
    card: {
      type: Object,
      required: true
    }
  },
  computed: {
    cardTypeClass() {
      return {
        'type-credit': this.card.cardType === '신용',
        'type-debit': this.card.cardType === '체크'
      };
    }
  },
  methods: {
    formatCurrency(amount) {
      if (!amount) return '0';
      return Number(amount).toLocaleString();
    },
    
    handleImageError(event) {
      // 이미지 로드 실패 시 기본 이미지로 대체
      event.target.src = '/logo.png';
    },
    
    openApplicationLink(type) {
      const url = type === 'pc' ? this.card.requestPcUrl : this.card.requestMobileUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  }
};
</script>

<style scoped>
.recommended-card-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommended-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card-image {
  flex-shrink: 0;
  width: 80px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
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
  min-width: 0;
}

.card-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.card-issuer {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.card-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-credit {
  background: #e3f2fd;
  color: #1976d2;
}

.type-debit {
  background: #f3e5f5;
  color: #7b1fa2;
}

.benefit-amount {
  text-align: right;
  flex-shrink: 0;
}

.benefit-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.benefit-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #4caf50;
}

.card-details {
  border-top: 1px solid #eee;
  padding-top: 16px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-apply {
  flex: 1;
  padding: 12px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-apply:hover {
  background: #1976d2;
}

.btn-apply.mobile {
  background: #4caf50;
}

.btn-apply.mobile:hover {
  background: #388e3c;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .benefit-amount {
    text-align: left;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>