<template>
    <div class="card-recommendation-wrapper">
      <section class="main-section">
        <!-- 🎠 캐릭터 슬라이더 -->
        <div class="slider-container">
          <div class="slider-track">
            <img
              v-for="(card, index) in [...cards, ...cards]"
              :key="index"
              :src="card"
              class="card-img"
            />
          </div>
        </div>
  <br>
        <!-- 텍스트 & 버튼 -->
        <div class="text-box">
          <h2>나만의 페르소나 테스트</h2>
          <p>테스트를 통해 나에게 맞는 금융상품 추천받기</p>
          <br>
          <button class="start-button" @click="goToTest">START</button>
          <!-- 기존 START 버튼 아래에 추가하세요 -->
<p class="note">※ 총 10문항 / 소요 시간 약 2분</p>
<br>
<div class="testimonial-wrapper">
  <div class="testimonial-box">
    <transition name="fade" mode="out-in">
      <div class="testimonial-content" :key="currentIndex">
        <img :src="testimonials[currentIndex].img" alt="사용자 사진" class="user-img" />
        <div class="text-content">
          <div class="user-name">{{ testimonials[currentIndex].name }}</div>
          <div class="user-review">{{ testimonials[currentIndex].text }}</div>
        </div>
      </div>
    </transition>
  </div>
</div>

        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  const cards = [
    new URL('@/assets/character_images/ant.png', import.meta.url).href,
    new URL('@/assets/character_images/cat.png', import.meta.url).href,
    new URL('@/assets/character_images/owl.png', import.meta.url).href,
    new URL('@/assets/character_images/penguin.png', import.meta.url).href,
    new URL('@/assets/character_images/rabbit.png', import.meta.url).href,
    new URL('@/assets/character_images/squirrel.png', import.meta.url).href,
    new URL('@/assets/character_images/tiger.png', import.meta.url).href,
    new URL('@/assets/character_images/turtle.png', import.meta.url).href,
  ]
  
  const router = useRouter()
  const goToTest = () => {
    router.push('/survey')
  }

const testimonials = [
  {
    name: '김O지',
    text: '카드 혜택을 몰랐는데, 이걸로 바꿨더니 캐시백이 쏠쏠해요!',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '이O현',
    text: '저축만 하던 저에게 투자형 카드를 추천해줘서 색다르고 좋아요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '박O우',
    text: '페르소나 동물이 너무 귀엽고, 결과도 정확해서 신뢰가 갔어요!',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  // ...최대 10개까지 추가 가능
]

const currentIndex = ref(0)
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % testimonials.length
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

const currentTestimonial = ref(0)


onMounted(() => {
  intervalId = setInterval(() => {
    currentTestimonial.value =
      (currentTestimonial.value + 1) % testimonials.length
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
  </script>
  
  <style scoped>
  .card-recommendation-wrapper {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  
  .main-section {
    text-align: center;
    width: 100%;
    max-width: 1200px;
  }
  
  .slider-container {
    overflow: hidden;
    width: 100%;
    margin-bottom: 2rem;
  }
  
  .slider-track {
    display: flex;
    width: calc(250px * 16);
    animation: scroll 20s linear infinite;
    gap: 2rem;
  }
  
  .card-img {
  width: 200px;
  height: auto;
  border-radius: 12px;
  margin: 0 1rem;
  flex-shrink: 0;
  box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1); /* 💡 그림자 효과 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-img:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); /* 💡 hover 시 더 강조 */
}
  
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .text-box h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .text-box p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .start-button {
    background: black;
    color: white;
    padding: 1.5rem 2.8rem;
    font-size: 1.3rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 1rem;
  }
  
  .premium-button {
    background: linear-gradient(to right, #453222, #b27950);
    color: white;
    font-size: 0.95rem;
    padding: 0.9rem 2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .note {
  color: #666;
  font-size: 0.95rem;
  margin-top: 1.2rem;
}
.testimonial-wrapper {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.testimonial-box {
  background: #fff;
  padding: 1.5rem;
  width: 90%;
  max-width: 720px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.testimonial-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
  color: #333;
}

.user-review {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
}

/* 페이드 전환 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


  </style>