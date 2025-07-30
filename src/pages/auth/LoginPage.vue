<template>
  <div class="login-container">
    <!-- 상단 로고 영역 -->
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <!-- BaseCardGrey 적용 -->
    <BaseCardGrey class="login-card">
      <template #content>
        <h1 class="login-title">로그인</h1>

        <!-- 이메일 -->
        <div class="login-row">
          <BaseInput v-model="email" label="이메일" id="login-email" placeholder="이메일" />
        </div>

        <!-- 비밀번호 -->
        <div class="login-row">
          <BaseInput v-model="password" label="비밀번호" id="login-password" type="password" placeholder="비밀번호" />
        </div>

        <!-- 로그인 옵션 -->
        <div class="login-options">
          <label class="keep-login">
            <input type="checkbox" v-model="keepLogin" />
            로그인 상태 유지
          </label>
          <a class="reset-pw" href="/reset-password">비밀번호 찾기</a>
        </div>

        <!-- 일반 로그인 버튼 -->
        <button class="login-btn" @click="handleLogin">로그인</button>

        <!-- 구분선 -->
        <div class="sns-divider">
          <span>SNS 로그인</span>
        </div>

        <!-- 카카오 로그인 버튼 -->
        <button class="kakao-btn" @click="handleKakaoLogin">
          <img src="@/assets/kakao_login_medium_wide.png" alt="카카오계정으로 로그인" />
        </button>

        <!-- 회원가입 링크 -->
        <div class="signup-link">
          계정이 없으신가요?
          <a href="/signup">회원가입 하러가기</a>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BaseCardGrey from "@/components/base/BaseCardGrey.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import authApi from "@/api/auth"; // ✅ 새로 추가된 import

const email = ref("");
const password = ref("");
const keepLogin = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    // console.log("로그인 시도:", { email: email.value, password: password.value });
    const response = await authApi.login({
      email: email.value,
      password: password.value,
    });

    const tokenDto = response.result;

    authStore.setAuth(tokenDto);
    // console.log("AccessToken:", tokenDto.accessToken);
    // console.log("UserId:", tokenDto.userId);
    // console.log("Nickname:", tokenDto.nickname);

    alert(`${tokenDto.nickname}님 환영합니다!`);
    router.push("/");
  } catch (err) {
    // console.error("❌ 로그인 실패", err);
    alert("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
};

const handleKakaoLogin = () => {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&through_account=true`;
  window.location.href = kakaoLoginUrl;
};
</script>

<style scoped>
/* 컨테이너 */
.login-container {
  min-height: 100vh;
  background: var(--bg-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 5vh; /* 화면 높이의 5% */
}

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

/* BaseCardGrey 커스터마이징 */
.login-card {
  width: 435px;
  height: 600px;
  padding: 3rem;
}

/* 제목 */
.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

/* 입력 행 */
.login-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}
.login-label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: var(--color-dark);
}
.login-input {
  height: 44px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  color: var(--text-primary);
  background: var(--color-white);
}

/* 옵션 행 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 1.8rem;
  color: var(--text-secondary);
}
.keep-login {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.reset-pw {
  color: var(--text-link);
  text-decoration: none;
}
.reset-pw:hover {
  color: var(--text-link-hover);
}

/* 로그인 버튼 */
.login-btn {
  width: 335px;
  height: 50px;
  background: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* SNS 로그인 구분선 */
.sns-divider {
  position: relative;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.2rem;
}
.sns-divider::before,
.sns-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--border-light);
}
.sns-divider::before {
  left: 0;
}
.sns-divider::after {
  right: 0;
}

/* 카카오 로그인 버튼 */
.kakao-btn {
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 2rem;
  width: 360px; /* 원하는 고정 px 값 */
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.kakao-btn img {
  width: 100%;
  height: 50px;
  object-fit: contain;
  display: block;
}

/* 회원가입 링크 */
.signup-link {
  font-size: 0.85rem;
  text-align: center;
  color: var(--text-secondary);
}
.signup-link a {
  color: var(--text-link);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2rem;
}
.signup-link a:hover {
  color: var(--text-link-hover);
}
</style>
