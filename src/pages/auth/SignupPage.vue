<template>
  <div class="container mt-5">
    <BaseCard class="rounded-xl">
      <template #title>회원가입</template>

      <template #content>
        <div class="form-row">
          <label class="form-label">이메일</label>
          <div class="right-area">
            <input v-model="email" class="form-input full" placeholder="이메일" />
            <BaseButton class="action-btn" variant="primary">인증번호 발송</BaseButton>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">인증번호 입력</label>
          <div class="right-area">
            <input v-model="authCode" class="form-input short" placeholder="인증번호 입력" />
            <BaseButton class="action-btn" variant="primary">인증번호 확인</BaseButton>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">비밀번호</label>
          <div class="right-area">
            <input
              v-model="password"
              type="password"
              class="form-input full"
              placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8~20자)" />
          </div>
        </div>

        <div class="form-row confirm-row">
          <label for="confirmPw" class="form-label">비밀번호 확인</label>
          <div class="confirm-area">
            <input
              id="confirmPw"
              v-model="confirmPassword"
              type="password"
              class="form-input full"
              placeholder="비밀번호 재입력" />
          </div>
        </div>
        <p class="error-msg" :class="{ visible: errorMessage }">
          {{ errorMessage || "‎" }}
        </p>

        <div class="form-row join-row">
          <div class="join-btn-area">
            <BaseButton variant="primary" @click="handleJoin">회원가입 완료</BaseButton>
          </div>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseCard from "@/components/base/BaseCardGrey.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import "@/assets/main.css";

const email = ref("");
const authCode = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

watch([password, confirmPassword], ([newVal, confirmVal]) => {
  if (newVal && confirmVal && newVal !== confirmVal) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
  } else {
    errorMessage.value = "";
  }
});

const handleJoin = () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
    return;
  }
  errorMessage.value = "";
};
</script>

<style scoped>
::v-deep(.base-card .title) {
  margin-bottom: 3rem !important;
  display: block;
  text-align: center;
}

::v-deep(.base-card) {
  padding: 4rem 4rem 2rem 4rem !important;
}

.container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.base-card {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.form-label {
  width: 120px;
  font-weight: 500;
  color: var(--color-title);
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.right-area {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 700px;
  gap: 0.5rem;
  box-sizing: border-box;
  justify-content: flex-start;
  margin-left: 0;
}

.right-area input.form-input.short {
  width: 350px;
  box-sizing: border-box;
  min-width: 0;
}

.form-input {
  height: 40px;
  padding: 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-input.full {
  width: 350px;
  box-sizing: border-box;
}

.action-btn {
  height: 40px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 160px;
  box-sizing: border-box;
}

.join-btn-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2rem;
}

.join-btn-area .base-button {
  width: 300px;
  box-sizing: border-box;
}

.error-msg {
  width: 100%;
  max-width: 700px;
  margin-left: 100px;
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: red;
  min-height: 1.2rem;
  visibility: hidden;
}
.error-msg.visible {
  visibility: visible;
}

.confirm-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  justify-content: flex-start;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
}
.confirm-area {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 700px;
  gap: 0.5rem;
  box-sizing: border-box;
  margin-left: 0;
}
</style>
