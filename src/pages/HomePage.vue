<template>
  <div class="main-page">
    <!-- 슬라이더 컨테이너 -->
    <div class="slider-container">
      <!-- 슬라이드 래퍼 -->
      <div
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div class="slider-slide">
          <section class="slide hero-section">
            <div class="container">
              <div class="hero-content-wrapper">
                <div class="hero-left">
                  <div class="hero-content">
                    <h1 class="hero-title">
                      나만의
                      <span class="text-accent">금융 라이프스타일을</span><br />
                      찾아보세요
                    </h1>
                    <p class="hero-description">
                      8가지 동물 페르소나 분석을 통해 당신에게 딱 맞는 카드, 예금,
                      적금 상품을 추천해드립니다.
                    </p>
                    <div class="hero-buttons">
                      <button
                        class="btn persona-start-btn"
                        @click="startPersonaTest"
                      >
                        <i class="icon-play"></i>
                        페르소나 테스트 시작
                      </button>
                    </div>
                  </div>
                </div>
                <div class="hero-right">
                  <div class="hero-image">
                    <div class="hero-main-icon">
                      <div class="icon-bg">
                        <img
                          src="@/assets/bankLogo_images/BK_DAEGU_Profile.png"
                          alt="페르소나 이미지"
                          class="persona-image"
                        />
                      </div>
                      <div class="floating-cards">
                        <div class="floating-card card-1">
                          <i class="icon-credit-card"></i>
                        </div>
                        <div class="floating-card card-2">
                          <i class="icon-bank"></i>
                        </div>
                        <div class="floating-card card-3">
                          <i class="icon-chart"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="slider-slide">
          <section class="slide features-section">
            <div class="container">
              <div class="section-header text-center">
                <h2 class="section-title">왜 맞춤머니인가요?</h2>
                <p class="section-subtitle">개인화된 금융 서비스의 새로운 기준</p>
              </div>
              <div class="features-grid grid grid-cols-3">
                <div
                  v-for="feature in features"
                  :key="feature.id"
                  class="feature-item"
                >
                  <div class="card feature-card">
                    <div class="feature-icon">
                      <i :class="feature.icon"></i>
                    </div>
                    <h5 class="feature-title">{{ feature.title }}</h5>
                    <p class="feature-description">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="slider-slide">
          <section class="slide persona-section">
            <div class="container">
              <div class="section-header text-center">
                <h2 class="section-title">8가지 동물 페르소나</h2>
                <p class="section-subtitle">
                  당신은 어떤 금융 성향을 가지고 있나요?
                </p>
              </div>
              <div class="persona-grid grid grid-cols-4">
                <div
                  v-for="persona in personas"
                  :key="persona.id"
                  class="persona-item"
                >
                  <div class="card persona-card">
                    <div class="persona-emoji">{{ persona.emoji }}</div>
                    <h6 class="persona-name">{{ persona.name }}</h6>
                    <p class="persona-trait">{{ persona.trait }}</p>
                  </div>
                </div>
              </div>
              <div class="text-center mt-5">
                <button
                  class="btn btn-primary btn-large"
                  @click="startPersonaTest"
                >
                  <i class="icon-arrow-right"></i>
                  나의 페르소나 찾기
                </button>
              </div>
            </div>
          </section>
        </div>
        <div class="slider-slide">
          <section class="slide products-section">
            <div class="container">
              <div class="section-header text-center">
                <h2 class="section-title">맞춤형 금융상품 추천</h2>
                <p class="section-subtitle">
                  페르소나 분석과 마이데이터를 통한 개인화된 추천
                </p>
              </div>
              <div class="products-grid grid grid-cols-3">
                <div
                  v-for="product in products"
                  :key="product.id"
                  class="product-item"
                >
                  <div class="card product-card">
                    <div class="product-header">
                      <div class="product-icon-container">
                        <i :class="product.icon"></i>
                      </div>
                      <div class="product-info">
                        <h5 class="product-title">{{ product.title }}</h5>
                        <small class="product-subtitle">{{
                          product.subtitle
                        }}</small>
                      </div>
                    </div>
                    <p class="product-description">{{ product.description }}</p>
                    <ul class="product-benefits">
                      <li
                        v-for="benefit in product.benefits"
                        :key="benefit"
                        class="benefit-item"
                      >
                        <i class="icon-check"></i>
                        <small>{{ benefit }}</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="slider-slide">
          <section class="slide mydata-section">
            <div class="container">
              <div class="mydata-content-wrapper">
                <div class="mydata-left">
                  <h2 class="mydata-title">마이데이터 연동</h2>
                  <p class="mydata-description">
                    실제 거래내역을 분석하여 더욱 정확한 맞춤형 카드를
                    추천받으세요.
                  </p>
                  <div class="mydata-features">
                    <div class="mydata-feature">
                      <i class="icon-shield mydata-icon"></i>
                      <div class="mydata-feature-content">
                        <h6 class="mydata-feature-title">안전한 데이터 연동</h6>
                        <small class="mydata-feature-desc"
                          >CODEF를 통한 보안 연동</small
                        >
                      </div>
                    </div>
                    <div class="mydata-feature">
                      <i class="icon-chart mydata-icon"></i>
                      <div class="mydata-feature-content">
                        <h6 class="mydata-feature-title">소비 패턴 분석</h6>
                        <small class="mydata-feature-desc"
                          >Chart.js 기반 시각화</small
                        >
                      </div>
                    </div>
                    <div class="mydata-feature">
                      <i class="icon-lightbulb mydata-icon"></i>
                      <div class="mydata-feature-content">
                        <h6 class="mydata-feature-title">개인화된 추천</h6>
                        <small class="mydata-feature-desc"
                          >실사용 패턴 기반 맞춤 추천</small
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mydata-right">
                  <div class="mydata-visual">
                    <div class="mydata-demo-card">
                      <div class="demo-grid">
                        <div class="demo-item">
                          <i class="icon-credit-card demo-icon"></i>
                          <div class="demo-text">KB카드</div>
                        </div>
                        <div class="demo-item">
                          <i class="icon-chart demo-icon"></i>
                          <div class="demo-text">분석</div>
                        </div>
                        <div class="demo-item demo-highlight">
                          <i class="icon-star demo-icon"></i>
                          <div class="demo-text">맞춤 추천</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 슬라이드 인디케이터 -->
      <div class="slide-indicators">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          :class="['indicator', { active: currentSlide === index }]"
          @click="goToSlide(index)"
        >
          {{ slide.name }}
        </button>
      </div>

      <!-- 슬라이드 네비게이션 -->
      <div class="slide-navigation">
        <button class="nav-btn prev-btn" @click="prevSlide">
          <i class="icon-arrow-left"></i>
        </button>
        <button class="nav-btn next-btn" @click="nextSlide">
          <i class="icon-arrow-right"></i>
        </button>
      </div>

      <!-- 자동 재생 컨트롤 -->
      <div class="auto-play-control">
        <button class="play-pause-btn" @click="toggleAutoPlay">
          <i :class="isAutoPlaying ? 'icon-pause' : 'icon-play'"></i>
        </button>
      </div>
    </div>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container text-center">
        <h2 class="cta-title">지금 시작해보세요!</h2>
        <p class="cta-description">
          2분만 투자하면 당신만의 금융 페르소나를 찾을 수 있습니다.
        </p>
        <div class="cta-buttons">
          <button
            class="btn persona-start-btn btn-large"
            @click="startPersonaTest"
          >
            <i class="icon-play"></i>
            페르소나 테스트 시작
          </button>
          <button class="btn btn-outline-light btn-large" @click="goToSignup">
            <i class="icon-user-plus"></i>
            무료 회원가입
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-left">
            <h5 class="footer-title">
              <i class="icon-piggy-bank"></i>
              맞춤머니
            </h5>
            <p class="footer-description">개인 맞춤형 금융상품 추천 서비스</p>
          </div>
          <div class="footer-right">
            <div class="social-links">
              <a href="#" class="social-link"><i class="icon-facebook"></i></a>
              <a href="#" class="social-link"><i class="icon-twitter"></i></a>
              <a href="#" class="social-link"><i class="icon-instagram"></i></a>
              <a href="#" class="social-link"><i class="icon-linkedin"></i></a>
            </div>
          </div>
        </div>
        <hr class="footer-divider" />
        <div class="footer-bottom text-center">
          <small>&copy; 2024 맞춤머니. All rights reserved.</small>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 슬라이드 관련 상태
const currentSlide = ref(0);
const isAutoPlaying = ref(true);
let autoPlayInterval = null;

const slides = ref([
  { name: '홈' },
  { name: '특징' },
  { name: '페르소나' },
  { name: '상품' },
  { name: '마이데이터' },
]);

// 기존 데이터
const features = ref([
  {
    id: 1,
    icon: 'icon-user-heart text-accent',
    title: '페르소나 기반 추천',
    description:
      '8가지 동물 페르소나를 통한 맞춤형 금융상품 추천으로 당신에게 딱 맞는 상품을 찾아드립니다.',
  },
  {
    id: 2,
    icon: 'icon-chart text-accent',
    title: '마이데이터 연동',
    description:
      '실제 거래내역 분석을 통한 개인화된 카드 추천으로 더욱 정확한 맞춤 서비스를 제공합니다.',
  },
  {
    id: 3,
    icon: 'icon-collection text-accent',
    title: '원스톱 플랫폼',
    description:
      '카드, 예금, 적금 상품을 한 곳에서 비교하고 추천받을 수 있는 통합 금융 플랫폼입니다.',
  },
]);

const personas = ref([
  { id: 1, emoji: '🐢', name: '거북이', trait: '안정적인 투자성향' },
  { id: 2, emoji: '🐿️', name: '다람쥐', trait: '꼼꼼한 저축형' },
  { id: 3, emoji: '🐜', name: '개미', trait: '성실한 적금형' },
  { id: 4, emoji: '🦉', name: '부엉이', trait: '신중한 분석형' },
  { id: 5, emoji: '🐰', name: '토끼', trait: '활발한 소비형' },
  { id: 6, emoji: '🐱', name: '고양이', trait: '자유로운 라이프스타일' },
  { id: 7, emoji: '🐅', name: '호랑이', trait: '적극적인 투자형' },
  { id: 8, emoji: '🐧', name: '펭귄', trait: '균형잡힌 관리형' },
]);

const products = ref([
  {
    id: 1,
    icon: 'icon-credit-card text-accent',
    title: '카드 추천',
    subtitle: '맞춤형 신용카드',
    description: '페르소나와 소비패턴을 분석하여 최적의 카드를 추천합니다.',
    benefits: ['연회비 최적화', '혜택 맞춤 분석', '실시간 비교'],
  },
  {
    id: 2,
    icon: 'icon-bank text-accent',
    title: '예금 추천',
    subtitle: '안전한 예금상품',
    description: '안정적인 수익을 원하는 분들을 위한 예금상품을 추천합니다.',
    benefits: ['높은 금리', '예치 기간 선택', '원금 보장'],
  },
  {
    id: 3,
    icon: 'icon-piggy-bank text-accent',
    title: '적금 추천',
    subtitle: '목돈 마련 적금',
    description: '목표 달성을 위한 체계적인 적금상품을 추천합니다.',
    benefits: ['목표 설정', '자동 이체', '우대 금리'],
  },
]);

// 슬라이드 메서드
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0 ? slides.value.length - 1 : currentSlide.value - 1;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value;
  if (isAutoPlaying.value) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
};

const startAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
};

// 기존 메서드
const startPersonaTest = () => {
  console.log('페르소나 테스트 시작');
  alert('페르소나 테스트 페이지로 이동합니다.');
};

const exploreProducts = () => {
  console.log('금융상품 둘러보기');
  alert('금융상품 페이지로 이동합니다.');
};

const goToLogin = () => {
  console.log('로그인 페이지로 이동');
  alert('로그인 페이지로 이동합니다.');
};

const goToSignup = () => {
  console.log('회원가입 페이지로 이동');
  alert('회원가입 페이지로 이동합니다.');
};

const connectMyData = () => {
  console.log('마이데이터 연동');
  alert('마이데이터 연동 페이지로 이동합니다.');
};

// 라이프사이클
onMounted(() => {
  console.log('맞춤머니 메인 페이지 로드됨');
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style>
.default-layout {
  padding: 0 !important;
}

/* CSS 변수 정의 */
:root {
  --color-accent: #22c55e;
  --color-secondary: #16a34a;
  --color-primary: #059669;
  --color-primary-10: #f0fdf4;
  --color-secondary-10: #f0fdf4;
  --color-accent-10: #dcfce7;
  --color-dark: #1f2937;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --text-secondary: #6b7280;
  --bg-body: #ffffff;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 2.5rem;
  --spacing-3xl: 3rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 슬라이더 스타일 */
.slider-container {
  position: relative;
  overflow: hidden;
  height: 100vh;
}

.slider-wrapper {
  display: flex;
  width: calc(100% * 5); /* 5 slides */
  height: 100vh;
  transition: transform 0.8s ease;
}

.slider-slide {
  flex: 0 0 100%;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100vh;
}

.slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 슬라이드 인디케이터 */
.slide-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.indicator {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

.indicator.active {
  background: rgba(34, 197, 94, 0.9);
  border-color: rgba(34, 197, 94, 1);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* 슬라이드 네비게이션 */
.slide-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 10;
  pointer-events: none;
}

.nav-btn {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 자동 재생 컨트롤 */
.auto-play-control {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 10;
}

.play-pause-btn {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.play-pause-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 기존 스타일 수정 */
.hero-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
}

.features-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%);
}

.persona-section {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
}

.products-section {
  background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
}

.mydata-section {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

/* 컨테이너 및 그리드 스타일 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.text-center {
  text-align: center;
}

.text-accent {
  color: var(--color-accent);
}

.mt-5 {
  margin-top: 3rem;
}

/* 카드 스타일 */
.card {
  background: white;
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* 버튼 스타일 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
}

.persona-start-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
}

.persona-start-btn:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.btn-outline-light {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline-light:hover {
  background-color: white;
  color: var(--color-accent);
}

/* Hero Section */
.hero-content-wrapper {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--spacing-3xl);
  align-items: center;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
}

.persona-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}

.hero-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Hero Image */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.hero-main-icon {
  position: relative;
}

.icon-bg {
  width: 400px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-cards {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  animation: float 3s ease-in-out infinite;
}

.floating-card i {
  font-size: 1.5rem;
}

.card-1 {
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.card-3 {
  top: 40%;
  left: 10%;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Section Header */
.section-header {
  margin-bottom: var(--spacing-3xl);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

/* Feature Cards */
.features-grid {
  gap: var(--spacing-xl);
}

.feature-card {
  text-align: center;
  height: 100%;
}

.feature-icon {
  margin-bottom: var(--spacing-lg);
}

.feature-icon i {
  font-size: 3rem;
  color: var(--color-accent);
}

.feature-title {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Persona Cards */
.persona-grid {
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
}

.persona-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.persona-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-5px);
}

.persona-emoji {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.persona-name {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.persona-trait {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Product Cards */
.products-grid {
  gap: var(--spacing-xl);
}

.product-card {
  height: 100%;
}

.product-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.product-icon-container {
  width: 60px;
  height: 60px;
  background: var(--color-accent-10);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-icon-container i {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.product-title {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-xs);
}

.product-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.product-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.product-benefits {
  list-style: none;
  padding: 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.benefit-item i {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
}

/* MyData Section */
.mydata-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
}

.mydata-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-lg);
}

.mydata-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.mydata-features {
  margin-bottom: var(--spacing-xl);
}

.mydata-feature {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.mydata-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.mydata-feature-title {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-xs);
}

.mydata-feature-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm); 
}

/* MyData Visual */
.mydata-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mydata-demo-card {
  background: white;
  border-radius: 16px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  animation: pulse 2s ease-in-out infinite;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  width: 200px;
}

.demo-item {
  background: var(--color-gray-50);
  border-radius: 8px;
  padding: var(--spacing-md);
  text-align: center;
  transition: all 0.3s ease;
}

.demo-highlight {
  background: var(--color-accent-10);
  grid-column: 1 / -1;
}

.demo-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
  margin-bottom: var(--spacing-sm);
}

.demo-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-dark);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-3xl) 0;
  background-color: var(--color-accent);
  color: white;
}

.cta-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: white;
  margin-bottom: var(--spacing-lg);
}

.cta-description {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-xl);
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  background-color: var(--color-dark);
  color: var(--color-gray-300);
  padding: var(--spacing-xl) 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.footer-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: white;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.footer-description {
  color: var(--color-gray-400);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  color: var(--color-gray-400);
  font-size: var(--font-size-lg);
  transition: color 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  color: white;
}

.footer-divider {
  border: none;
  height: 1px;
  background-color: var(--color-gray-700);
  margin: var(--spacing-lg) 0;
}

.footer-bottom {
  color: var(--color-gray-500);
}

/* Icon Classes */
.icon-play::before {
  content: '▶';
}
.icon-pause::before {
  content: '⏸';
}
.icon-arrow-left::before {
  content: '←';
}
.icon-arrow-right::before {
  content: '→';
}
.icon-search::before {
  content: '🔍';
}
.icon-piggy-bank::before {
  content: '🐷';
}
.icon-credit-card::before {
  content: '💳';
}
.icon-bank::before {
  content: '🏦';
}
.icon-chart::before {
  content: '📊';
}
.icon-user-heart::before {
  content: '👤❤';
}
.icon-collection::before {
  content: '📑';
}
.icon-check::before {
  content: '✓';
}
.icon-shield::before {
  content: '🛡';
}
.icon-lightbulb::before {
  content: '💡';
}
.icon-link::before {
  content: '🔗';
}
.icon-star::before {
  content: '⭐';
}
.icon-user-plus::before {
  content: '👤+';
}
.icon-facebook::before {
  content: 'f';
}
.icon-twitter::before {
  content: '🐦';
}
.icon-instagram::before {
  content: '📷';
}
.icon-linkedin::before {
  content: 'in';
}

/* Responsive Design */
@media (max-width: 768px) {
  .slider-container {
    height: auto;
    min-height: 100vh;
  }

  .slider-slide {
    height: auto;
    min-height: 100vh;
    padding: 2rem 0;
  }
  .slide {
    height: 100%;
    min-height: 100vh;
    padding: 0;
  }

  .hero-content-wrapper,
  .mydata-content-wrapper {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .features-grid,
  .products-grid {
    grid-template-columns: 1fr;
  }

  .persona-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .floating-cards {
    display: none;
  }

  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn-large {
    width: 100%;
    max-width: 300px;
  }

  .slide-indicators {
    bottom: 20px;
    flex-direction: column;
    gap: 0.5rem;
  }

  .indicator {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .slide-navigation {
    padding: 0 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .auto-play-control {
    top: 20px;
    right: 20px;
  }

  .play-pause-btn {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .persona-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: var(--font-size-2xl);
  }

  .cta-title {
    font-size: var(--font-size-2xl);
  }

  .mydata-title {
    font-size: var(--font-size-2xl);
  }

  .slide-indicators {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .indicator {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
