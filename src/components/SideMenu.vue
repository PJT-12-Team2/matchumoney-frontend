<template>
  <transition name="slide">
    <div
      v-if="visible"
      class="side-menu"
    >
      <div class="menu-header">
        <h5>메뉴</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>
      <nav class="menu-links">
        <RouterLink to="/recommend">🏠 상품추천</RouterLink>
        <RouterLink to="/asset">📊 자산관리</RouterLink>
        <RouterLink to="/card">💳 카드</RouterLink>
        <RouterLink to="/loan">🏦 대출</RouterLink>
        <RouterLink to="/insurance">🛡️ 보험</RouterLink>
        <RouterLink to="/notifications">🔔 알림</RouterLink>
        <RouterLink to="/profile">👤 프로필</RouterLink>
      </nav>
    </div>
  </transition>
</template>

<script setup>
defineProps({ visible: Boolean });
</script>

<style scoped>
.side-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background-color: #f9fafb;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 메뉴 상단 */
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.menu-header h5 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #40513b;
}

/* 닫기 버튼 */
.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* 링크 스타일 */
.menu-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-links a {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.menu-links a:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

/* 슬라이드 트랜지션 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>