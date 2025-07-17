<template>
  <nav class="navbar py-1" :style="{ backgroundColor: '#445C3C' }">
    <div class="container d-flex justify-content-between align-items-center">
      <!-- 홈 버튼 -->
      <RouterLink to="/" class="d-flex align-items-center gap-1 text-decoration-none">
        <img src="@/assets/Logo.png" alt="로고" style="height: 100px;" />
        <span class="navbar-brand mb-0 h1 text-white">맞추머니</span>
      </RouterLink>

      <!-- ✅ 데스크탑 전용 메뉴 -->
      <div class="d-none d-md-flex align-items-center gap-5">
        <RouterLink to="/" class="text-white text-decoration-none fs-6">Home</RouterLink>
        <RouterLink to="/category" class="text-white text-decoration-none fs-6">Category</RouterLink>
        <RouterLink to="/history" class="text-white text-decoration-none fs-6">History</RouterLink>
        <RouterLink to="/education" class="text-white text-decoration-none fs-6">Education</RouterLink>
        <RouterLink to="/notifications" class="text-white fs-4 text-decoration-none">알림</RouterLink>
        <RouterLink to="/profile" class="fs-4 text-decoration-none">프로필</RouterLink>
      </div>

      <!-- ✅ 모바일 전용 햄버거 버튼 -->
      <button class="btn text-white fs-4 ms-3 d-md-none" @click="showMenu = true">☰</button>
    </div>
    <SideMenu :visible="showMenu" @close="showMenu = false" />
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import SideMenu from '@/components/SideMenu.vue'

const showMenu = ref(false)
</script>
