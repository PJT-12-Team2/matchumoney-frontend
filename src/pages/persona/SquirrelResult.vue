<template>
    <div class="result-wrapper">
      <div class="result-container">
        <!-- 프로필 -->
        <div class="profile-section">
          <img
            src="@/assets/character_images/squirrel.png"
            alt="다람쥐"
            class="persona-image"
          />
          <h3 class="type-describe">“저축은 습관입니다. 목표를 세우고 꾸준히 가야죠.”</h3>
          <div class="persona-text">
            <p class="label">머니버그님의 페르소나 동물은</p>
            <h2 class="type-name">다람쥐</h2>
            <br>
            <div class="tags">
              <span>#우대 조건</span>
              <span>#목표 설정</span>
              <span>#자동화</span>
              <span>#계획적인 소비</span>
            </div>
          </div>
        </div>
  
        <!-- 성향 설명 -->
        <section class="section-box">
          <h3>✨ 당신은 계획적인 절약가형 사용자입니다</h3>
          <p style="white-space: pre-line;">
            당신은 다람쥐처럼 겨울을 대비해 먹이를 하나하나 저장하는 거처럼 알뜰하고 체계적인 성향이에요.
            계획적인 소비와 저축에 집중하며 미래 대비에 강해요. 체계적이며 자동이체나 목표 설정에 능숙해요.
          </p>
        </section>
  
        <!-- 추천 상품 성향 -->
        <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
            <li>
            ✅ <strong>목표 설정형 예·적금</strong><br />
            저축 목표를 세우고, 자동이체로 꾸준히 모으는 습관이 있어요.
            </li>
            <li>
            ✅ <strong>우대 조건 활용 상품</strong><br />
            급여이체나 카드 실적 등 조건을 꼼꼼히 따져 혜택을 챙겨요.
            </li>
            <li>
            ✅ <strong>계획 소비 리워드형 카드</strong><br />
            무실적보다는 계획적 사용에 따라 리워드를 받는 구조를 선호해요.
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
  .type-describe {
    font-size: 1.3rem;
    font-weight: bold;
    margin: 0.3rem 0;
  }
  </style>
  