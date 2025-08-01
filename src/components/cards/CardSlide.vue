<template>
  <div class="card-slide">
    <div class="row-layout">
      <!-- 왼쪽: 카드 실물 + 카드명 -->
      <div class="card-visual-section">
        <div class="card-visual">
          <div v-if="card.imageUrl" class="img-card">
            <img :src="card.imageUrl" :alt="card.cardName" />
          </div>
          <div
            v-else
            class="img-card card-gradient"
            :style="{ background: cardGradient }"
          >
            <div class="chip"></div>
            <span class="brand">{{ getCardBrand(card.cardName) }}</span>
            <span class="card-no">{{
              formatCardNumber(card.maskedCardNo)
            }}</span>
          </div>
        </div>
        <div class="visual-label">{{ card.cardName || "카드명 없음" }}</div>
      </div>

      <!-- 오른쪽: 카드 정보 -->
      <div class="card-info-section">
        <div class="info-row">
          <span class="info-label">카드번호</span>
          <span class="info-value">{{
            formatCardNumber(card.maskedCardNo)
          }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">상태</span>
          <span class="info-badge" :class="getStatusClass(card.cardState)">
            {{ card.cardState || "알 수 없음" }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">매칭상태</span>
          <span class="info-badge matching" :class="matchingStatusClass">
            {{ matchingText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const isMatched = computed(() => props.card.matchStatus === "MATCHED");
const matchingStatusClass = computed(() =>
  isMatched.value ? "matched" : "unmatched"
);
const matchingText = computed(() =>
  isMatched.value ? "매칭완료" : "매칭필요"
);

const cardGradient = computed(() => {
  const cardName = props.card.cardName?.toLowerCase() || "";
  if (cardName.includes("신한"))
    return "linear-gradient(120deg,#355c7d 0%,#6c5b7b 100%)";
  if (cardName.includes("kb") || cardName.includes("국민"))
    return "linear-gradient(120deg,#ffd452 0%,#544a7d 100%)";
  if (cardName.includes("하나"))
    return "linear-gradient(120deg,#11998e 0%,#38ef7d 100%)";
  if (cardName.includes("우리"))
    return "linear-gradient(120deg,#43cea2 0%,#185a9d 100%)";
  if (cardName.includes("삼성"))
    return "linear-gradient(120deg,#fa709a 0%,#fee140 100%)";
  return "linear-gradient(120deg,#8ec5fc 0%,#e0c3fc 100%)";
});

const getCardBrand = (cardName) => {
  if (!cardName) return "CARD";
  const name = cardName.toLowerCase();
  if (name.includes("신한")) return "SHINHAN";
  if (name.includes("kb") || name.includes("국민")) return "KB";
  if (name.includes("하나")) return "HANA";
  if (name.includes("우리")) return "WOORI";
  if (name.includes("삼성")) return "SAMSUNG";
  return "CARD";
};

const formatCardNumber = (cardNo) => {
  if (!cardNo) return "**** **** **** ****";
  if (cardNo.includes("*")) {
    const match = cardNo.match(/^(\d{6})(\*+)(\d{4})$/);
    if (match) {
      const [, first6, stars, last4] = match;
      return `${first6.slice(0, 4)} ${first6.slice(4, 6)}** **** ${last4}`;
    }
    return cardNo;
  }
  return (
    cardNo.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, "$1 **** **** $4") ||
    `**** **** **** ${cardNo.slice(-4)}`
  );
};

const getStatusClass = (status) => {
  if (!status) return "status-normal";
  const lower = status.toLowerCase();
  if (lower.includes("정상")) return "status-normal";
  if (lower.includes("정지") || lower.includes("일시정지"))
    return "status-blocked";
  if (lower.includes("해지") || lower.includes("폐지")) return "status-closed";
  return "status-normal";
};
</script>

<style scoped>
.card-slide {
  background: var(--color-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg)
    var(--spacing-xl);
  margin: 0 auto var(--spacing-lg) auto;
  width: 100%;
  height: 100%;
  max-width: 1000px;
  min-height: 215px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

/* 데스크탑 레이아웃 */
.row-layout {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2xl);
  align-items: stretch;
}
.card-visual-section {
  flex: 0 0 245px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 170px;
  margin-bottom: 0;
  justify-content: center;
}
.card-visual {
  width: 210px;
  height: 135px;
  border-radius: 12px;
  margin-bottom: var(--spacing-sm);
  position: relative;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-light);
}
.img-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.card-gradient {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-lg)
    var(--spacing-xl);
}
.chip {
  width: 32px;
  height: 22px;
  background: var(--gradient-accent);
  border-radius: 4px;
  margin-bottom: var(--spacing-lg);
}
.brand {
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 2px;
  position: absolute;
  right: var(--spacing-lg);
  top: var(--spacing-lg);
  color: var(--color-white);
  text-shadow: var(--shadow-sm);
}
.card-no {
  font-size: var(--font-size-lg);
  font-family: "Roboto Mono", monospace;
  letter-spacing: 2.5px;
  color: var(--color-white);
  font-weight: 500;
  text-shadow: var(--shadow-sm);
  margin-top: var(--spacing-sm);
  align-self: flex-end;
}
.visual-label {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}
.card-info-section {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--spacing-xs);
}
.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.info-label {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  min-width: 72px;
}
.info-value {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.info-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  letter-spacing: 0.5px;
}
.status-normal {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}
.status-blocked {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}
.status-closed {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}
.matching.matched {
  background: var(--color-accent-20);
  color: var(--color-dark);
}
.matching.unmatched {
  background: var(--color-secondary-20);
  color: var(--color-dark);
}

/* 태블릿 레이아웃
@media (max-width: 999px) {
  .row-layout {
    gap: var(--spacing-lg);
  }
  .card-visual-section {
    flex-basis: 170px;
    min-width: 110px;
  }
  .card-visual {
    width: 145px;
    height: 86px;
  }
  .chip {
    width: 22px;
    height: 14px;
    margin-bottom: var(--spacing-sm);
  }
  .brand {
    font-size: var(--font-size-xs);
    right: var(--spacing-sm);
    top: var(--spacing-sm);
  }
  .card-no {
    font-size: var(--font-size-base);
    margin-top: var(--spacing-xs);
  }
  .visual-label {
    font-size: var(--font-size-base);
    margin-top: var(--spacing-xs);
  }
  .info-label,
  .info-value,
  .info-badge,
  .footer-hint {
    font-size: var(--font-size-sm);
  }
  .card-info-section {
    gap: var(--spacing-md);
    padding-top: var(--spacing-xs);
  }
} */

/* 모바일 레이아웃 */
@media (max-width: 768px) {
  .row-layout {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
  .card-visual-section {
    align-items: center;
    margin-bottom: 0;
  }
  .card-visual {
    width: 100%;
    max-width: 280px;
    height: 160px;
    min-height: 120px;
  }
  .brand {
    font-size: var(--font-size-xs);
    right: var(--spacing-sm);
    top: var(--spacing-sm);
  }
  .chip {
    width: 20px;
    height: 12px;
    margin-bottom: var(--spacing-sm);
  }
  .card-no {
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }
  .visual-label {
    font-size: var(--font-size-base);
    margin-top: var(--spacing-xs);
  }
  .card-info-section {
    gap: var(--spacing-sm);
    align-items: flex-start;
    padding-top: 0;
    margin-top: var(--spacing-md);
  }
  .info-label,
  .info-value,
  .info-badge {
    font-size: var(--font-size-sm);
  }
  .footer-hint {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-md);
    margin-top: var(--spacing-xs);
  }
  .card-slide {
    padding: var(--spacing-lg) var(--spacing-md);
    min-height: 200px;
  }
}
</style>
