<!-- 기본 레이아웃 컴포넌트 -->
<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
</script>

<template>
  <div class="container">
    <Header/>
    <div class="content my-5 px-3">
      <slot></slot>
      <!-- 페이지 컨텐츠가 들어갈 슬롯 -->
    </div>
    <Footer/>
  </div>
</template>
