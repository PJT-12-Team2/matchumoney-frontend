<template>
  <div class="education-video-page" :class="{ 'no-scroll': isOverlayOpen }">
    <div class="page-description">
      <div class="hero-content">
        <div class="title-wrapper">
          <h1 class="page-title">
            <span class="title-emoji">🎓</span>
            쉽고 재미있는 금융 교육 콘텐츠
          </h1>
        </div>
        <p class="page-subtitle">
          <span class="subtitle-highlight">금융 교육 영상</span>부터
          <span class="subtitle-highlight">웹툰으로 배우는 금융</span
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

    <!-- 섹션: 교육 영상 (프리뷰 + 더보기 라우팅) -->
    <section class="video-section">
      <div class="section-header">
        <h3>📹 교육 영상</h3>
        <p class="webtoon-subtitle">
          썸네일을 클릭하면 영상을 시청할 수 있어요!
        </p>
        <RouterLink to="/education/video">
          <button class="more-btn">더보기</button>
        </RouterLink>
      </div>

      <div class="card-grid">
        <div
          v-for="(m, i) in visibleVideos"
          :key="m.id ?? i"
          class="card"
          @click="openOverlay(m)"
        >
          <!-- 유튜브 썸네일 / 비디오 플레이 아이콘 / 이미지 프리뷰 -->
          <img
            v-if="m.type === 'youtube'"
            :src="`https://img.youtube.com/vi/${extractYoutubeId(
              m.link
            )}/hqdefault.jpg`"
            :alt="m.title || '영상 썸네일'"
            class="thumb thumb-16x9"
            loading="lazy"
          />
          <div
            v-else-if="m.type === 'video'"
            class="thumb thumb-16x9 video-fallback"
          >
            <span class="play-badge" aria-hidden>▶</span>
          </div>
          <img
            v-else-if="m.type === 'image'"
            :src="m.url"
            :alt="m.title || '이미지'"
            class="thumb thumb-16x9"
            loading="lazy"
          />
          <div v-else class="thumb thumb-16x9 blank">파일 열기</div>
          <div class="card-title" :title="m.title">{{ m.title }}</div>
        </div>
      </div>
    </section>

    <!-- 웹툰 Section 추가 -->
    <section class="webtoon-section">
      <div class="section-header">
        <h3>📚 금융교육 웹툰</h3>
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
      v-if="isOverlayOpen"
      class="video-overlay"
      @click.self="closeOverlay"
      role="dialog"
      aria-modal="true"
    >
      <div class="player-wrap">
        <iframe
          v-if="current?.type === 'youtube'"
          class="player-iframe"
          :src="getEmbedUrl(extractYoutubeId(current.link))"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          frameborder="0"
          referrerpolicy="strict-origin-when-cross-origin"
          :title="current.title || '교육 영상 플레이어'"
        />
        <video
          v-else-if="current?.type === 'video'"
          class="player-iframe"
          :src="current.url"
          controls
          autoplay
          playsinline
          :title="current.title || '교육 영상 플레이어'"
        ></video>
        <img
          v-else-if="current?.type === 'image'"
          :src="current.url"
          :alt="current.title || '이미지'"
          class="player-image"
        />
        <a
          v-else
          :href="current?.url"
          target="_blank"
          rel="noopener"
          class="player-link"
          >파일 열기</a
        >
      </div>
      <button class="close-button" @click="closeOverlay" aria-label="닫기">
        ✕
      </button>
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import eduAPI from '@/api/edu';

// 웹툰 관련 데이터
const webtoons = ref([]);
const selectedWebtoon = ref(null);
const loading = ref(false);
const error = ref(false);

function getThumbnailUrl(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function getEmbedUrl(id) {
  const p = new URLSearchParams({
    autoplay: '1', // 자동 재생
    rel: '0', // 관련 동영상 숨김
    modestbranding: '1', // 유튜브 로고 최소화
    playsinline: '1', // 모바일에서 인라인 재생
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
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

// function closeOverlay() {
//   if (currentPlaying.value) {
//     currentPlaying.value.playing = false;
//     currentPlaying.value = null;
//   }
// }

const router = useRouter();

/* -------------------- 데이터 -------------------- */
const videos = ref([]); // { id, title, url, link, type }
const toons = ref([]); // { id, title, thumbUrl, url, link, ... }

/* -------------------- 오버레이 -------------------- */
const isOverlayOpen = ref(false);
const current = ref(null);

/* -------------------- 브레이크포인트별 프리뷰 개수 -------------------- */
const bp = useBreakpoint(); // 'mobile' | 'tablet' | 'desktop'
const PREVIEW_VIDEO = { mobile: 2, tablet: 4, desktop: 4 };
const PREVIEW_TOON = { mobile: 4, tablet: 6, desktop: 8 };

const visibleVideos = computed(() =>
  videos.value.slice(0, PREVIEW_VIDEO[bp.value])
);
const visibleToons = computed(() =>
  toons.value.slice(0, PREVIEW_TOON[bp.value])
);

/* -------------------- 초기 로드 -------------------- */
onMounted(async () => {
  await loadVideos();
  await loadToons();
  window.addEventListener('keydown', onKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});

async function loadVideos() {
  const raw = await eduAPI.getMovieList(0, 4);
  videos.value = await normalizeVideos(raw);
}
async function loadToons() {
  // API 네이밍은 환경에 맞게 교체 (예: eduAPI.getWebtoonList)
  const raw = await (eduAPI.getWebtoonList?.() ?? Promise.resolve([]));
  toons.value = raw.map((w) => ({
    id: w.id,
    title: w.title,
    thumbUrl: w.thumbUrl || w.coverUrl || w.url,
    url: w.url,
    link: w.link,
  }));
}

/* -------------------- 비디오 판별/정규화 -------------------- */
const headCache = new Map();

async function normalizeVideos(raw) {
  const arr = raw.map((r) => {
    const link = r.link || r.xtrnlContentsUrl || '';
    const url = r.url || r.fileDownUrl || '';
    const type = link ? 'youtube' : guessByExt(url);
    return { id: r.id, title: r.title, url, link, type };
  });
  // 확장자 모호하면 HEAD로 보강
  await refineUnknownByHead(arr);
  return arr;
}

function guessByExt(u) {
  const url = String(u || '')
    .split('?')[0]
    .toLowerCase();
  if (!url) return 'unknown';
  if (/\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)$/.test(url)) return 'video';
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(url)) return 'image';
  if (/\.(mp3|wav|m4a|aac|flac|oga)$/.test(url)) return 'audio';
  if (/\.(pdf)$/.test(url)) return 'pdf';
  return 'unknown';
}

async function refineUnknownByHead(list, concurrency = 6) {
  const targets = list.filter((i) => !i.link && i.type === 'unknown' && i.url);
  const queue = [...targets];
  const worker = async () => {
    while (queue.length) {
      const it = queue.shift();
      if (headCache.has(it.url)) {
        it.type = headCache.get(it.url);
        continue;
      }
      try {
        const res = await fetch(it.url, { method: 'HEAD', mode: 'cors' });
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        let t = 'unknown';
        if (ct.startsWith('video/')) t = 'video';
        else if (ct.startsWith('image/')) t = 'image';
        else if (ct.startsWith('audio/')) t = 'audio';
        else if (ct === 'application/pdf') t = 'pdf';
        it.type = t;
        headCache.set(it.url, t);
      } catch {
        /* CORS/네트워크 실패 → 유지 */
      }
    }
  };
  await Promise.allSettled(Array.from({ length: concurrency }, worker));
}

/* -------------------- 오버레이 동작 -------------------- */
function openOverlay(item) {
  // 영상/이미지 외 파일은 새 탭
  if (!['youtube', 'video', 'image'].includes(item.type)) {
    window.open(item.url, '_blank', 'noopener');
    return;
  }
  current.value = item;
  isOverlayOpen.value = true;
  document.documentElement.style.overflow = 'hidden';
}
function closeOverlay() {
  // 오버레이 닫기
  isOverlayOpen.value = false;

  // 재생 중인 영상 멈추기
  if (currentPlaying.value) {
    currentPlaying.value.playing = false;
    currentPlaying.value = null;
  }

  // 딜레이 후 상태 초기화
  setTimeout(() => {
    current.value = null;
    document.documentElement.style.overflow = '';
  }, 150);
}

function onKeyDown(e) {
  if (e.key === 'Escape' && isOverlayOpen.value) closeOverlay();
}

/* -------------------- 라우팅 -------------------- */
function goToVideoMore() {
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

function goToWebtoonMore() {
  router.push('/education/webtoons');
}
function goToWebtoonDetail(w) {
  // 상세 페이지가 있다면 id 기반 라우팅
  router.push({ path: '/education/webtoons/detail', query: { id: w.id } });
}

/* -------------------- 유튜브 헬퍼 -------------------- */
// function getEmbedUrl(id) {
//   const p = new URLSearchParams({
//     autoplay: '1',
//     rel: '0',
//     modestbranding: '1',
//     playsinline: '1',
//   });
//   return `https://www.youtube.com/embed/${id}?${p.toString()}`;
// }
function extractYoutubeId(url) {
  if (!url) return '';
  try {
    const u = new URL(url, window.location.origin);
    const v = u.searchParams.get('v');
    if (v) return v;
    const m1 = u.pathname.match(/^\/(?:shorts\/)?([a-zA-Z0-9_-]{6,})/);
    if (m1) return m1[1];
    const m2 = u.pathname.match(/embed\/([a-zA-Z0-9_-]{6,})/);
    if (m2) return m2[1];
    return '';
  } catch {
    const m = String(url).match(
      /(?:v=|be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/
    );
    return m ? m[1] : '';
  }
}

/* -------------------- Breakpoint -------------------- */
function useBreakpoint() {
  const cur = ref('desktop');
  const handler = () => {
    const w = window.innerWidth;
    cur.value = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  };
  onMounted(() => {
    handler();
    window.addEventListener('resize', handler, { passive: true });
  });
  onBeforeUnmount(() => window.removeEventListener('resize', handler));
  return cur;
}
</script>

<style scoped>
.education-video-page {
  padding: 2rem 1.5rem;
  max-width: 80%;
  margin: 0 auto;
}
.education-video-page.no-scroll {
  overflow: hidden;
}

.page-description {
  position: relative;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #aacd96 0%, #8bb06a 100%);
  padding: 0.5rem 0.5rem;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 3rem;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
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
  font-size: var(--font-size-xl);
  font-weight: bold;
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
  color: rgba(255, 255, 255, 0.95);
  font-size: var(--font-size-base);
  line-height: 1.8;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.video-section {
  margin-bottom: 3rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  font-weight: bold;
}
.more-btn {
  background: #aacd96;
  color: #fff;
  border: 0;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.more-btn:hover {
  background: #9bc07c;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.2rem;
}
.card {
  padding: 0;
  background: #fff;
  border-radius: 0.4rem;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
}

@media (min-width: 640px) {
  .card {
    width: calc(50% - 0.6rem);
  }
} /* tablet 2열 */
@media (min-width: 1024px) {
  .card {
    width: calc(25% - 0.9rem);
  }
} /* desktop 4열 */

.thumb {
  width: 100%;
  display: block;
  background: #000;
}
.thumb-16x9 {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.thumb-3x4 {
  aspect-ratio: 3 / 4;
  object-fit: cover;
  background: #eee;
}

.video-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.play-badge {
  font-size: 2rem;
}

.card-title {
  padding: 0.6rem 0.8rem 0.8rem;
  font-weight: 600;
  font-size: 14px;

  /* ▼ 2줄 말줄임 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 2줄로 제한 */
  line-clamp: 2; /* 최신 브라우저용(지원 안 되면 무시) */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;

  /* 한글 가독성 & 긴 영문 토큰 처리 */
  word-break: keep-all;
  overflow-wrap: anywhere;

  /* 줄간격 기준 높이(선택) */
  line-height: 1.4;
  max-height: calc(1.4em * 2.4);
}

/* 오버레이 */
.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(2px);
  padding: 2rem;
}
.player-wrap {
  width: min(1200px, 92vw);
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
.player-iframe,
.player-image {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 12px;
  object-fit: contain;
  background: #000;
}
.close-button {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 2rem;
  background: none;
  color: #fff;
  border: none;
  cursor: pointer;
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
.section-header {
  display: grid;
  grid-template-columns: 1fr auto; /* 왼쪽: 제목/부제, 오른쪽: 버튼 */
  grid-template-rows: auto auto; /* 1행: 제목, 2행: 부제 */
  column-gap: 1rem;
  row-gap: 0.5rem;
  align-items: center;
}

.section-header h3 {
  grid-column: 1;
  grid-row: 1;
  margin: 0;
}

.section-header .webtoon-subtitle {
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
