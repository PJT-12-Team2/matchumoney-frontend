<template>
    <div class="survey-wrapper">
      <!-- 진행도 -->
      <div class="progress-container">
        <div class="progress-text">{{ animatedIndex }}/{{ totalQuestions }}</div>
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            :style="{ width: `${(currentQuestionIndex + 1) / totalQuestions * 100}%` }"
          ></div>
        </div>
      </div>
  
      <!-- 질문 -->
      <div class="question">
        <h2>Q{{ currentQuestionIndex + 1 }}. {{ questions[currentQuestionIndex].question }}</h2>
      </div>
  
      <!-- 선택지 -->
      <div class="choice-list">
        <button
          v-for="(choice, index) in questions[currentQuestionIndex].choices"
          :key="index"
          class="choice-btn"
          @click="nextQuestion(choice)"
        >
          {{ choice.label }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const totalQuestions = 10
  const currentQuestionIndex = ref(0)
  const animatedIndex = ref(0)
  const answers = ref([])
  const questions = [
    {
      question: '친구가 추천한 카드 2개! 당신의 선택은?',
      choices: [
        { label: '디자인이 귀엽고 굿즈도 받을 수 있는 팬카드' },
        { label: '쿠팡/컬리 할인 혜택 가득한 카드' },
        { label: '무실적이어도 혜택은 꽤 주는 기본형 카드' },
        { label: '직접 혜택을 구성할 수 있는 DIY 카드' }
      ]
    },
    {
      question: '갑자기 생긴 10만 원! 당신의 선택은?',
      choices: [
        { label: '다 쓰긴 아깝다… 자유적금에 넣자' },
        { label: '반은 소비, 반은 펀드에 자동이체 설정' },
        { label: '이건 타이거 ETF 살 찬스지!' },
        { label: '좋아하는 브랜드의 한정판 상품 구입' }
      ]
    },
    {
      question: '카드 디자인이 너무 예쁜데 혜택은 별로야. 당신은?',
      choices: [
        { label: '그래도 예쁘니까 쓰고 싶다' },
        { label: '혜택이 없으면 안 사요' },
        { label: '혜택 분석부터 다시 해보자' },
        { label: '이런 건 고민할 필요가 없지, 패스' }
      ]
    },
    {
      question: '적금 고를 때 당신의 기준은?',
      choices: [
        { label: '목표 설정형, 자동이체 가능!' },
        { label: '우대 조건 많지만 그만큼 금리도 높음' },
        { label: 'ESG 기부 연계형 적금! 가치 있다' },
        { label: '원금 보장 + 예금자 보호는 필수' }
      ]
    },
    {
      question: '나는 평소 돈에 대해…',
      choices: [
        { label: '무조건 안전! 잃지 않는 게 중요' },
        { label: '좀 불안하지만 투자 공부는 하고 있어요' },
        { label: '돈은 굴려야 느는 것!' },
        { label: '돈도 나를 표현하는 수단이에요' }
      ]
    },
    {
      question: '나에게 ‘좋은 카드’란?',
      choices: [
        { label: '내가 원하는 혜택을 고를 수 있는 카드' },
        { label: '조건 없어도 기본 혜택이 탄탄한 카드' },
        { label: '실적을 맞추면 혜택이 엄청 커지는 카드' },
        { label: '교통/통신비 할인되는 실속 카드' }
      ]
    },
    {
      question: '금융 앱을 설치하면 가장 먼저 보는 건?',
      choices: [
        { label: '카드 혜택 비교 탭' },
        { label: '추천 예/적금 리스트' },
        { label: '투자 뉴스나 수익률 그래프' },
        { label: '테마 있는 기획 카드 (굿즈, ESG 등)' }
      ]
    },
    {
      question: '주말에 금융 관련 콘텐츠를 본다면?',
      choices: [
        { label: '카드사별 혜택 비교 영상' },
        { label: '“MZ 재테크 성공기” 인터뷰' },
        { label: '“감성 소비 브이로그”' },
        { label: '잘 안 봄... 스트레스야' }
      ]
    },
    {
      question: '당신의 평소 소비 습관은?',
      choices: [
        { label: '똑같은 거라도 할인받을 수 있으면 좋다' },
        { label: '무계획 소비는 불안하다' },
        { label: '비싸도 가치가 있다고 느끼면 산다' },
        { label: '지출보다는 저축이 우선이다' }
      ]
    },
    {
      question: '신용카드 신규 발급하려고 할 때 나는?',
      choices: [
        { label: '블로그/커뮤니티 후기까지 꼼꼼히 분석' },
        { label: '실적 조건 계산해서 얼마나 이득인지 따짐' },
        { label: '예쁜 디자인 + 팬카드 혜택이면 끝' },
        { label: '실적 복잡한 건 싫다, 깔끔한 게 좋아' }
      ]
    }
  ]
  const nextQuestion = (choice) => {
  answers.value.push(choice.label)

  if (currentQuestionIndex.value < totalQuestions - 1) {
    currentQuestionIndex.value++
  } else {
    console.log('설문 완료:', answers.value)
    const calculatedType = calculatePersona(answers.value)
    router.push(`/${calculatedType}`)
  }
}

  // 타입 계산 로직 예시
  const calculatePersona = (answers) => {
    // 아주 간단한 예시: 첫 번째 답변에 따라 결과 정하기
    const first = answers[0]
    if (first.includes('DIY')) return 'turtle'
    if (first.includes('팬카드')) return 'cat'
    if (first.includes('할인 혜택')) return 'ant'
    return 'rabbit' // 기본값
  }

  const animateCounter = () => {
    const target = currentQuestionIndex.value + 1
    let count = 0
    const interval = setInterval(() => {
      if (count < target) {
        count++
        animatedIndex.value = count
      } else {
        clearInterval(interval)
      }
    }, 25)
  }

  onMounted(() => {
    animateCounter()
  })

  watch(currentQuestionIndex, () => {
    animateCounter()
  })
</script>
  
  <style scoped>
  .survey-wrapper {
    max-width: 800px;
    margin: 3rem auto;
    background-color: var(--bg-content);
    padding: 3rem;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-light);
  }
  
  .progress-container {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .progress-text {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .progress-bar {
    height: 6px;
    background-color: var(--border-light);
    border-radius: 6px;
    margin-top: 6px;
    position: relative;
  }
  
  .progress-bar-fill {
    height: 6px;
    background-color: var(--color-dark);
    border-radius: 6px;
    position: absolute;
    top: 0;
    left: 0;
    transition: width 0.5s ease;
  }
  
  .question {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .question h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-dark);
  }
  
  .choice-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .choice-btn {
    width: 100%;
    max-width: 500px;
    padding: var(--spacing-md) var(--spacing-lg);
    background-color: var(--color-white);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    border-radius: 8px;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;
    text-align: center;
    cursor: pointer;
  }
  
  .choice-btn:hover {
    background-color: var(--bg-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  </style>
  