<template>
  <div class="my-page">
    <BaseCardGrey class="profile-section section-wide">
      <template #content>
        <section class="user-info">
          <div class="user-icon"></div>
          <div class="user-text">
            <p class="user-type">
              한푼 두푼 모아나가는
              <strong>돈 벌레 유형</strong>
            </p>
            <h2 class="user-name">
              홍길동님
              <span class="edit">수정하기</span>
            </h2>
            <p class="user-level">
              LV. 3
              <span class="level-bar"><span class="fill"></span></span>
              꿈을 새내기
            </p>
          </div>
        </section>
      </template>
      <template #title></template>
    </BaseCardGrey>

    <BaseCardGrey class="type-section section-wide">
      <template #content>
        <section class="change-type">
          <p>유형을 변경하고 싶다면?</p>
          <button class="edit-button">✏️</button>
        </section>
      </template>
      <template #title></template>
    </BaseCardGrey>

    <div class="left-grid">
      <BaseCardGrey>
        <template #title>뱃지</template>
        <template #content>
          <div class="badges">
            <div class="badge-placeholder">🎖</div>
            <div class="badge-placeholder">🎖</div>
            <div class="badge-placeholder">🎖</div>
          </div>
        </template>
      </BaseCardGrey>
      <BaseCardGrey>
        <template #title>보유 카드</template>
        <template #content>
          <div class="card-info">
            <div class="card">
              <h4>KB국민 LIV ON 카드</h4>
              <p>₩850,000</p>
              <p>**** **** **** 1324</p>
              <p>이번달 사용 금액</p>
            </div>
          </div>
        </template>
      </BaseCardGrey>
    </div>

    <div class="right-grid">
      <BaseCardGrey style="height: 100%">
        <template #title>내가 좋아하는 상품 (즐겨찾기)</template>
        <template #content>
          <div class="tabs">
            <button>예금</button>
            <button>적금</button>
            <button>카드</button>
          </div>
          <div class="product-list">
            <div class="product-card">예적금 예시 1</div>
            <div class="product-card">예적금 예시 2</div>
          </div>
        </template>
      </BaseCardGrey>
    </div>
  </div>
</template>

<script setup>
import BaseCardGrey from "@/components/base/BaseCardGrey.vue";
</script>

<style scoped>
/* Responsive grid layout for my-page */
.my-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 25vh 5vh 50vh;
  grid-template-areas:
    "profile profile"
    "type    type"
    "left    right";
  gap: 0.5rem;
  padding: 0.5rem;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  max-width: 1300px;
  margin: 0 auto;
}

.profile-section {
  grid-area: profile;
}
.type-section {
  grid-area: type;
}
.left-grid {
  grid-area: left;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  height: 100%;
}
.right-grid {
  grid-area: right;
}
.right-grid > * {
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  width: 50px;
  height: 50px;
  background-color: #eee;
  border-radius: 50%;
}

.user-text {
  flex: 1;
}

.user-type {
  font-size: 0.9rem;
  color: #666;
}

.user-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.user-name .edit {
  font-size: 0.9rem;
  font-weight: normal;
  color: var(--color-primary, #1abc9c);
  margin-left: 0.5rem;
  cursor: pointer;
}

.user-level {
  font-size: 0.8rem;
  color: #666;
}

.level-bar {
  display: inline-block;
  width: 100px;
  height: 6px;
  background-color: #ddd;
  border-radius: 3px;
  margin: 0 0.5rem;
  vertical-align: middle;
  position: relative;
}

.level-bar .fill {
  display: inline-block;
  height: 100%;
  width: 50%;
  background-color: var(--color-primary, #1abc9c);
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.change-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.edit-button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

.badges {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.25rem;
}

.badge-placeholder {
  font-size: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.tabs button {
  padding: 0.2rem 0.5rem;
  background-color: #e6f2ed;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
}

.card-info .card {
  background-color: #004a91;
  color: white;
  border-radius: 12px;
  padding: 0.5rem;
  text-align: left;
  font-size: 0.8rem;
}

.card-info .card h4 {
  margin-bottom: 0.5rem;
}

.section-wide {
  grid-column: span 2;
}

@media (min-width: 768px) {
  .my-page {
    /* The grid layout is already applied above for all screens */
    /* Optionally adjust gap for larger screens if desired: */
    gap: 1.5rem;
  }
}
</style>
