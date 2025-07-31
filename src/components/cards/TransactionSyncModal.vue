<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>거래내역 동기화</h3>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
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

        <p class="description">
          카드 거래내역을 동기화합니다. 조회 기간은 최대 1년까지 가능합니다.
        </p>

        <form @submit.prevent="handleSync">
          <div class="form-group">
            <label for="cardNo">카드번호 (전체)</label>
            <input
              type="text"
              id="cardNo"
              v-model="formData.cardNo"
              placeholder="카드번호 16자리를 입력하세요"
              maxlength="16"
              required
            />
          </div>

          <div class="form-group">
            <label for="cardPw2">카드 비밀번호 (앞 2자리)</label>
            <input
              type="password"
              id="cardPw2"
              v-model="formData.cardPw2"
              placeholder="카드 비밀번호 앞 2자리"
              maxlength="2"
              required
            />
          </div>

          <div class="form-group">
            <label for="birthDate">생년월일 (8자리)</label>
            <input
              type="text"
              id="birthDate"
              v-model="formData.birthDate"
              placeholder="YYYYMMDD 형식으로 입력"
              maxlength="8"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">조회 시작일</label>
              <input
                type="date"
                id="startDate"
                v-model="formData.startDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="endDate">조회 종료일</label>
              <input
                type="date"
                id="endDate"
                v-model="formData.endDate"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              취소
            </button>
            <button type="submit" class="btn-sync" :disabled="isLoading">
              {{ isLoading ? "동기화 중..." : "동기화하기" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  cardInfo: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "sync"]);
const authStore = useAuthStore();

const isLoading = ref(false);
const formData = reactive({
  cardNo: "",
  cardPw2: "",
  birthDate: "",
  startDate: "",
  endDate: "",
});

const userId = computed(() => authStore.userId);

// 기본 날짜 설정 (최근 3개월)
const setDefaultDates = () => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  formData.endDate = today.toISOString().split("T")[0];
  formData.startDate = threeMonthsAgo.toISOString().split("T")[0];
};

// 카드 정보가 변경될 때 카드번호 자동 설정
watch(
  () => props.cardInfo,
  (newCardInfo) => {
    if (newCardInfo) {
      // maskedCardNo에서 원래 번호 추출 (실제로는 사용자가 입력해야 함)
      // 여기서는 입력 안내만 제공
      formData.cardNo = "";
    }
  },
  { immediate: true }
);

// 모달이 열릴 때 기본값 설정
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      setDefaultDates();
    }
  }
);

const getLastFourDigits = (cardNo) => {
  if (!cardNo) return "****";
  return cardNo.slice(-4);
};

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

const closeModal = () => {
  // 폼 초기화
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });
  emit("close");
};

const handleSync = async () => {
  isLoading.value = true;
  try {
    const syncData = {
      userId: parseInt(userId.value),
      cardNo: formData.cardNo,
      cardPw2: formData.cardPw2,
      birthDate: formData.birthDate,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    await emit("sync", syncData);
    closeModal();
  } catch (error) {
    console.error("거래내역 동기화 실패:", error);
  } finally {
    isLoading.value = false;
  }
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
  max-width: 600px;
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
  margin-bottom: var(--spacing-lg);
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

.description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
  font-size: var(--font-size-base);
  text-align: center;
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-accent);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-dark);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-secondary);
  border-radius: 12px;
  font-size: var(--font-size-base);
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: var(--color-white);
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-20);
  transform: translateY(-1px);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.btn-cancel,
.btn-sync {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: 12px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-cancel {
  background-color: var(--text-secondary);
  color: var(--color-white);
}

.btn-cancel:hover {
  background-color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-sync {
  background: var(--gradient-accent);
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.btn-sync::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.btn-sync:hover:not(:disabled) {
  background: var(--gradient-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.btn-sync:hover:not(:disabled)::before {
  left: 100%;
}

.btn-sync:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
