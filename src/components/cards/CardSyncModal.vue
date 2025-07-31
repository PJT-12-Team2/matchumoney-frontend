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
            <label for="cardId">카드 ID</label>
            <input
              type="text"
              id="cardId"
              v-model="formData.cardId"
              placeholder="카드 ID를 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="cardPw">카드 비밀번호</label>
            <input
              type="password"
              id="cardPw"
              v-model="formData.cardPw"
              placeholder="카드 비밀번호를 입력하세요"
              required
            />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              취소
            </button>
            <button type="submit" class="btn-sync" :disabled="isLoading">
              {{ isLoading ? "연동 중..." : "연동하기" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.description {
  color: #6c757d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel,
.btn-sync {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-sync {
  background-color: #007bff;
  color: white;
}

.btn-sync:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-sync:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
