<template>
  <div class="education-video-page" :class="{ 'no-scroll': isOverlayOpen }">
    <div class="page-description">
      <h1 class="page-title">쉽고 재미있는 금융 교육 콘텐츠</h1>
      <p class="page-subtitle">
        실생활에 유용한 금융 영상부터 웹툰까지! <br />
        누구나 이해하기 쉬운 금융 콘텐츠를 만나보세요.
      </p>
    </div>

    <!-- 섹션: 교육 영상 (프리뷰 + 더보기 라우팅) -->
    <section class="video-section">
      <div class="section-header">
        <h2>교육 영상</h2>
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

    <!-- 섹션: 금융 웹툰 (프리뷰 + 더보기 라우팅) -->
    <section class="video-section">
      <div class="section-header">
        <h2>금융 웹툰</h2>
        <button class="more-btn" @click="goToWebtoonMore">더보기</button>
      </div>

      <div class="card-grid">
        <div
          v-for="(w, i) in visibleToons"
          :key="w.id ?? i"
          class="card toon"
          @click="goToWebtoonDetail(w)"
        >
          <img
            :src="w.thumbUrl || w.coverUrl || w.url"
            :alt="w.title || '웹툰'"
            class="thumb thumb-3x4"
            loading="lazy"
          />
          <div class="card-title" :title="w.title">{{ w.title }}</div>
        </div>
      </div>
    </section>

    <!-- 오버레이 플레이어 (영상 전용) -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import eduAPI from '@/api/edu';

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
  isOverlayOpen.value = false;
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
function goToWebtoonMore() {
  router.push('/education/webtoons');
}
function goToWebtoonDetail(w) {
  // 상세 페이지가 있다면 id 기반 라우팅
  router.push({ path: '/education/webtoons/detail', query: { id: w.id } });
}

/* -------------------- 유튜브 헬퍼 -------------------- */
function getEmbedUrl(id) {
  const p = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
}
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
  text-align: center;
  margin-bottom: 3rem;
  background: #f3f6f9;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin-bottom: 1rem;
  color: #222;
}
.page-subtitle {
  font-size: var(--font-size-base);
  color: #555;
  line-height: 1.8;
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
.card.toon {
  /* 웹툰 카드 구분이 필요하면 추가 스타일 */
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
</style>
