<template>
  <div class="container mt-5">
    <BaseCardGrey class="rounded-xl signup-card">
      <template #title>회원가입</template>

      <template #content>
        <div class="form-wrapper">
          <!-- 이메일 -->
          <div class="form-row">
            <label class="form-label">이메일</label>
            <div class="right-area">
              <BaseInput v-model="email" placeholder="이메일" />
              <BaseButton class="action-btn" variant="primary">인증번호 발송</BaseButton>
            </div>
          </div>

          <!-- 인증번호 -->
          <div class="form-row">
            <label class="form-label">인증번호 입력</label>
            <div class="right-area">
              <BaseInput v-model="authCode" placeholder="인증번호 입력" />
              <BaseButton class="action-btn" variant="primary">인증번호 확인</BaseButton>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="form-row">
            <label class="form-label">비밀번호</label>
            <div class="right-area">
              <BaseInput v-model="password" type="password" placeholder="비밀번호 입력 (특수문자 포함 8~20자)" />
            </div>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="form-row">
            <label class="form-label">비밀번호 확인</label>
            <div class="right-area">
              <BaseInput v-model="confirmPassword" type="password" placeholder="비밀번호 재입력" />
            </div>
          </div>

          <!-- 에러 메시지 -->
          <p class="error-msg" :class="{ visible: errorMessage }">
            {{ errorMessage || "‎" }}
          </p>

          <!-- 회원가입 버튼 -->
          <div class="form-row join-row">
            <div class="join-btn-area">
              <BaseButton variant="primary" @click="handleJoin">회원가입 완료</BaseButton>
            </div>
          </div>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseCardGrey from "@/components/base/BaseCardGrey.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
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
  // TODO: 회원가입 로직
};
</script>

<style scoped>
.signup-card {
  background-color: var(--color-light);
  box-shadow: var(--shadow-card);
  width: 900px;
  max-width: 90%;
  margin: 0 auto;
  padding: 3rem 7rem !important; /* increased padding for more inner spacing */
}

.form-wrapper {
  max-width: 700px;
  margin: 0 auto; /* 가운데 정렬 */
}

::v-deep(.base-card .title) {
  margin-bottom: var(--spacing-xl) !important;
  display: block;
  text-align: center;
  color: var(--color-title);
}

.container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: var(--spacing-lg);
}

.form-label {
  width: 120px;
  font-weight: 500;
  color: var(--color-dark);
}

.right-area {
  display: flex;
  align-items: center;
  width: 100%;
  gap: var(--spacing-sm);
}

.action-btn {
  height: 40px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 160px;
}

.error-msg {
  width: 100%;
  margin-left: 120px;
  margin-top: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--color-error-dark);
  min-height: 1.2rem;
  visibility: hidden;
}
.error-msg.visible {
  visibility: visible;
}

.join-btn-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: var(--spacing-lg);
}
.join-btn-area .base-button {
  width: 300px;
}
</style>
