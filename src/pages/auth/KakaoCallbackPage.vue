<template>
  <div class="kakao-callback">
    <p>카카오 로그인 처리 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import authApi from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    alert("카카오 인가 코드가 없습니다.");
    router.push("/login");
    return;
  }

  try {
    const response = await authApi.kakaoLogin(code);
    const tokenDto = response.result;

    authStore.setAuth(tokenDto);
    alert("카카오 로그인 성공!");
    router.push("/");
  } catch (err) {
    console.error("카카오 로그인 실패:", err);
    alert("카카오 로그인에 실패했습니다.");
    router.push("/login");
  }
});
</script>

<style scoped>
.kakao-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--text-secondary);
  font-size: 1rem;
}
</style>
