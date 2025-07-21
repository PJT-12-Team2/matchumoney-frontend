<template>
    <div class="result-wrapper">
      <div class="result-container">
        <!-- 프로필 -->
        <div class="profile-section">
          <img
            src="@/assets/character_images/ant.png"
            alt="개미"
            class="persona-image"
          />
          <h3 class="type-describe">“계획은 끝났고, 이제는 실천이죠.”</h3>
          <div class="persona-text">
            <p class="label">머니버그님의 페르소나 동물은</p>
            <h2 class="type-name">개미</h2>
            <br>
            <div class="tags">
              <span>#실천력</span>
              <span>#분산</span>
              <span>#소액 관리</span>
              <span>#자동 투자</span>
            </div>
          </div>
        </div>
  
        <!-- 성향 설명 -->
        <section class="section-box">
          <h3>✨ 당신은 재테크 실천가형 사용자입니다</h3>
          <p>
            당신은 개미처럼 '근면성실함'의 대명사이며, 일 벌이는데 적극적이에요.
            정보 수집보다는 행동 중심이라서 분산 투자에 능하며 실천력이 있어요.
            부지런하고, 실행에 빠르며 자기주도적인 성향이에요.
          </p>
        </section>
  
        <!-- 추천 상품 성향 -->
        <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
            <li>
            ✅ <strong>자유납입형 적금 상품</strong><br />
            월 납입 금액을 유연하게 조정하며 꾸준히 실천하는 걸 선호해요.
            </li>
            <li>
            ✅ <strong>펀드·ETF 연계형 적금</strong><br />
            소액으로도 투자가 가능한 상품을 선호하고, 분산 투자에 익숙해요.
            </li>
            <li>
            ✅ <strong>실적에 따라 리워드 제공 카드</strong><br />
            혜택이 자동으로 누적되는 구조를 선호하고, 실천이 보상으로 이어지길 원해요.
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
  