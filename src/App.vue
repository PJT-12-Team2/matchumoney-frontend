<!-- App.vue -->
<script setup>
import { useRoute } from "vue-router";
import DefaultLayout from "@/components/layouts/DefaultLayout.vue";

// 현재 라우트를 가져오기
const route = useRoute();
</script>

<template>
  <!-- 로그인 페이지가 아닐 때만 기본 레이아웃 적용 -->
  <DefaultLayout v-if="route.path !== '/login'">
    <RouterView />
  </DefaultLayout>

  <!-- 로그인 페이지일 때는 레이아웃 없이 바로 렌더 -->
  <RouterView v-else />
</template>

<style scoped></style>
