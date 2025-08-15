<!-- QuizEntry.vue -->
<template>
  <div class="quiz-entry-container">
    <div class="quiz-entry-content">
      <div class="header">
        <h1 class="title">📚 금융 퀴즈</h1>
        <p class="subtitle">매일 금융 지식을 늘려보세요!</p>
      </div>

      <div class="quiz-options">
        <div class="quiz-card daily-quiz" @click="goToDailyQuiz">
          <div class="quiz-icon">🌟</div>
          <h2>일일 퀴즈</h2>
          <p>매일 하나의 금융 퀴즈를 풀고 10XP를 획득하세요</p>
          <div class="quiz-reward">+10 XP</div>
        </div>

        <div class="quiz-card general-quiz" @click="goToFortune">
          <div class="quiz-icon">🔮</div>
          <h2>운세 보기</h2>
          <p>오늘의 운세를 확인해보세요</p>
          <div class="quiz-reward">오늘의 운세</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goToDailyQuiz = () => {
  router.push('/quiz/daily');
};

const goToFortune = () => {
  router.push('/fortune');
};
// const goToGeneralQuiz = () => {
//   router.push('/quiz/financial');
// };
</script>

<style scoped>
.quiz-entry-container {
  min-height: 100%;
  padding: var(--spacing-2xl) var(--spacing-lg);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.quiz-entry-content {
  max-width: 80%;
  margin: 0 auto;
}

.header {
  text-align: center;
  padding: 2rem;
  margin-bottom: 3rem;
  background-color: #f3f6f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  margin-bottom: var(--spacing-3xl);
}

.title {
  font-size: var(--font-size-4xl);
  font-weight: bold;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-lg) 0;
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-2xl);
}

.quiz-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.quiz-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.daily-quiz:hover {
  border: 2px solid var(--color-accent);
}

.general-quiz:hover {
  border: 2px solid var(--color-secondary);
}

.quiz-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
}

.quiz-card h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-lg) 0;
}

.quiz-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-xl) 0;
}

.quiz-reward {
  display: inline-block;
  background: var(--gradient-accent);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 20px;
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

.daily-quiz .quiz-reward {
  background: var(--gradient-accent);
}

.general-quiz .quiz-reward {
  background: var(--gradient-accent);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .quiz-entry-container {
    padding: var(--spacing-lg);
  }

  .title {
    font-size: var(--font-size-3xl);
  }

  .quiz-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .quiz-card {
    padding: var(--spacing-xl);
  }
}
</style>
