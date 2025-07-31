<template>
  <div class="card-item">
    <div class="card-row-layout">
      <!-- 카드 실물+상태 (좌측) -->
      <div class="card-visual-box">
        <div class="visual-card">
          <div class="visual-chip"></div>
          <div class="visual-number">
            **** **** **** {{ getLastFourDigits(card.cardNo) }}
          </div>
          <div class="visual-validity" v-if="card.validTerm">
            {{ formatValidityDate(card.validTerm) }}
          </div>
        </div>
        <div class="visual-bottom">
          <span class="card-name">{{ card.cardName || "카드명 없음" }}</span>
          <span class="card-status" :class="getStatusClass(card.cardStatus)">
            {{ getStatusText(card.cardStatus) }}
          </span>
        </div>
      </div>

      <!-- 카드 상세정보/액션 (우측) -->
      <div class="card-info-box">
        <div class="card-info-group">
          <span class="info-label">카드번호</span>
          <span class="info-value"
            >**** **** **** {{ getLastFourDigits(card.cardNo) }}</span
          >
        </div>
        <div class="card-info-group" v-if="card.validTerm">
          <span class="info-label">유효기간</span>
          <span class="info-value">{{
            formatValidityDate(card.validTerm)
          }}</span>
        </div>
        <div class="card-actions">
          <button
            class="btn btn-transactions"
            @click="$emit('viewTransactions', card.holdingId)"
            :disabled="card.cardStatus !== '1'"
          >
            거래내역 보기
          </button>
          <button
            class="btn btn-sync"
            @click="$emit('syncTransactions', card.holdingId)"
            :disabled="card.cardStatus !== '1'"
          >
            거래내역 동기화
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    required: true,
  },
});

defineEmits(["viewTransactions", "syncTransactions"]);

const getLastFourDigits = (cardNo) => {
  if (!cardNo) return "****";
  return cardNo.slice(-4);
};

const formatValidityDate = (validTerm) => {
  if (!validTerm || validTerm.length !== 4) return validTerm;
  return `${validTerm.slice(0, 2)}/${validTerm.slice(2, 4)}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "1":
      return "status-active";
    case "2":
      return "status-suspended";
    case "3":
      return "status-cancelled";
    default:
      return "status-unknown";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "1":
      return "정상";
    case "2":
      return "정지";
    case "3":
      return "해지";
    default:
      return "알 수 없음";
  }
};
</script>

<style scoped>
.card-item {
  background: #fff;
  border: 1.5px solid #e7eaf3;
  border-radius: 13px;
  padding: 23px 20px 19px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 14px rgba(60, 90, 130, 0.08);
  width: 100%;
  max-width: 580px;
  transition: box-shadow 0.18s;
}
.card-item:hover {
  box-shadow: 0 6px 24px rgba(55, 110, 255, 0.11);
}

.card-row-layout {
  display: flex;
  flex-direction: row;
  gap: 34px;
  align-items: stretch;
}

.card-visual-box {
  flex: 0 0 165px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  justify-content: flex-start;
}
.visual-card {
  width: 148px;
  height: 94px;
  background: linear-gradient(135deg, #b1bff6 0%, #e0c3fc 100%);
  border-radius: 10px;
  box-shadow: 0 1px 7px rgba(80, 120, 255, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 13px 13px 10px 17px;
  margin-bottom: 9px;
  position: relative;
}
.visual-chip {
  width: 23px;
  height: 13px;
  border-radius: 2px;
  background: linear-gradient(90deg, #fbe18a 20%, #e3a857 80%);
  margin-bottom: 18px;
}
.visual-number {
  font-family: "Roboto Mono", monospace;
  font-size: 1.07rem;
  color: #273c75;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.visual-validity {
  font-size: 0.89rem;
  color: #7367f0;
  font-weight: 500;
}
.visual-bottom {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 3px;
}
.card-name {
  font-size: 1.07rem;
  font-weight: 600;
  color: #323d55;
  letter-spacing: 0.3px;
}
.card-status {
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-left: 2px;
}
.status-active {
  background: #eaf7ed;
  color: #19ae63;
}
.status-suspended {
  background: #fff8e3;
  color: #eab308;
}
.status-cancelled {
  background: #fde8e8;
  color: #e53e3e;
}
.status-unknown {
  background: #ececec;
  color: #6c757d;
}

.card-info-box {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 13px;
  align-items: flex-start;
}
.card-info-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
}
.info-label {
  color: #425466;
  font-weight: 500;
  min-width: 65px;
}
.info-value {
  color: #192a56;
  font-weight: 600;
  font-family: "Roboto Mono", monospace;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 5px;
}
.btn {
  padding: 8px 16px;
  border: 1.2px solid #007bff;
  background-color: #f8fbff;
  color: #007bff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.18s;
  min-width: 90px;
  outline: none;
}
.btn-transactions:hover:not(:disabled),
.btn-sync:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}
.btn:disabled {
  opacity: 0.54;
  cursor: not-allowed;
}
.btn-sync {
  border-color: #19ae63;
  color: #19ae63;
  background-color: #f8fff9;
}
.btn-sync:hover:not(:disabled) {
  background-color: #19ae63;
  color: white;
}

/* 태블릿 대응 (700px~999px) */
@media (max-width: 999px) {
  .card-row-layout {
    gap: 16px;
  }
  .card-visual-box {
    flex-basis: 120px;
    min-width: 80px;
  }
  .visual-card {
    width: 92px;
    height: 60px;
    padding: 8px 7px 7px 10px;
  }
  .visual-chip {
    width: 13px;
    height: 7px;
    margin-bottom: 10px;
  }
  .visual-number {
    font-size: 0.96rem;
  }
  .visual-validity {
    font-size: 0.81rem;
  }
  .visual-bottom {
    gap: 5px;
  }
  .card-name {
    font-size: 0.97rem;
  }
  .card-status {
    font-size: 0.9rem;
  }
  .info-label,
  .info-value,
  .btn {
    font-size: 0.96rem;
  }
}

/* 모바일 대응 (699px 이하) */
@media (max-width: 699px) {
  .card-item {
    padding: 14px 7px 10px 7px;
  }
  .card-row-layout {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  .card-visual-box {
    align-items: center;
  }
  .visual-card {
    width: 94vw;
    min-width: 78px;
    max-width: 99vw;
    height: 49vw;
    min-height: 46px;
  }
  .visual-bottom {
    gap: 4px;
  }
  .card-name {
    font-size: 0.93rem;
  }
  .card-status {
    font-size: 0.89rem;
  }
  .info-label,
  .info-value,
  .btn {
    font-size: 0.93rem;
    min-width: 70px;
  }
  .btn {
    padding: 7px 8px;
  }
}
</style>
