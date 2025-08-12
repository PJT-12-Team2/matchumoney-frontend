<template>
  <!-- 웹툰 Section -->
  <section class="webtoon-section">
    <div class="section-header">
      <h2>금융교육 웹툰</h2>
      <p class="webtoon-subtitle">썸네일을 클릭하면 웹툰을 읽을 수 있어요!</p>
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
/* 웹툰 섹션 스타일 */
.webtoon-section {
  width: 80%;
  margin: 1.5rem auto 3rem; /* ← 좌우 auto로 가운데 정렬 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.section-header h2 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.webtoon-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 로딩 스타일 */
.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #aacd96;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 에러 스타일 */
.error {
  text-align: center;
  padding: 50px;
  color: #e74c3c;
}

.retry-btn {
  background: #aacd96;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #9bc07c;
}

/* 웹툰 그리드 */
.webtoon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  /* padding: 5rem; */
}

.webtoon-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.webtoon-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.webtoon-card:hover .webtoon-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.overlay-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.webtoon-info {
  padding: 20px;
}

.webtoon-card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.webtoon-id {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* video overlay보다 위에 */
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e74c3c;
  color: white;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  padding: 20px;
  max-height: calc(90vh - 160px); /* 헤더와 푸터 높이 제외 */
}

.webtoon-full-image {
  width: 100%;
  height: auto;
  min-height: 100%;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: block;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  text-align: center;
  background: #f8f9fa;
}

.modal-close-btn {
  background: #aacd96;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.modal-close-btn:hover {
  background: #9bc07c;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .webtoon-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .modal-overlay {
    padding: 10px;
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
    gap: 15px;
  }

  .webtoon-image-container {
    height: 250px;
  }

  .modal-overlay {
    padding: 5px;
  }

  .modal-content {
    max-height: 98vh;
  }

  .modal-body {
    max-height: calc(98vh - 160px);
    padding: 10px;
  }
}
</style>
