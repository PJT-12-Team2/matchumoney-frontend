<template>
  <!-- 웹툰 Section -->
  <section class="webtoon-section">
    <div class="page-description">
      <h1 class="page-title">웹툰으로 배우는 금융 교육</h1>
      <p class="page-subtitle">
        다양하고 재미있는 웹툰으로 <br />어려운 금융 지식을 쉽게 배워보세요
      </p>
    </div>
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>웹툰을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">
      <p>❌ 웹툰을 불러오는데 실패했습니다.</p>
      <button @click="fetchWebtoons" class="retry-btn">다시 시도</button>
    </div>

    <!-- 웹툰 목록 -->
    <div v-else class="webtoon-grid">
      <div
        v-for="webtoon in webtoons"
        :key="webtoon.id"
        class="webtoon-card"
        @click="openModal(webtoon)"
      >
        <div class="webtoon-image-container">
          <img
            :src="webtoon.fileDownUrl"
            :alt="webtoon.title"
            class="webtoon-image"
            @error="handleImageError"
          />
          <div class="webtoon-overlay">
            <span class="play-icon">📖</span>
            <span class="overlay-text">웹툰 읽기</span>
          </div>
        </div>
        <div class="webtoon-info">
          <h3 class="webtoon-card-title">{{ webtoon.title }}</h3>
        </div>
      </div>
    </div>

    <!-- 웹툰 모달 -->
    <div v-if="selectedWebtoon" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedWebtoon.title }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <!-- 웹툰 이미지 -->
        <div class="modal-body">
          <img
            :src="selectedWebtoon.secondImageUrl"
            :alt="selectedWebtoon.title"
            class="webtoon-full-image"
            @error="handleModalImageError"
          />
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <button @click="closeModal" class="modal-close-btn">닫기</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { RouterLink } from 'vue-router';

// 웹툰 관련 데이터
const webtoons = ref([]);
const selectedWebtoon = ref(null);
const loading = ref(false);
const error = ref(false);

// 웹툰 관련 함수들
async function fetchWebtoons() {
  loading.value = true;
  error.value = false;

  try {
    const response = await axios.get('http://localhost:8080/api/webtoon');
    webtoons.value = response.data;
    console.log('웹툰 데이터:', webtoons.value);
  } catch (err) {
    console.error('웹툰 조회 실패:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function openModal(webtoon) {
  selectedWebtoon.value = webtoon;
  document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function closeModal() {
  selectedWebtoon.value = null;
  document.body.style.overflow = 'auto'; // 스크롤 복원
}

function handleImageError(event) {
  event.target.src =
    'https://via.placeholder.com/300x400/cccccc/666666?text=이미지+없음';
}

function handleModalImageError(event) {
  event.target.src =
    'https://via.placeholder.com/600x800/cccccc/666666?text=웹툰+이미지+없음';
}

// ESC 키로 모달 닫기
const handleEsc = (event) => {
  if (event.key === 'Escape' && selectedWebtoon.value) {
    closeModal();
  }
};

onMounted(() => {
  fetchWebtoons();
  document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc);
  // 컴포넌트 해제시 스크롤 복원
  document.body.style.overflow = 'auto';
});
</script>

<style scoped>
.page-description {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  background: var(--color-light);
  padding: var(--spacing-md);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: bold;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
}

.webtoon-section {
  width: 80%;
  margin: var(--spacing-lg) auto var(--spacing-2xl);
}

.loading {
  text-align: center;
  padding: var(--spacing-3xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-error);
}

.retry-btn {
  background: var(--color-secondary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  cursor: pointer;
  margin-top: var(--spacing-sm);
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-accent);
}

.webtoon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
}

.webtoon-card {
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.webtoon-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.webtoon-image-container {
  position: relative;
  overflow: hidden;
  height: 300px;
}

.webtoon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.webtoon-card:hover .webtoon-image {
  transform: scale(1.05);
}

.webtoon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay-dark);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--color-white);
}

.webtoon-card:hover .webtoon-overlay {
  opacity: 1;
}

.play-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-sm);
}

.overlay-text {
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.webtoon-info {
  padding: var(--spacing-lg);
}

.webtoon-card-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(5px);
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-modal);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-content);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--text-secondary);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  padding: var(--spacing-lg);
  max-height: calc(90vh - 160px);
}

.webtoon-full-image {
  width: 100%;
  height: auto;
  min-height: 100%;
  border-radius: 10px;
  box-shadow: var(--shadow-md);
  display: block;
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  text-align: center;
  background: var(--bg-content);
}

.modal-close-btn {
  background: var(--color-secondary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: 25px;
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background 0.2s ease;
}

.modal-close-btn:hover {
  background: var(--color-accent);
}

@media (max-width: 768px) {
  .webtoon-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .modal-overlay {
    padding: var(--spacing-sm);
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-body {
    max-height: calc(95vh - 160px);
  }
}

@media (max-width: 480px) {
  .webtoon-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .webtoon-image-container {
    height: 250px;
  }

  .modal-overlay {
    padding: var(--spacing-xs);
  }

  .modal-content {
    max-height: 98vh;
  }

  .modal-body {
    max-height: calc(98vh - 160px);
    padding: var(--spacing-sm);
  }
}
</style>
