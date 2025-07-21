<template>
    <div class="result-wrapper">
      <div class="result-container">
        <!-- 프로필 -->
        <div class="profile-section">
          <img
            src="@/assets/character_images/tiger.png"
            alt="호랑이"
            class="persona-image"
          />
          <h3 class="type-describe">“수익을 원한다면 리스크는 감수해야지.”</h3>
          <div class="persona-text">
            <p class="label">머니버그님의 페르소나 동물은</p>
            <h2 class="type-name">호랑이</h2>
            <br>
            <div class="tags">
              <span>#수익 추구</span>
              <span>#자동 투자</span>
              <span>#ETF/펀드 연계</span>
            </div>
          </div>
        </div>
  
        <!-- 성향 설명 -->
        <section class="section-box">
          <h3>✨ 당신은 성장 투자형 사용자입니다</h3>
          <p>
            당신은 호랑이처럼 대담하고 사냥을 즐기며, 리더쉽과 권위적인 성향이에요.
            수익 중심으로 적극적인 자산 운용을 추구해요. 공격적인 투자자로서 빠른 판단과 행동을 해요.
          </p>
        </section>
  
        <!-- 추천 상품 성향 -->
        <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
            <li>
            ✅ <strong>ETF·펀드 연계 적금</strong><br />
            수익률을 고려해 투자형 적금을 활용하며 장기 성장을 도모해요.
            </li>
            <li>
            ✅ <strong>자동 포인트 투자 카드</strong><br />
            카드 사용 시 리워드를 자동으로 투자하는 구조를 선호해요.
            </li>
            <li>
            ✅ <strong>공격형 자산관리 상품</strong><br />
            TDF(타깃 데이트 펀드)나 주식 기반 포트폴리오에 관심이 많아요.
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
  