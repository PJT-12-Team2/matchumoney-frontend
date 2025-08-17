<template>
  <div class="login-container">
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <BaseCardGrey class="login-card">
      <template #content>
        <h1 class="login-title">회원가입</h1>

        <!-- 이메일 -->
        <div class="login-row">
          <div class="login-label">이메일</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="email" placeholder="이메일 입력" />
            <BaseButton class="action-btn" variant="primary" @click="handleSendCode">인증번호 전송</BaseButton>
          </div>
        </div>

        <!-- 인증번호 -->
        <div class="login-row">
          <div class="login-label">인증번호 입력</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="authCode" placeholder="인증번호 입력" />
            <BaseButton class="action-btn" variant="primary" @click="handleVerifyCode">인증번호 확인</BaseButton>
          </div>
        </div>

        <!-- 닉네임 -->
        <div class="login-row">
          <div class="login-label">닉네임</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="nickname" placeholder="닉네임 입력" />
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="login-row">
          <div class="login-label">비밀번호</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="password" type="password" placeholder="비밀번호 입력 (특수문자 포함 8~20자)" />
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="login-block">
          <div class="login-row">
            <div class="login-label">비밀번호 확인</div>
          </div>
          <div class="login-row">
            <div class="input-action-row">
              <BaseInput v-model="confirmPassword" type="password" placeholder="비밀번호 확인" />
            </div>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div class="login-row error-row">
          <span class="error-msg" :class="{ visible: !!errorMessage }">{{ errorMessage }}</span>
        </div>
        <div class="login-row">
          <div class="join-btn-area">
            <BaseButton variant="primary" @click="handleJoin" :disabled="!isEmailVerified">회원가입</BaseButton>
          </div>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseCardGrey from '@/components/base/BaseCardGrey.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import '@/assets/main.css';
import authApi from '@/api/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const authCode = ref('');
const password = ref('');
const confirmPassword = ref('');
const nickname = ref('');
const errorMessage = ref('');
const isEmailVerified = ref(false);
const router = useRouter();

watch([password, confirmPassword], ([newVal, confirmVal]) => {
  if (newVal && confirmVal && newVal !== confirmVal) {
    errorMessage.value = '비밀번호가 일치하지 않습니다';
  } else {
    errorMessage.value = '';
  }
});

const handleJoin = async () => {
  if (!isEmailVerified.value) {
    alert('이메일 인증을 완료해주세요.');
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다';
    return;
  }

  try {
    await authApi.signup({
      nickname: nickname.value,
      email: email.value,
      password: password.value,
      passwordCheck: confirmPassword.value,
    });

    alert('🎉 회원가입이 완료되었습니다. 로그인 해주세요.');
    router.push('/login');
  } catch (err) {
    alert(err?.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
  }
};

const handleSendCode = async () => {
  try {
    alert('📮 인증번호가 전송되었습니다. 이메일을 확인해주세요.');
    await authApi.sendVerificationEmail(email.value);
  } catch (err) {
    alert(err?.response?.data?.message || '인증번호 전송 중 오류가 발생했습니다.');
  }
};

const handleVerifyCode = async () => {
  try {
    const result = await authApi.verifyEmailCode(email.value, authCode.value);
    if (result.result) {
      isEmailVerified.value = true;
      alert('✅ 인증번호가 확인되었습니다.');
    } else {
      alert('❌ 인증번호가 일치하지 않습니다.');
    }
  } catch (err) {
    alert(err?.response?.data?.message || '인증번호 확인 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: var(--bg-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}
.login-logo img {
  height: 150px;
}

.login-card {
  width: 435px;
  height: 630px;
  padding: 1rem;
}

.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-dark);
}

.login-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: var(--spacing-sm);
}

.login-label {
  font-size: 0.9rem;
  color: var(--color-dark);
  margin-bottom: 0.3rem;
}

.input-action-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 1.5rem;
  width: 100%;
}

.action-btn {
  height: 40px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 120px;
}

.login-block .login-row .input-action-row {
  margin-bottom: 0;
}

.error-row {
  height: 1.2rem; /* 고정 높이로 줄 간격 유지 */
}

.error-msg {
  font-size: 0.9rem;
  color: var(--color-error-dark);
  visibility: hidden;
  display: block;
}

.error-msg.visible {
  visibility: visible;
}

.join-btn-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: var(--spacing-md);
}

.join-btn-area .base-button {
  width: 300px;
}

.login-btn:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    height: auto;
    padding: 2rem;
  }
  .login-logo img {
    height: 100px;
  }
  .login-title {
    font-size: 2rem;
  }
  .login-label {
    font-size: 1.2rem;
  }
  .input-action-row {
    flex-direction: column;
    width: 100%;
    margin-bottom: 1.5rem;
  }
  .action-btn {
    width: 50%;
    margin-top: 0.2rem;
    height: 30px;
    font-size: 1.2rem;
  }
  .join-btn-area .base-button {
    width: 50%;
    height: 30px;
    margin-top: -1.5rem;
    font-size: 1.2rem;
  }
  .signup-container {
    justify-content: center;
    padding-bottom: 100px;
  }
  .error-row {
    margin-top: 1rem;
    margin-bottom: 2rem;
  }
  .error-msg {
    font-size: 1.2rem;
  }

  /* Scoped deep styles for BaseInput on mobile */
  ::v-deep(.input-field) {
    font-size: 1.2rem;
    height: 48px;
    padding: 0.75rem;
  }
}
</style>
}
