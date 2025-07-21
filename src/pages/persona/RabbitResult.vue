<template>
    <div class="result-wrapper">
      <div class="result-container">
        <!-- 프로필 -->
        <div class="profile-section">
          <img
            src="@/assets/character_images/rabbit.png"
            alt="토끼"
            class="persona-image"
          />
          <h3 class="type-describe">“카드 혜택 못 받으면 손해죠. 할인은 기본!”</h3>
          <div class="persona-text">
            <p class="label">머니버그님의 페르소나 동물은</p>
            <h2 class="type-name">토끼</h2>
            <br>
            <div class="tags">
              <span>#할인</span>
              <span>#포인트</span>
              <span>#실속</span>
              <span>#쇼핑 중심</span>
            </div>
          </div>
        </div>
  
        <!-- 성향 설명 -->
        <section class="section-box">
          <h3>✨ 당신은 소비 중심형 사용자입니다</h3>
          <p>당신은 토끼처럼 귀엽고 민감한 동물처럼 빠르게 반응하고 움직이는 성향이에요.
            혜택에 민감하고, 실속 있는 소비를 선호해요. 빠르고 트렌디한 소비자에요.
          </p>
        </section>
  
        <!-- 추천 상품 성향 -->
        <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
            <li>
            ✅ <strong>캐시백/포인트형 카드</strong><br />
            전월 실적 조건을 맞춰 다양한 혜택을 최대한 활용하는 걸 선호해요.
            </li>
            <li>
            ✅ <strong>쇼핑·이커머스 특화 카드</strong><br />
            쿠팡, 마켓컬리 등 온라인 소비 중심의 할인 혜택을 선호해요.
            </li>
            <li>
            ✅ <strong>짧은 주기 챌린지 적금</strong><br />
            26주 적금처럼 소액으로 재미있게 도전하는 형태를 좋아해요.
            </li>
        </ul>
        </section>


  
        <!-- 버튼 -->
        <button class="cta-button">내게 맞는 상품 보러 가기</button>
      </div>
    </div>
  </template>
  
  <script setup>
  // 버튼에 router.push('/recommendation') 등 연결 가능
  </script>
  
  <style scoped>
  .result-wrapper {
    background-color: #f4f6f8;
    padding: 2rem;
    display: flex;
    justify-content: center;
    min-height: 100vh;
  }
  
  .result-container {
    max-width: 720px;
    width: 100%;
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .persona-image {
    width: 130px;
    height: 130px;
  }
  
  .persona-text {
    text-align: center;
  }
  
  .label {
    font-size: 1rem;
    color: #444;
  }
  
  .type-name {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0.3rem 0;
  }
  .type-describe {
    font-size: 1.3rem;
    font-weight: bold;
    margin: 0.3rem 0;
  }
  
  .tags span {
    display: inline-block;
    background: #d8edda;
    color: #2e7d32;
    border-radius: 15px;
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    margin: 0 0.2rem;
  }
  
  .section-box {
    background-color: #fafafa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }
  
  .section-box h3 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    color: #444;
  }
  
  .section-box p {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.5;
  }
  
  .checklist li {
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: #333;
  }
  
  .cta-button {
    display: block;
    width: 100%;
    background-color: #4caf50;
    color: white;
    font-size: 1rem;
    padding: 1rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .cta-button:hover {
    background-color: #388e3c;
  }
  </style>
  