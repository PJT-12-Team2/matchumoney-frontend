<!-- src/components/SideMenu.vue -->
<template>
  <transition name="slide">
    <div
      v-if="visible"
      class="side-menu position-fixed top-0 end-0 bg-white shadow-lg p-4"
      style="width: 280px; height: 100vh; z-index: 1050"
    >
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">메뉴</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>
      <RouterLink to="/" class="d-block mb-3">🏠 Home</RouterLink>
      <RouterLink to="/category" class="d-block mb-3">📂 Category</RouterLink>
      <RouterLink to="/history" class="d-block mb-3">📜 History</RouterLink>
      <RouterLink to="/education" class="d-block mb-3">📘 Education</RouterLink>
      <RouterLink to="/notifications" class="d-block mb-3"
        >🔔 Notifications</RouterLink
      >
      <RouterLink to="/profile" class="d-block">👩‍💼 Profile</RouterLink>
    </div>
  </transition>
</template>

<script setup>
defineProps({ visible: Boolean });
</script>

<style scoped>
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
