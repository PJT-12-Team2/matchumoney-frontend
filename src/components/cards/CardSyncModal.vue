<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>KB카드 연동</h3>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          KB카드 마이데이터를 연동하여 카드 정보를 가져옵니다.
        </p>

        <form @submit.prevent="handleSync">
          <div class="form-group">
            <label for="cardId">KB카드 ID</label>
            <input
              type="text"
              id="cardId"
              v-model="formData.cardId"
              placeholder="카드 ID를 입력하세요"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="cardPw">KB카드 비밀번호</label>
            <input
              type="password"
              id="cardPw"
              v-model="formData.cardPw"
              placeholder="카드 비밀번호를 입력하세요"
              required
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <BaseButton variant="secondary" @click="closeModal" type="button">
              취소
            </BaseButton>
            <BaseButton variant="primary" type="submit" :disabled="isLoading">
              {{ isLoading ? "연결 중..." : "연결하기" }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "sync"]);

const isLoading = ref(false);
const formData = reactive({
  cardId: "",
  cardPw: "",
});

const closeModal = () => {
  formData.cardId = "";
  formData.cardPw = "";
  emit("close");
};

const handleSync = async () => {
  isLoading.value = true;
  try {
    await emit("sync", { ...formData });
    closeModal();
  } catch (error) {
    console.error("카드 연동 실패:", error);
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
  background-color: var(--color-overlay-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--color-white);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-modal);
  padding: var(--spacing-xl) var(--spacing-lg);
  width: 50%;
  max-width: 600px;
  text-align: center;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--color-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-header h3::before {
  content: "💳";
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-xs);
}

.btn-close {
  background: var(--color-gray-100);
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-title);
  cursor: pointer;
  padding: var(--spacing-xs);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-close:hover {
  background: var(--color-error-light);
  color: var(--color-error);
  transform: scale(1.1);
}

.modal-body {
  padding: 0;
}

.description {
  color: var(--color-title);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  font-size: var(--font-size-base);
  background: var(--color-primary-30);
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  border-left: 4px solid var(--color-primary);
  text-align: left;
}

.form-group {
  text-align: left;
  margin-bottom: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
  display: block;
  color: var(--color-title);
  font-weight: 500;
}

.form-input {
  border-radius: var(--spacing-sm) !important;
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-title);
  font-size: var(--font-size-base);
  box-sizing: border-box;
  background: var(--color-white);
  font-family: inherit;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-10, #e3f0fc);
}

.form-input::placeholder {
  color: var(--color-gray-400);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  gap: var(--spacing-sm);
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

@media (max-width: 640px) {
  .modal-content {
    width: 80%;
    max-width: 400px;
    padding: var(--spacing-lg) var(--spacing-md);
  }
  .modal-header {
    margin-bottom: var(--spacing-md);
  }
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
