<template>
    <div class="education-video-page">
      <!-- Shorts 영상 Section -->
      <section class="video-section">
        <h2>Shorts 영상</h2>
        <div class="video-grid">
          <div
            v-for="(video, index) in visibleShorts"
            :key="video.id"
            class="video-card"
          >
            <div class="thumbnail" v-if="!video.playing" @click="play(video)">
              <img :src="getThumbnailUrl(video.youtubeId)" />
              <div class="overlay-play">▶</div>
              <div class="video-title">{{ video.title }}</div>
            </div>
            <iframe
              v-else
              class="video-iframe"
              :src="getEmbedUrl(video.youtubeId)"
              allowfullscreen
              frameborder="0"
            />
          </div>
        </div>
        <button v-if="shorts.length > maxVisibleShorts" @click="showMoreShorts = !showMoreShorts" class="more-btn">
          {{ showMoreShorts ? '접기' : '더보기' }}
        </button>
      </section>
  
      <!-- 전체 영상 Section -->
      <section class="video-section">
        <h2>금융 교육 영상</h2>
        <div class="video-grid">
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
              v-else
              class="video-iframe"
              :src="getEmbedUrl(video.youtubeId)"
              allowfullscreen
              frameborder="0"
            />
          </div>
        </div>
        <button v-if="fulls.length > maxVisibleFulls" @click="showMoreFulls = !showMoreFulls" class="more-btn">
          {{ showMoreFulls ? '접기' : '더보기' }}
        </button>
      </section>
    </div>
  </template>
  
  <script setup>
  import { reactive, computed, ref } from 'vue'
  
  const shorts = reactive([
    { id: 1, youtubeId: 'v=DaH7vF4GJFc', title: '인기순위 1위 카드 후기', playing: false },
    { id: 2, youtubeId: 'def456', title: '돔싹스 카드 발급 후기', playing: false },
    { id: 3, youtubeId: 'ghi789', title: '회사생활 에피소드', playing: false },
    { id: 4, youtubeId: 'jkl000', title: '신규카드 소개', playing: false },
    { id: 5, youtubeId: 'mno111', title: '애플페이 교통카드 소식', playing: false },
  ])
  
  const fulls = reactive([
    { id: 11, youtubeId: 'zzz999', title: '신용이란 무엇인가?', playing: false },
    { id: 12, youtubeId: 'yyy888', title: '대출 금리 이해하기', playing: false },
    { id: 13, youtubeId: 'xxx777', title: '예금과 적금 차이', playing: false },
  ])
  
  const showMoreShorts = ref(false)
  const showMoreFulls = ref(false)
  const maxVisibleShorts = 3
  const maxVisibleFulls = 2
  
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
  
  function play(video) {
    video.playing = true
  }
  </script>
  
  <style scoped>
  .education-video-page {
    padding: 2rem;
  }
  .video-section {
    margin-bottom: 3rem;
  }
  .video-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .video-card {
    width: 200px;
    position: relative;
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
  }
  .video-iframe {
    width: 100%;
    height: 180px;
    border-radius: 12px;
  }
  .more-btn {
    margin-top: 1rem;
    background: #444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
  }
  </style>