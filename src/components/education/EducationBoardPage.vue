<template>
    <div class="education-video-page">
      <div class="page-description">
        <h1 class="page-title">쉽고 재미있는 금융 교육 콘텐츠</h1>
        <p class="page-subtitle">
          짧은 영상부터 실생활에 유용한 금융 강의까지!<br />
          누구나 이해할 수 있는 금융 콘텐츠를 만나보세요.
        </p>
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

      <!-- Video Overlay (Full screen) -->
      <div
        v-if="currentPlaying && currentPlaying.playing"
        class="video-overlay"
        @click.self="closeOverlay"
      >
        <iframe
          :class="[currentPlaying.short ? 'short-video-iframe-full' : 'video-iframe-full']"
          :src="getEmbedUrl(currentPlaying.youtubeId)"
          allowfullscreen
          frameborder="0"
        />
        <button class="close-button" @click="closeOverlay">✕</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  
const shorts = reactive([
  { id: 1, youtubeId: 'k28Z5KZ28n8', title: '금융문맹 제일 많은 20대! 경제공부 이렇게 하세요 🔥', playing: false, short: true },
  { id: 2, youtubeId: 'nHIWBkG4qWg', title: '🙃?? :경제금융교육? 그게 돈이 됩니까?', playing: false, short: true },
  { id: 3, youtubeId: 'pTe2QHUOJB0', title: '경제교육 이렇게 시작하세요', playing: false, short: true },
  { id: 4, youtubeId: 'Q2bBwCKyF_w', title: '모르면 손해보는 한국은행 경제금융 교육', playing: false, short: true },
  { id: 5, youtubeId: 'jUW7td3Jmfc', title: '[59초 맛보기] 교실에서 벌어지는 진짜 경제금융 교육 💒', playing: false, short: true },
  { id: 14, youtubeId: 'uelHwf8o7_U', title: '금융사기 예방법', playing: false, short: true }
])

const fulls = reactive([
  { id: 11, youtubeId: 'uYLuGAwmOMY', title: '이보다 더 쉽게 설명할 순 없다! 은행에서 돈이 돌아가는 원리💸', playing: false, short: false },
  { id: 12, youtubeId: '-HU3QTHUoXk', title: '[자본주의 하이라이트📌] 이보다 더 쉬울 수 없다! 꼭 알아야 하는 자본주의 시대의 돈의 흐름과 소비', playing: false, short: false },
  { id: 13, youtubeId: 'rPcHmHUXEIc', title: '투자와 투기 사이', playing: false, short: false },
  { id: 14, youtubeId: 'uyqVCnWSGDw', title: '인플레이션이 오면 누가 이득일까 | 이제는 알아야 할 돈의 흐름', playing: false, short: false },
  { id: 15, youtubeId: 'LsoLEjrDogU', title: '사회초년생 금융가이드', playing: false, short: false },
  { id: 14, youtubeId: 'uelHwf8o7_U', title: '금융사기 예방법', playing: false, short: false }
])
  
const showMoreShorts = ref(false)
const showMoreFulls = ref(false)
const maxVisibleShorts = 5;
const maxVisibleFulls = 4;
  
  const visibleShorts = computed(() =>
    showMoreShorts.value ? shorts : shorts.slice(0, maxVisibleShorts)
  )
  const visibleFulls = computed(() =>
    showMoreFulls.value ? fulls : fulls.slice(0, maxVisibleFulls)
  )
  
  function getThumbnailUrl(id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  
  function getEmbedUrl(id) {
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  }
  
  // Overlay logic
  const currentPlaying = ref(null)

  function play(video) {
    // Stop previously playing video, if any
    if (currentPlaying.value) {
      currentPlaying.value.playing = false
    }
    currentPlaying.value = video
    video.playing = true
  }

  function closeOverlay() {
    if (currentPlaying.value) {
      currentPlaying.value.playing = false
      currentPlaying.value = null
    }
  }

  const router = useRouter()

  function goToShortDetail() {
    router.push('/education/shorts')
  }

  function goToVideoDetail() {
    router.push('/education/videos')
  }
  </script>
  
  <style scoped>
  .education-video-page {
    padding: 2rem 1.5rem;
    max-width: 1200px;
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
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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
    background-color: rgba(0,0,0,0.8);
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
    text-align: center;
    margin-bottom: 3rem;
    background-color: #f3f6f9;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }
  .page-title {
    font-size: 2.4rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #222;
  }
  .page-subtitle {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.8;
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
</style>