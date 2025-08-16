<template>
  <div class="education-video-page">
    <div class="page-description">
      <h1 class="page-title">쉽고 재미있는 금융 교육 영상</h1>
      <p class="page-subtitle">
        핵심만 빠르게 이해하고 <br />지금 당장 써먹는 금융 지식을 배우세요.
      </p>
    </div>
    <div class="filter-bar">
      <label class="series-toggle">
        <input type="checkbox" v-model="groupBySeries" />
        <span>유사 시리즈 묶어서 보기</span>
      </label>
      <select
        v-model="selectedSeries"
        :disabled="!groupBySeries"
        class="series-select"
      >
        <option v-for="opt in seriesOptions" :key="opt" :value="opt">
          {{ opt === 'ALL' ? '전체 시리즈' : opt }}
        </option>
      </select>
    </div>
    <div ref="scrollRoot" :class="{ 'no-scroll': isOverlayOpen }">
      <section class="video-section">
        <!-- 일반 모드: 평소처럼 카드 나열 -->
        <template v-if="!groupBySeries">
          <div class="card-grid">
            <div
              v-for="(m, i) in videos"
              :key="m.id ?? i"
              class="card"
              @click="openOverlay(m)"
            >
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
                <span class="play-badge">▶</span>
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
        </template>

        <!-- 시리즈 그룹 모드: [여이주TV] 등 시리즈별 섹션 묶음 -->
        <template v-else>
          <div
            v-for="([seriesKey, items], gi) in seriesGroupEntries"
            :key="seriesKey + '_' + gi"
            class="series-section"
          >
            <div class="series-header">
              <h3 class="series-title">{{ seriesKey }}</h3>
              <span class="series-count">{{ items.length }}개</span>
            </div>
            <div class="card-grid">
              <div
                v-for="(m, i) in items"
                :key="m.id ?? seriesKey + '_' + i"
                class="card"
                @click="openOverlay(m)"
              >
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
                  <span class="play-badge">▶</span>
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
          </div>
        </template>

        <div ref="sentinel" class="infinite-sentinel"></div>
        <div v-if="loading" class="infinite-loading">로딩 중…</div>
        <div v-if="done" class="infinite-done">모두 불러왔습니다</div>
      </section>

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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import eduAPI from '@/api/edu';

const videos = ref([]);
const loading = ref(false);
const done = ref(false);
const sentinel = ref(null);
const scrollRoot = ref(null);
let io = null;

const pageSize = 12;
const offset = ref(0);
const seenIds = new Set();

const isOverlayOpen = ref(false);
const current = ref(null);

/* ── 시리즈(여이주TV 등) 그룹 모드 ───────────────────── */
const groupBySeries = ref(false);
const selectedSeries = ref('ALL');

// 제목에서 [시리즈명] 패턴 감지 → 예: [여이주TV] #01, [여이주TV]#12
function extractSeriesKeyFromTitle(title) {
  const t = String(title || '').trim();
  // 1) [시리즈] #12 / [시리즈]12 / [시리즈]
  let m = t.match(/^\s*\[([^\]]+)\]\s*(?:#?\s*\d+)?/);
  if (m && m[1]) return m[1].trim();
  // 2) 여이주TV #01 같은 케이스(대괄호 없는 경우)
  m = t.match(/^\s*([가-힣A-Za-z0-9]+TV)\s*#?\s*\d+/i);
  if (m && m[1]) return m[1].trim();
  return null; // 시리즈 키 없음
}

// 시리즈 그룹 구성 { key: VideoItem[] }
const seriesGroups = computed(() => {
  const map = new Map();
  for (const it of videos.value) {
    const key = extractSeriesKeyFromTitle(it.title);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  // 각 그룹 안을 최신순으로 보이도록(원본 순서 유지 원하면 제거)
  for (const [k, arr] of map) {
    map.set(k, [...arr]);
  }
  return map;
});

// 드롭다운 옵션: ALL + 시리즈명들(가나다/알파벳 순)
const seriesOptions = computed(() => {
  const keys = Array.from(seriesGroups.value.keys());
  keys.sort((a, b) => a.localeCompare(b));
  return ['ALL', ...keys];
});

// 선택된 시리즈만 보여줄 엔트리 (기본: 전체)
const seriesGroupEntries = computed(() => {
  const entries = Array.from(seriesGroups.value.entries());
  if (selectedSeries.value === 'ALL') return entries;
  return entries.filter(([key]) => key === selectedSeries.value);
});

onMounted(async () => {
  await loadMore();
  await nextTick();

  // IntersectionObserver (가능하면 사용)
  const rootEl = getScrollRoot();
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore();
    },
    { root: rootEl, rootMargin: '1200px 0px', threshold: 0.01 }
  );
  if (sentinel.value) io.observe(sentinel.value);

  // ✅ 스크롤 폴백(무조건 등록)
  const target = rootEl ?? window;
  target.addEventListener('scroll', onScroll, { passive: true });

  // ✅ 초기 화면이 짧으면 강제 추가 로드
  await topUpIfShort();

  window.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  io?.disconnect();
  const rootEl = getScrollRoot();
  (rootEl ?? window).removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onKeyDown);
});

async function loadMore() {
  if (loading.value || done.value) return;
  loading.value = true;
  try {
    const raw = await eduAPI.getMovieList({ offset: offset.value, pageSize });
    const rows = Array.isArray(raw)
      ? raw
      : raw?.content ?? raw?.list ?? raw?.items ?? [];
    if (!rows || rows.length === 0) {
      done.value = true;
      if (io && sentinel.value) io.unobserve(sentinel.value);
      return;
    }
    const normalized = await normalizeVideos(rows);
    const append = normalized.filter((it) => {
      const key = it.id ?? `${it.link}|${it.url}`;
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });
    videos.value.push(...append);
    offset.value += rows.length;
  } catch (e) {
    console.error('무한 스크롤 로드 실패:', e);
  } finally {
    loading.value = false;
  }
}

/* ── 스크롤 루트/폴백/탑업 ─────────────────────────────── */
function getScrollRoot() {
  const el = scrollRoot.value;
  if (!el) return null; // window 스크롤
  const st = getComputedStyle(el);
  const scrollable = /(auto|scroll)/.test(st.overflowY);
  return scrollable && el.clientHeight < el.scrollHeight ? el : null;
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(async () => {
    ticking = false;
    if (loading.value || done.value) return;
    const vpBottom = getViewportBottom();
    const sTop = getSentinelTop();
    if (vpBottom + 200 >= sTop) await loadMore();
  });
}

function getViewportBottom() {
  const rootEl = getScrollRoot();
  return rootEl
    ? rootEl.scrollTop + rootEl.clientHeight
    : window.scrollY + window.innerHeight;
}
function getSentinelTop() {
  const rootEl = getScrollRoot();
  const el = sentinel.value;
  if (!el) return Number.MAX_SAFE_INTEGER;
  const rect = el.getBoundingClientRect();
  if (!rootEl) return window.scrollY + rect.top;
  const rootRect = rootEl.getBoundingClientRect();
  return rootEl.scrollTop + (rect.top - rootRect.top);
}

// 첫 화면이 짧을 때 자동 추가 로딩 (최대 3회)
async function topUpIfShort(maxRounds = 3) {
  let rounds = 0;
  while (!done.value && !loading.value && rounds < maxRounds) {
    const vpBottom = getViewportBottom();
    const sTop = getSentinelTop();
    if (vpBottom + 200 >= sTop) {
      await loadMore();
      await nextTick();
      rounds++;
    } else break;
  }
}

/* ── 타입 판별/정규화 ─────────────────────────────────── */
const headCache = new Map();

async function normalizeVideos(raw) {
  const arr = raw.map((r) => {
    const link = r.link || r.xtrnlContentsUrl || '';
    const url = r.url || r.fileDownUrl || '';
    const type = link ? 'youtube' : guessByExt(url);
    return { id: r.id, title: r.title, url, link, type };
  });
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
        /* ignore */
      }
    }
  };
  await Promise.allSettled(Array.from({ length: concurrency }, worker));
}

/* ── 오버레이 ────────────────────────────────────────── */
function openOverlay(item) {
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

/* ── 유튜브 헬퍼 ─────────────────────────────────────── */
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

.video-section {
  margin-bottom: 3rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
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
}
@media (min-width: 1024px) {
  .card {
    width: calc(25% - 0.9rem);
  }
}

.thumb {
  width: 100%;
  display: block;
  background: #000;
}
.thumb-16x9 {
  aspect-ratio: 16 / 9;
  object-fit: cover;
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
  padding: 0.6rem 0.4rem;
  font-weight: 600;
  font-size: var(--font-size-sm);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-height: 1.4;
  max-height: calc(1.4em * 2.4);
}

.infinite-sentinel {
  display: block;
  width: 100%;
  height: 1px;
}
.infinite-loading,
.infinite-done {
  text-align: center;
  padding: 0.75rem;
  color: #666;
  font-size: 14px;
}

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
.page-description {
  text-align: center;
  margin-bottom: 1.5rem;
  background: #f3f6f9;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: #222;
}
.page-subtitle {
  font-size: var(--font-size-base);
  color: #555;
  line-height: 1.8;
}
.education-video-page {
  padding: 2rem 1.5rem;
  max-width: 80%;
  margin: 0 auto;
}
.education-video-page.no-scroll {
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 16px;
}
.series-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  font-size: 14px;
  color: #333;
}
.series-select {
  height: 36px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
  color: #111;
}
.series-section {
  margin-bottom: 28px;
}
.series-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 6px 2px 10px;
}
.series-title {
  font-size: 18px;
  font-weight: 800;
  color: #222;
  margin: 0;
}
.series-count {
  font-size: 12px;
  color: #666;
}
</style>
