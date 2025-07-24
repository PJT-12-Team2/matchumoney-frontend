<template>
  <div class="login-container">
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <div class="login-card">
      <h1 class="login-title">로그인</h1>

      <div class="login-row">
        <label class="login-label">이메일</label>
        <input v-model="email" type="text" class="login-input" placeholder="이메일" />
      </div>

      <div class="login-row">
        <label class="login-label">비밀번호</label>
        <input v-model="password" type="password" class="login-input" placeholder="비밀번호" />
      </div>

      <div class="login-options">
        <label class="keep-login">
          <input type="checkbox" v-model="keepLogin" />
          로그인 상태 유지
        </label>
        <a class="find-pw" href="/find-password">비밀번호 찾기</a>
      </div>

      <button class="login-btn" @click="handleLogin">로그인</button>

      <div class="sns-divider">
        <span>SNS 로그인</span>
      </div>

      <button class="kakao-btn">
        <img src="@/assets/kakao_login_medium_wide.png" alt="카카오계정으로 로그인" />
      </button>

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
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}
.login-logo img {
  height: 100px;
}

.login-card {
  width: 435px; /* 좌우로 넓게 */
  padding: 3rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.login-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}
.login-label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #333;
}
.login-input {
  height: 44px;
  padding: 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 1.8rem;
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

.login-btn {
  width: 100%;
  height: 50px;
  background: #4d7a4d;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
}

.sns-divider {
  position: relative;
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 1.2rem;
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

.kakao-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 2rem;
}
.kakao-btn img {
  width: 100%;
  height: 50px; /* 로그인 버튼 높이와 동일하게 */
  object-fit: contain; /* 비율 유지하면서 맞추기 */
  display: block;
}

.signup-link {
  font-size: 0.85rem;
  text-align: center;
}
.signup-link a {
  color: #4d7a4d;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2rem;
}
</style>
