<template>
  <div class="signup-container">
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <BaseCardGrey class="signup-card">
      <template #title>회원가입</template>

      <template #content>
        <div class="form-wrapper">
          <!-- 이메일 -->
          <div class="form-row">
            <label class="form-label">이메일</label>
            <div class="right-area">
              <BaseInput v-model="email" placeholder="이메일" />
              <BaseButton class="action-btn" variant="primary" @click="handleSendCode">인증번호 전송</BaseButton>
            </div>
          </div>

          <!-- 인증번호 -->
          <div class="form-row">
            <label class="form-label">인증번호 입력</label>
            <div class="right-area">
              <BaseInput v-model="authCode" placeholder="인증번호 입력" />
              <BaseButton class="action-btn" variant="primary" @click="handleVerifyCode">인증번호 확인</BaseButton>
            </div>
          </div>

          <!-- 닉네임 -->
          <div class="form-row">
            <label class="form-label">닉네임</label>
            <div class="right-area">
              <BaseInput v-model="nickname" placeholder="닉네임 입력" />
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
          <div class="form-row error-row">
            <div class="form-label"></div>
            <div class="right-area">
              <p class="error-msg" :class="{ visible: errorMessage }">
                {{ errorMessage || "‎" }}
              </p>
            </div>
          </div>

          <!-- 회원가입 버튼 -->
          <div class="form-row">
            <div class="join-btn-area">
              <BaseButton variant="primary" @click="handleJoin" :disabled="!isEmailVerified">회원가입 완료</BaseButton>
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
import authApi from "@/api/auth";
import { useRouter } from "vue-router";

const email = ref("");
const authCode = ref("");
const password = ref("");
const confirmPassword = ref("");
const nickname = ref("");
const errorMessage = ref("");
const isEmailVerified = ref(false);
const router = useRouter();

watch([password, confirmPassword], ([newVal, confirmVal]) => {
  if (newVal && confirmVal && newVal !== confirmVal) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
  } else {
    errorMessage.value = "";
  }
});

const handleJoin = async () => {
  if (!isEmailVerified.value) {
    alert("이메일 인증을 완료해주세요.");
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
    return;
  }

  try {
    await authApi.signup({
      nickname: nickname.value,
      email: email.value,
      password: password.value,
      passwordCheck: confirmPassword.value,
    });

    alert("🎉 회원가입이 완료되었습니다. 로그인 해주세요.");
    router.push("/login");
  } catch (err) {
    alert(err?.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
  }
};

const handleSendCode = async () => {
  try {
    await authApi.sendVerificationEmail(email.value);
    alert("📮 인증번호가 전송되었습니다. 이메일을 확인해주세요.");
  } catch (err) {
    alert(err?.response?.data?.message || "인증번호 전송 중 오류가 발생했습니다.");
  }
};

const handleVerifyCode = async () => {
  try {
    const result = await authApi.verifyEmailCode(email.value, authCode.value);
    if (result) {
      isEmailVerified.value = true;
      alert("✅ 인증번호가 확인되었습니다.");
    } else {
      alert("❌ 인증번호가 일치하지 않습니다.");
    }
  } catch (err) {
    alert(err?.response?.data?.message || "인증번호 확인 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
/* 로고 영역 */
.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}
.login-logo img {
  height: 150px;
}

.signup-card {
  width: 700px;
  max-width: 100%;
  padding: 3rem !important;
}

.form-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

::v-deep(.base-card .title) {
  margin-bottom: var(--spacing-xl) !important;
  display: block;
  text-align: center;
  color: var(--color-title);
}

.signup-container {
  min-height: 100vh;
  background: var(--bg-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 5vh;
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

.right-area-with-error {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.3rem; /* 인풋과 에러 메시지 간격 */
}

.error-msg {
  font-size: 0.9rem;
  color: var(--color-error-dark);
  visibility: hidden;
  min-height: 1.2rem;
}

.error-msg.visible {
  visibility: visible;
}

.action-btn {
  height: 40px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 160px;
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

.error-row {
  margin-top: -1rem;
  margin-bottom: var(--spacing-lg);
}
</style>
