<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>거래내역 동기화</h3>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          카드 거래내역을 동기화합니다. 조회 기간은 최소 한달 ~ 최대 1년까지
          가능합니다.
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
            <BaseButton variant="secondary" @click="closeModal" type="button">
              취소
            </BaseButton>
            <BaseButton variant="primary" type="submit" :disabled="isLoading">
              {{ isLoading ? "동기화 중..." : "동기화하기" }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import BaseButton from "../base/BaseButton.vue";

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

const closeModal = () => {
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
  background: var(--color-white);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
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

.description {
  color: var(--color-black);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
  font-size: var(--font-size-base);
  text-align: center;
  padding: var(--spacing-md);
  background: var(--color-primary-30);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
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
  border: 1px solid var(--color-gray-600);
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

/* --- 버튼 통일 스타일 --- */
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  gap: var(--spacing-xs);
}

.btn {
  flex: 1;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  border-radius: var(--spacing-xs);
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s, color 0.2s;
  margin: 0 var(--spacing-xs, 4px);
  min-width: 100px;
}

.btn.cancel {
  background-color: var(--color-primary);
  color: var(--color-dark);
  margin-right: var(--spacing-sm);
}

.btn.confirm {
  background-color: var(--color-dark);
  color: var(--color-white);
}

.btn.confirm:disabled {
  background-color: var(--color-gray-400);
  color: var(--color-white);
  cursor: not-allowed;
}
/* --- END 버튼 통일 스타일 --- */

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: var(--spacing-md);
  }
  .modal-header {
    padding: var(--spacing-md);
  }
  .modal-body {
    padding: var(--spacing-md);
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
</style>
