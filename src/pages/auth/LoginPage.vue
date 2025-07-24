<template>
  <div class="login-container">
    <!-- 로고 -->
    <div class="login-logo">
      <img src="@/assets/logo.png" alt="맞추머니 로고" />
    </div>

    <!-- 로그인 카드 -->
    <div class="login-card">
      <h1 class="login-title">로그인</h1>

      <!-- 이메일 -->
      <div class="login-row">
        <label class="login-label">이메일</label>
        <input v-model="email" type="text" class="login-input" placeholder="이메일" />
      </div>

      <!-- 비밀번호 -->
      <div class="login-row">
        <label class="login-label">비밀번호</label>
        <input v-model="password" type="password" class="login-input" placeholder="비밀번호" />
      </div>

      <!-- 상태 유지 & 비밀번호 찾기 -->
      <div class="login-options">
        <label class="keep-login">
          <input type="checkbox" v-model="keepLogin" />
          로그인 상태 유지
        </label>
        <a class="find-pw" href="/find-password">비밀번호 찾기</a>
      </div>

      <!-- 로그인 버튼 -->
      <button class="login-btn" @click="handleLogin">로그인</button>

      <!-- SNS 로그인 구분선 -->
      <div class="sns-divider">
        <span>SNS 로그인</span>
      </div>

      <!-- 카카오 로그인 -->
      <button class="kakao-btn">
        <span class="kakao-icon">💬</span>
        카카오계정으로 로그인
      </button>

      <!-- 회원가입 링크 -->
      <div class="signup-link">
        계정이 없으신가요?
        <a href="/signup">회원가입 하러가기</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");
const keepLogin = ref(false);

const handleLogin = () => {
  console.log("로그인 시도", { email: email.value, password: password.value, keepLogin: keepLogin.value });
  // TODO: 실제 로그인 로직
};
</script>

<style scoped>
/* 컨테이너 */
.login-container {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 로고 */
.login-logo img {
  height: 50px;
  margin-bottom: 2rem;
}

/* 카드 */
.login-card {
  width: 360px;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  background: #fff;
}

/* 타이틀 */
.login-title {
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

/* 입력 행 */
.login-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}
.login-label {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  color: #333;
}
.login-input {
  height: 40px;
  padding: 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 옵션 영역 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}
.keep-login {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.find-pw {
  color: #4d7a4d;
  text-decoration: none;
}

/* 로그인 버튼 */
.login-btn {
  width: 100%;
  height: 44px;
  background: #4d7a4d;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

/* 구분선 */
.sns-divider {
  position: relative;
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 1rem;
}
.sns-divider::before,
.sns-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #eee;
}
.sns-divider::before {
  left: 0;
}
.sns-divider::after {
  right: 0;
}

/* 카카오 버튼 */
.kakao-btn {
  width: 100%;
  height: 44px;
  background: #ffe812;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.kakao-icon {
  margin-right: 0.4rem;
}

/* 회원가입 */
.signup-link {
  font-size: 0.8rem;
  text-align: center;
}
.signup-link a {
  color: #4d7a4d;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2rem;
}
</style>
