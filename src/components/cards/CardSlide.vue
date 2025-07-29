<template>
  <div class="card-slide" @click="$emit('click')">
    <!-- 카드 메인 행 -->
    <div class="card-main-row">
      <!-- 왼쪽: 카드명 + 이미지 -->
      <div class="card-main-info">
        <div class="card-name">{{ card.cardName || '카드명 없음' }}</div>
        <div class="card-image-container">
          <div v-if="card.imageUrl" class="card-image">
            <img :src="card.imageUrl" :alt="card.cardName" />
          </div>
          <div v-else class="card-image-placeholder" :style="{ background: cardGradient }">
            <div class="card-chip"></div>
            <div class="card-brand">{{ getCardBrand(card.cardName) }}</div>
            <div class="card-number-display">
              {{ formatCardNumber(card.maskedCardNo) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 오른쪽: 카드 세부정보 -->
      <div class="card-details card-details-col">
        <div class="card-info-section">
          <h4>카드번호</h4>
          <div class="card-number">{{ formatCardNumber(card.maskedCardNo) }}</div>
        </div>
        <div class="card-status-section">
          <h4>상태</h4>
          <div class="card-status" :class="getStatusClass(card.cardState)">
            {{ card.cardState || '알 수 없음' }}
          </div>
        </div>
        <div class="card-matching-section">
          <h4>매칭상태</h4>
          <div class="card-matching" :class="matchingStatusClass">
            {{ matchingText }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 클릭 유도 텍스트 -->
    <div class="click-hint">
      터치하여 거래내역 동기화하기
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);

// 매칭 상태 확인 (카드 제품과 매칭되었는지)
const isMatched = computed(() => {
  // matchStatus 필드를 사용하여 매칭 상태 확인
  return props.card.matchStatus === 'MATCHED';
});

const matchingStatusClass = computed(() => {
  return isMatched.value ? 'matched' : 'unmatched';
});

const matchingIcon = computed(() => {
  return isMatched.value ? '✓' : '!';
});

const matchingText = computed(() => {
  return isMatched.value ? '매칭완료' : '매칭필요';
});

// 카드 브랜드별 그라데이션
const cardGradient = computed(() => {
  const cardName = props.card.cardName?.toLowerCase() || '';
  
  if (cardName.includes('신한')) {
    return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  } else if (cardName.includes('kb') || cardName.includes('국민')) {
    return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  } else if (cardName.includes('하나')) {
    return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  } else if (cardName.includes('우리')) {
    return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
  } else if (cardName.includes('삼성')) {
    return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  } else {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
});

const getCardBrand = (cardName) => {
  if (!cardName) return 'CARD';
  
  const name = cardName.toLowerCase();
  if (name.includes('신한')) return 'SHINHAN';
  if (name.includes('kb') || name.includes('국민')) return 'KB';
  if (name.includes('하나')) return 'HANA';
  if (name.includes('우리')) return 'WOORI';
  if (name.includes('삼성')) return 'SAMSUNG';
  return 'CARD';
};

const formatCardNumber = (cardNo) => {
  if (!cardNo) return '**** **** **** ****';
  
  // 이미 마스킹된 번호인 경우 (예: "557042******4011")
  if (cardNo.includes('*')) {
    // 6자리 숫자 + 6개 별표 + 4자리 숫자 형태를 4자리씩 끊어서 표시
    const match = cardNo.match(/^(\d{6})(\*+)(\d{4})$/);
    if (match) {
      const [, first6, stars, last4] = match;
      return `${first6.slice(0,4)} ${first6.slice(4,6)}** **** ${last4}`;
    }
    // 다른 형태의 마스킹이라면 그대로 반환
    return cardNo;
  }
  
  // 전체 번호인 경우 마스킹 처리
  const masked = cardNo.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1 **** **** $4');
  return masked || `**** **** **** ${cardNo.slice(-4)}`;
};

const formatValidityDate = (validTerm) => {
  if (!validTerm || validTerm.length !== 4) return '';
  return `${validTerm.slice(0, 2)}/${validTerm.slice(2, 4)}`;
};

const getStatusText = (status) => {
  // 백엔드에서 이미 문자열로 상태를 제공하므로 그대로 사용
  return status || '알 수 없음';
};

const getStatusClass = (status) => {
  if (!status) return 'status-normal';
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('정상')) return 'status-normal';
  if (lowerStatus.includes('정지') || lowerStatus.includes('일시정지')) return 'status-blocked';
  if (lowerStatus.includes('해지') || lowerStatus.includes('폐지')) return 'status-closed';
  return 'status-normal';
};
</script>

<style scoped>
.card-slide {
  background: var(--gradient-accent);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  border-radius: 20px;
  color: var(--color-white);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.card-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
  pointer-events: none;
}

.card-slide > * {
  position: relative;
  z-index: 2;
}

.card-slide:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* 카드 정보 메인 행 */
.card-main-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2xl);
  flex: 1;
}

/* 왼쪽: 카드명+이미지 */
.card-main-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  flex: 1;
}

.card-name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
}

.card-image-container {
  width: 100%;
  min-height: 160px;
}

.card-image {
  width: 100%;
  max-width: 280px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-glass);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.9;
  filter: brightness(1.1) contrast(1.05);
}

.card-image-placeholder {
  width: 100%;
  max-width: 280px;
  height: 160px;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.card-chip {
  width: 32px;
  height: 24px;
  background: linear-gradient(45deg, var(--color-warning) 0%, var(--color-warning-light) 100%);
  border-radius: 4px;
  position: relative;
  align-self: flex-start;
}

.card-chip::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: linear-gradient(45deg, var(--color-warning-dark) 0%, var(--color-warning) 100%);
  border-radius: 2px;
}

.card-brand {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.9;
  color: var(--color-white);
}

.card-number-display {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  color: var(--color-white);
  text-shadow: 0 1px 2px var(--color-dark-30);
  align-self: flex-end;
}

/* 오른쪽: 카드 세부정보 */
.card-details-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  min-width: 140px;
  gap: var(--spacing-lg);
}

.card-info-section,
.card-status-section,
.card-matching-section {
  text-align: right;
}

.card-info-section h4,
.card-status-section h4,
.card-matching-section h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  opacity: 0.9;
  color: var(--color-white);
}

.card-number,
.card-status,
.card-matching {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.status-normal {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.status-blocked {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.status-closed {
  background: var(--color-error-light);
  color: var(--color-error-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.card-matching.matched {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.card-matching.unmatched {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.click-hint {
  text-align: center;
  font-size: var(--font-size-sm);
  opacity: 0.8;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm);
  background: var(--color-glass);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

/* 모바일 반응형 */
@media (max-width: 600px) {
  .card-main-row {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }
  
  .card-details-col {
    align-items: flex-start;
    text-align: left;
    min-width: 0;
    width: 100%;
  }
  
  .card-info-section,
  .card-status-section,
  .card-matching-section {
    text-align: left;
  }
  
  .card-main-info {
    min-width: 0;
    width: 100%;
  }
  
  .card-image,
  .card-image-placeholder {
    max-width: 100%;
  }
  
  .card-slide {
    padding: var(--spacing-lg);
    min-height: 260px;
  }
  
  .card-name {
    font-size: var(--font-size-lg);
  }
}
</style>