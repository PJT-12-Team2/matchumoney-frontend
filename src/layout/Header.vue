<template>
    <nav class="navbar py-4" :style="{ backgroundColor: '#445C3C' }">
      <div class="container d-flex justify-content-between align-items-center">
        <!-- 홈 버튼 -->
        <RouterLink to="/" class="d-flex align-items-center gap-3 text-decoration-none">
          <span class="fs-3 text-white">로고</span>
          <span class="navbar-brand mb-0 h1 text-white">맞추머니</span>
        </RouterLink>
  
        <!-- 우측 메뉴 -->
        <div class="d-flex align-items-center gap-5">
          <RouterLink to="/" class="text-white text-decoration-none fs-6">Home</RouterLink>
          <RouterLink to="/category" class="text-white text-decoration-none fs-6">Category</RouterLink>
          <RouterLink to="/history" class="text-white text-decoration-none fs-6">History</RouterLink>
          <RouterLink to="/education" class="text-white text-decoration-none fs-6">Education</RouterLink>
          <RouterLink to="/notifications" class="text-white fs-4 text-decoration-none">알림</RouterLink>
          <RouterLink to="/profile" class="fs-4 text-decoration-none">프로필</RouterLink>
          <button class="btn text-white fs-4 ms-3" @click="showMenu = true">☰</button>
        </div>
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
  