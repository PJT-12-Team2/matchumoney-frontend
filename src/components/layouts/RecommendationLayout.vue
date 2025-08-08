<template>
  <div class="recommendation-layout">
    <h2 class="section-title text-center">{{ title }}</h2>

    <!-- 슬라이더 영역 -->
    <div class="recommendation-slider">
      <slot name="slider" />
    </div>

    <!-- 강조 문구 영역 -->
    <div class="recommendation-highlight text-center">
      <slot name="highlight" />
    </div>

    <!-- 본문 리스트 영역 -->
    <div class="recommendation-content">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.recommendation-layout {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-title);
}
.recommendation-slider,
.recommendation-highlight,
.recommendation-content {
  font-size: var(--font-size-base);
  margin: var(--spacing-md) 0;
}
.recommendation-highlight {
  color: var(--color-accent);
  font-weight: bold;
  background: var(--color-info-light);
  padding: 16px 20px;
  border-radius: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--color-accent);
}
</style>
