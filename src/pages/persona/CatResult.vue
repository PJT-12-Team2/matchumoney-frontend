<template>
    <div class="result-wrapper">
      <div class="result-container">
        <!-- 프로필 -->
        <div class="profile-section">
          <img
            src="@/assets/character_images/cat.png"
            alt="고양이"
            class="persona-image"
          />
          <h3 class="type-describe">“나의 금융에도 감성과 개성이 있어야죠.”</h3>
          <div class="persona-text">
            <p class="label">머니버그님의 페르소나 동물은</p>
            <h2 class="type-name">고양이</h2>
            <br>
            <div class="tags">
              <span>#디자인</span>
              <span>#감성</span>
              <span>#브랜딩</span>
              <span>#표현</span>
            </div>
          </div>
        </div>
  
        <!-- 성향 설명 -->
        <section class="section-box">
          <h3>✨ 당신은 자기표현형 사용자입니다</h3>
          <p>당신은 고양이처럼 독립적이며, 자신의 취향과 감정에 매우 민감해요.
            개성 있는 소비를 중요시해요. 디자인과 브랜드를 중점으로 감성적이고 SNS 및 트렌드에 민감해요.
          </p>
        </section>
  
        <!-- 추천 상품 성향 -->
        <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
            <li>
            ✅ <strong>디자인 선택 가능한 감성 카드</strong><br />
            혜택보다는 감각적인 디자인과 브랜드 이미지가 더 중요해요.
            </li>
            <li>
            ✅ <strong>팬덤/브랜드 연계 적금</strong><br />
            내가 좋아하는 아이돌이나 브랜드와 연결된 상품이면 더 끌려요.
            </li>
            <li>
            ✅ <strong>ESG 등 가치 소비 테마 상품</strong><br />
            소비를 통해 나의 신념이나 정체성을 표현하는 걸 좋아해요.
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
  