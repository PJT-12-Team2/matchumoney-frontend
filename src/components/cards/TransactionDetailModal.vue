<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>거래내역 상세보기</h3>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <!-- 카드 정보 -->
        <div class="card-info" v-if="cardInfo">
          <div
            class="card-mini"
            :style="{ background: getCardGradient(cardInfo.cardName) }"
          >
            <div class="card-mini-content">
              <h4>{{ cardInfo.cardName }}</h4>
              <p>{{ cardInfo.maskedCardNo || "**** **** **** ****" }}</p>
            </div>
          </div>
        </div>

        <!-- 거래내역 통계 -->
        <div class="transaction-stats">
          <div class="stat-item">
            <span class="stat-label">총 거래건수</span>
            <span class="stat-value">{{ transactions.length }}건</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">총 거래금액</span>
            <span class="stat-value">{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">평균 거래금액</span>
            <span class="stat-value">{{ formatCurrency(averageAmount) }}</span>
          </div>
        </div>

        <!-- 거래내역 목록 -->
        <div class="transaction-list">
          <h4>거래내역</h4>
          <div class="transaction-scroll">
            <div
              v-for="transaction in sortedTransactions"
              :key="
                transaction.id ||
                transaction.transactionDate + transaction.merchantName
              "
              class="transaction-item"
            >
              <div class="transaction-info">
                <div class="transaction-merchant">
                  {{
                    transaction.merchantName ||
                    transaction.description ||
                    "거래처 정보 없음"
                  }}
                </div>
                <div class="transaction-date">
                  {{ formatDate(transaction.transactionDate) }}
                </div>
                <div class="transaction-category" v-if="transaction.category">
                  {{ transaction.category }}
                </div>
              </div>
              <div
                class="transaction-amount"
                :class="getAmountClass(transaction.amount)"
              >
                {{ formatCurrency(transaction.amount) }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-close-modal" @click="closeModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  transactions: {
    type: Array,
    default: () => [],
  },
  cardInfo: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

// 거래내역을 날짜순으로 정렬 (최신순)
const sortedTransactions = computed(() => {
  return [...props.transactions].sort((a, b) => {
    const dateA = new Date(a.transactionDate);
    const dateB = new Date(b.transactionDate);
    return dateB - dateA;
  });
});

// 총 거래금액
const totalAmount = computed(() => {
  return props.transactions.reduce((sum, transaction) => {
    const amount = Math.abs(parseFloat(transaction.amount) || 0);
    return sum + amount;
  }, 0);
});

// 평균 거래금액
const averageAmount = computed(() => {
  if (props.transactions.length === 0) return 0;
  return totalAmount.value / props.transactions.length;
});

const getCardGradient = (cardName) => {
  const name = cardName?.toLowerCase() || "";

  if (name.includes("신한")) {
    return "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
  } else if (name.includes("kb") || name.includes("국민")) {
    return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
  } else if (name.includes("하나")) {
    return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
  } else if (name.includes("우리")) {
    return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
  } else if (name.includes("삼성")) {
    return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
  } else {
    return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // YYYYMMDD 형식인 경우
      if (dateString.length === 8) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${year}.${month}.${day}`;
      }
      return dateString;
    }

    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".")
      .replace(/ /g, "");
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  const numAmount = Math.abs(parseFloat(amount) || 0);
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(numAmount);
};

const getAmountClass = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return numAmount >= 0 ? "amount-positive" : "amount-negative";
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-modal-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-light);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.card-info {
  margin-bottom: var(--spacing-xl);
}

.card-mini {
  padding: var(--spacing-lg);
  border-radius: 12px;
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.card-mini::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-glass);
  backdrop-filter: blur(10px);
}

.card-mini-content {
  position: relative;
  z-index: 2;
}

.card-mini h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
}

.card-mini p {
  margin: 0;
  font-family: "Courier New", monospace;
  font-size: var(--font-size-base);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  letter-spacing: 1px;
  opacity: 0.95;
}

.transaction-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  background: var(--color-gray-50);
  padding: var(--spacing-lg);
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-accent);
}

.transaction-list h4 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.transaction-scroll {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  background: var(--color-white);
  transition: background-color 0.2s ease;
}

.transaction-item:hover {
  background: var(--bg-hover);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  flex: 1;
}

.transaction-merchant {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.transaction-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.transaction-category {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  background: var(--color-accent-10);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.transaction-amount {
  font-weight: 700;
  font-size: var(--font-size-lg);
  text-align: right;
}

.amount-positive {
  color: var(--color-success);
}

.amount-negative {
  color: var(--color-error);
}

.modal-actions {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.btn-close-modal {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--text-secondary);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-close-modal:hover {
  background: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .transaction-stats {
    grid-template-columns: 1fr;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .transaction-amount {
    align-self: flex-end;
  }
}
</style>
