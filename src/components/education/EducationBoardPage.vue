<template>
  <div class="education-video-page">
    <div class="page-description">
      <div class="hero-content">
        <div class="title-wrapper">
          <h1 class="page-title">
            <span class="title-emoji">🎓</span>
            쉽고 재미있는 금융 교육 콘텐츠
          </h1>
        </div>
        <p class="page-subtitle">
          <span class="subtitle-highlight">짧은 영상</span>부터
          <span class="subtitle-highlight">실생활에 유용한 금융 강의</span
          >까지!<br />
          <span class="subtitle-accent">💡 누구나 이해할 수 있는</span>
          금융 콘텐츠를 만나보세요.
        </p>
        <div class="feature-badges">
          <span class="badge">📹 쉬운 영상</span>
          <span class="badge">📚 웹툰</span>
          <span class="badge">💰 실용적</span>
          <span class="badge">🎯 무료</span>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="floating-icon floating-icon-1">💸</div>
        <div class="floating-icon floating-icon-2">📊</div>
        <div class="floating-icon floating-icon-3">💡</div>
        <div class="floating-icon floating-icon-4">🎯</div>
      </div>
    </div>
    <!-- 전체 영상 Section -->
    <section class="video-section">
      <div class="section-header">
        <h2>금융 교육 영상</h2>
        <button
          v-if="fulls.length > maxVisibleFulls"
          @click="goToVideoDetail"
          class="more-btn"
        >
          더보기
        </button>
      </div>
      <div class="video-grid full">
        <div
          v-for="(video, index) in visibleFulls"
          :key="video.id"
          class="video-card"
        >
          <div class="thumbnail" v-if="!video.playing" @click="play(video)">
            <img :src="getThumbnailUrl(video.youtubeId)" />
            <div class="overlay-play">▶</div>
            <div class="video-title">{{ video.title }}</div>
          </div>
          <iframe
            v-if="video.playing"
            class="video-iframe"
            :src="getEmbedUrl(video.youtubeId)"
            allowfullscreen
            frameborder="0"
          />
        </div>
      </div>
    </section>

    <!-- Shorts 영상 Section -->
    <section class="video-section">
      <div class="section-header">
        <h2>Shorts 영상</h2>
        <button
          v-if="shorts.length > maxVisibleShorts"
          @click="goToShortDetail"
          class="more-btn"
        >
          더보기
        </button>
      </div>
      <div class="video-grid">
        <div
          v-for="(video, index) in visibleShorts"
          :key="video.id"
          class="video-card short"
        >
          <div class="thumbnail" v-if="!video.playing" @click="play(video)">
            <img :src="getThumbnailUrl(video.youtubeId)" />
            <div class="overlay-play">▶</div>
            <div class="video-title">{{ video.title }}</div>
          </div>
          <iframe
            v-if="video.playing"
            class="video-iframe"
            :src="getEmbedUrl(video.youtubeId)"
            allowfullscreen
            frameborder="0"
          />
        </div>
      </div>
    </section>

    <!-- 웹툰 Section 추가 -->
    <section class="webtoon-section">
      <div class="section-header">
        <h2>📚 금융교육 웹툰</h2>
        <p class="webtoon-subtitle">썸네일을 클릭하면 웹툰을 읽을 수 있어요!</p>
        <button @click="goToWebtoonPage" class="more-btn">더보기</button>
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
    </section>

    <!-- Video Overlay (Full screen) -->
    <div
      v-if="currentPlaying && currentPlaying.playing"
      class="video-overlay"
      @click.self="closeOverlay"
    >
      <iframe
        :class="[
          currentPlaying.short
            ? 'short-video-iframe-full'
            : 'video-iframe-full',
        ]"
        :src="getEmbedUrl(currentPlaying.youtubeId)"
        allowfullscreen
        frameborder="0"
      />
      <button class="close-button" @click="closeOverlay">✕</button>
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
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const shorts = reactive([
  {
    id: 1,
    youtubeId: 'k28Z5KZ28n8',
    title: '금융문맹 제일 많은 20대! 경제공부 이렇게 하세요 🔥',
    playing: false,
    short: true,
  },
  {
    id: 2,
    youtubeId: 'nHIWBkG4qWg',
    title: '🙃?? :경제금융교육? 그게 돈이 됩니까?',
    playing: false,
    short: true,
  },
  {
    id: 3,
    youtubeId: 'pTe2QHUOJB0',
    title: '경제교육 이렇게 시작하세요',
    playing: false,
    short: true,
  },
  {
    id: 4,
    youtubeId: 'Q2bBwCKyF_w',
    title: '모르면 손해보는 한국은행 경제금융 교육',
    playing: false,
    short: true,
  },
  {
    id: 5,
    youtubeId: 'jUW7td3Jmfc',
    title: '[59초 맛보기] 교실에서 벌어지는 진짜 경제금융 교육 💒',
    playing: false,
    short: true,
  },
  {
    id: 14,
    youtubeId: 'uelHwf8o7_U',
    title: '금융사기 예방법',
    playing: false,
    short: true,
  },
]);

const fulls = reactive([
  {
    id: 11,
    youtubeId: 'uYLuGAwmOMY',
    title: '이보다 더 쉽게 설명할 순 없다! 은행에서 돈이 돌아가는 원리💸',
    playing: false,
    short: false,
  },
  {
    id: 12,
    youtubeId: '-HU3QTHUoXk',
    title:
      '[자본주의 하이라이트📌] 이보다 더 쉬울 수 없다! 꼭 알아야 하는 자본주의 시대의 돈의 흐름과 소비',
    playing: false,
    short: false,
  },
  {
    id: 13,
    youtubeId: 'rPcHmHUXEIc',
    title: '투자와 투기 사이',
    playing: false,
    short: false,
  },
  {
    id: 14,
    youtubeId: 'uyqVCnWSGDw',
    title: '인플레이션이 오면 누가 이득일까 | 이제는 알아야 할 돈의 흐름',
    playing: false,
    short: false,
  },
  {
    id: 15,
    youtubeId: 'LsoLEjrDogU',
    title: '사회초년생 금융가이드',
    playing: false,
    short: false,
  },
  {
    id: 14,
    youtubeId: 'uelHwf8o7_U',
    title: '금융사기 예방법',
    playing: false,
    short: false,
  },
]);

// 웹툰 관련 데이터
const webtoons = ref([]);
const selectedWebtoon = ref(null);
const loading = ref(false);
const error = ref(false);

const showMoreShorts = ref(false);
const showMoreFulls = ref(false);
const maxVisibleShorts = 5;
const maxVisibleFulls = 4;

const visibleShorts = computed(() =>
  showMoreShorts.value ? shorts : shorts.slice(0, maxVisibleShorts)
);
const visibleFulls = computed(() =>
  showMoreFulls.value ? fulls : fulls.slice(0, maxVisibleFulls)
);

function getThumbnailUrl(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function getEmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

// Overlay logic
const currentPlaying = ref(null);

function play(video) {
  // Stop previously playing video, if any
  if (currentPlaying.value) {
    currentPlaying.value.playing = false;
  }
  currentPlaying.value = video;
  video.playing = true;
}

function closeOverlay() {
  if (currentPlaying.value) {
    currentPlaying.value.playing = false;
    currentPlaying.value = null;
  }
}

const router = useRouter();

function goToShortDetail() {
  router.push('/education/shorts');
}

function goToVideoDetail() {
  router.push('/education/videos');
}

// 웹툰 관련 함수들
async function fetchWebtoons() {
  loading.value = true;
  error.value = false;

  try {
    const response = await axios.get('http://localhost:8080/api/webtoon/top4');
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
onMounted(() => {
  fetchWebtoons();

  const handleEsc = (event) => {
    if (event.key === 'Escape' && selectedWebtoon.value) {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEsc);

  // 컴포넌트 해제시 이벤트 리스너 제거
  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
});
function goToWebtoonPage() {
  router.push('/education/webtoon');
}

onMounted(() => {
  // ESC 키로 오버레이 닫기
  const handleEsc = (event) => {
    if (event.key === 'Escape' && currentPlaying.value) {
      closeOverlay();
    }
  };

  document.addEventListener('keydown', handleEsc);

  // 컴포넌트 해제시 이벤트 리스너 제거
  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
});
</script>

<style scoped>
.education-video-page {
  padding: 2rem 1.5rem;
  max-width: 80%;
  margin: 0 auto;
}
.video-section {
  margin-bottom: 3rem;
}
.video-section h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.video-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: space-between;
}
.video-grid.full {
  flex-wrap: nowrap;
  overflow-x: auto;
}
.video-card {
  width: 18%;
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}
.video-card:not(.short) {
  width: 23%;
}
.video-card:not(.short) .video-iframe {
  height: 220px;
}
.video-card:hover {
  transform: translateY(-4px);
}
.thumbnail {
  position: relative;
  cursor: pointer;
}
.thumbnail img {
  width: 100%;
  border-radius: 12px;
}
.overlay-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 0.3rem 0.5rem;
}
.video-title {
  font-weight: 600;
  margin-top: 0.4rem;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.video-iframe {
  height: 200px;
  border-radius: 12px;
  width: 100%;
}
.more-btn {
  margin-top: 1.5rem;
  background: #aacd96;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.more-btn:hover {
  background: #9bc07c;
}
.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.video-iframe-full {
  width: 80%;
  height: 80%;
  border-radius: 12px;
}
.close-button {
  position: absolute;
  top: 2rem;
  right: 2rem;
  font-size: 2rem;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
}
.page-description {
  position: relative;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #aacd96 0%, #8bb06a 100%);
  padding: 1.5rem 1rem;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(170, 205, 150, 0.4);
  overflow: hidden;
}

.page-description::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.title-wrapper {
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.title-emoji {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
  margin-right: 0.5rem;
}

.page-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}
.video-card.short .thumbnail img {
  aspect-ratio: 9/16;
  object-fit: cover;
}
.short-video-iframe-full {
  width: 400px;
  height: 700px;
  border-radius: 12px;
}

.subtitle-highlight {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.subtitle-accent {
  font-weight: 700;
  color: #ffe066;
}

.feature-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.badge:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
  opacity: 0.3;
}

.floating-icon-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-icon-2 {
  top: 70%;
  right: 15%;
  animation-delay: 1.5s;
}

.floating-icon-3 {
  top: 30%;
  right: 20%;
  animation-delay: 3s;
}

.floating-icon-4 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4.5s;
}

/* 웹툰 섹션 스타일 */
.webtoon-section .section-header {
  display: grid;
  grid-template-columns: 1fr auto; /* 왼쪽: 제목/부제, 오른쪽: 버튼 */
  grid-template-rows: auto auto; /* 1행: 제목, 2행: 부제 */
  column-gap: 1rem;
  row-gap: 0.5rem;
  align-items: center;
}

.webtoon-section .section-header h2 {
  grid-column: 1;
  grid-row: 1;
  margin: 0;
}

.webtoon-section .section-header .webtoon-subtitle {
  grid-column: 1;
  grid-row: 2;
  margin: 0;
}

.webtoon-section .section-header .more-btn {
  grid-column: 2; /* 오른쪽 열 */
  grid-row: 1; /* 제목과 같은 행(상단 오른쪽) */
  align-self: start;
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
  /* grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); */
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  padding: 20px 0;
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
/* 애니메이션 */
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  100% {
    opacity: 0.5;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(-10px) rotate(-5deg);
  }
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
.page-description {
  padding: 2.25rem 1.25rem;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.2rem;
}

.page-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.feature-badges {
  gap: 0.7rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.floating-icon {
  font-size: 1.5rem;
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
  .page-description {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .feature-badges {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
