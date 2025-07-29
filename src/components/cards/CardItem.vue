<template>
  <div class="card-item">
    <div class="card-header">
      <h3 class="card-name">{{ card.cardName }}</h3>
      <span class="card-status" :class="getStatusClass(card.cardStatus)">
        {{ getStatusText(card.cardStatus) }}
      </span>
    </div>
    
    <div class="card-info">
      <div class="card-number">
        **** **** **** {{ getLastFourDigits(card.cardNo) }}
      </div>
      <div class="card-validity" v-if="card.validTerm">
        유효기간: {{ formatValidityDate(card.validTerm) }}
      </div>
    </div>

    <div class="card-actions">
      <button 
        class="btn-transactions" 
        @click="$emit('viewTransactions', card.holdingId)"
        :disabled="card.cardStatus !== '1'"
      >
        거래내역 보기
      </button>
      <button 
        class="btn-sync" 
        @click="$emit('syncTransactions', card.holdingId)"
        :disabled="card.cardStatus !== '1'"
      >
        거래내역 동기화
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    required: true
  }
});

defineEmits(['viewTransactions', 'syncTransactions']);

const getLastFourDigits = (cardNo) => {
  if (!cardNo) return '****';
  return cardNo.slice(-4);
};

const formatValidityDate = (validTerm) => {
  if (!validTerm || validTerm.length !== 4) return validTerm;
  return `${validTerm.slice(0, 2)}/${validTerm.slice(2, 4)}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case '1': return 'status-active';
    case '2': return 'status-suspended';
    case '3': return 'status-cancelled';
    default: return 'status-unknown';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case '1': return '정상';
    case '2': return '정지';
    case '3': return '해지';
    default: return '알 수 없음';
  }
};
</script>

<style scoped>
.card-item {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.card-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-suspended {
  background-color: #fff3cd;
  color: #856404;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.card-info {
  margin-bottom: 16px;
}

.card-number {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.card-validity {
  font-size: 14px;
  color: #6c757d;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-transactions,
.btn-sync {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-transactions:hover:not(:disabled),
.btn-sync:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.btn-transactions:disabled,
.btn-sync:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sync {
  border-color: #28a745;
  color: #28a745;
}

.btn-sync:hover:not(:disabled) {
  background-color: #28a745;
  color: white;
}
</style>