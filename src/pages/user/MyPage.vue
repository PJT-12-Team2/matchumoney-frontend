<template>
  <div class="my-page">
    <BaseCardGrey class="profile-section section-wide">
      <template #content>
        <section class="user-info">
          <div class="profile-image-placeholder">
            <img :src="personaImageUrl" alt="유형 이미지" class="profile-image" />
          </div>
          <div class="user-text">
            <div class="user-type">
              <p>
                {{ myPageInfo?.persona?.quote }}
                <strong>{{ myPageInfo?.persona?.nameKo }} 유형</strong>
              </p>
            </div>
            <h2 class="user-name">
              <span class="nickname">{{ user?.nickname ?? "정보 없음" }}</span>
              <span class="level-title">님</span>
              <span class="edit" @click="router.push('/myinfo')">수정하기</span>
            </h2>
            <p class="user-level">
              <span class="level-value">Lv. {{ level }}</span>
              <span class="level-title">금융 새내기</span>
            </p>
            <div class="level-bar">
              <div class="fill" :style="{ width: fillPercentage }"></div>
            </div>
          </div>
        </section>
      </template>
      <template #title></template>
    </BaseCardGrey>

    <BaseCardGrey class="type-section section-wide">
      <template #title>
        <section class="change-type type-inner">
          <p>유형을 변경하고 싶다면?</p>
          <button class="edit-button" @click="router.push('/persona/start')">✏️</button>
        </section>
      </template>
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
      </BaseCardGrey>
    </div>

    <div class="right-grid">
      <BaseCardGrey style="height: 100%">
        <template #title>내가 좋아하는 상품 (즐겨찾기)</template>
        <template #content>
          <div class="tabs">
            <button :class="{ active: selectedTab === '예금' }" @click="selectedTab = '예금'">예금</button>
            <button :class="{ active: selectedTab === '적금' }" @click="selectedTab = '적금'">적금</button>
            <button :class="{ active: selectedTab === '카드' }" @click="selectedTab = '카드'">카드</button>
          </div>
          <div class="product-list fade-in">
            <div
              v-for="(product, index) in getProductsByTab"
              :key="index"
              class="product-card"
              @click="!product.isFallback && selectProduct(product)"
              :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="product-header">
                <div class="bank-logo">
                  <template v-if="product.isFallback">
                    <img
                      v-if="selectedTab === '예금'"
                      src="@/assets/logo_dis.png"
                      alt="예금 이모지"
                      style="width: 100px; height: 100px" />
                    <img
                      v-else-if="selectedTab === '적금'"
                      src="@/assets/logo_dis.png"
                      alt="적금 이모지"
                      style="width: 100px; height: 100px" />
                    <img v-else src="@/assets/logo_dis.png" alt="카드 이모지" style="width: 100px; height: 100px" />
                  </template>
                  <template v-else>
                    <img v-if="product.productImage" :src="product.productImage" alt="카드 이미지" />
                    <img v-else :src="getBankLogo(product.bankName)" alt="은행 로고" />
                  </template>
                </div>
                <div class="product-info">
                  <h3>{{ product.isFallback ? "상품 없음" : product.productName }}</h3>
                </div>
              </div>
            </div>
          </div>
        </template>
      </BaseCardGrey>
    </div>
  </div>
</template>

<script setup>
const getPersonaImage = (fileName) => {
  if (!fileName) return "";
  return new URL(`../assets/character_images/${fileName}`, import.meta.url).href;
};

import BaseCardGrey from "@/components/base/BaseCardGrey.vue";
import { ref, computed, onMounted } from "vue";
import userApi from "@/api/user";
import { useRouter } from "vue-router";
const router = useRouter();
const user = ref({});
const exp = ref(0); // default exp
const level = computed(() => Math.floor(exp.value / 100) + 1);
const fillPercentage = computed(() => `${exp.value % 100}%`);
const selectedTab = ref("예금");

const favoriteSavings = ref([]);
const favoriteDeposits = ref([]);
const favoriteCards = ref([]);
const products = ref([]);
const myPageInfo = ref({ persona: {} });
const personaImageUrl = ref("");

onMounted(async () => {
  try {
    const response = await userApi.getMyPage();
    const data = response.result;
    if (!data) return;

    user.value.nickname = data.nickname;
    exp.value = data.exp;

    // Updated logic for extracting filename and generating image URL
    const rawImagePath = data.persona?.imageUrl;
    const fileName = rawImagePath?.split("/").pop();
    const imageUrl = fileName ? new URL(`../../assets/character_images/${fileName}`, import.meta.url).href : "";
    personaImageUrl.value = imageUrl;

    console.log("📷 백엔드 imageUrl:", rawImagePath);
    console.log("📷 가공된 이미지 URL:", imageUrl);

    myPageInfo.value.persona = {
      quote: data.persona?.quote ?? "",
      nameKo: data.persona?.nameKo ?? "",
      imageUrl,
    };

    favoriteSavings.value = data.favoriteSavings;
    favoriteDeposits.value = data.favoriteDeposits;
    favoriteCards.value = data.favoriteCards;

    updateProducts();
  } catch (error) {
    console.error("❌ 마이페이지 정보 조회 실패", error);
  }
});

function updateProducts() {
  let items = [];
  if (selectedTab.value === "적금") {
    items = favoriteSavings.value.map((item) => ({
      bankName: item.company,
      productName: item.title,
      type: "적금",
    }));
  } else if (selectedTab.value === "예금") {
    items = favoriteDeposits.value.map((item) => ({
      bankName: item.bankName,
      productName: item.productName,
      type: "예금",
    }));
  } else if (selectedTab.value === "카드") {
    items = favoriteCards.value.map((item) => ({
      productName: item.name,
      productImage: item.imageUrl,
      type: "카드",
    }));
  }

  if (items.length < 2) {
    const missing = 2 - items.length;
    const fallback = { isFallback: true, type: selectedTab.value };
    items = [...items, ...Array(missing).fill(fallback)];
  } else {
    items = items.slice(0, 2);
  }

  products.value = items;
}

import { watch } from "vue";
watch(selectedTab, () => {
  updateProducts();
});

const getProductsByTab = computed(() => products.value);

const getBankLogo = (bankName) => {
  // 공통 로고 파일
  const busanLogo = new URL("@/assets/bank-Logos/BK_BUSAN_Profile.png", import.meta.url).href;
  const hanaLogo = new URL("@/assets/bank-Logos/BK_HANA_Profile.png", import.meta.url).href;

  const logoMap = {
    // 주요 시중은행
    국민은행: new URL("@/assets/bank-Logos/BK_KB_Profile.png", import.meta.url).href,
    하나은행: hanaLogo,
    농협은행주식회사: new URL("@/assets/bank-Logos/BK_NH_Profile.png", import.meta.url).href,
    신한은행: new URL("@/assets/bank-Logos/BK_Shinhan_Profile.png", import.meta.url).href,
    우리은행: new URL("@/assets/bankLogo_images/BK_Woori_Profile.png", import.meta.url).href,

    // 특수은행
    중소기업은행: new URL("@/assets/bank-Logos/BK_IBK_Profile.png", import.meta.url).href,
    한국산업은행: new URL("@/assets/bank-Logos/BK_KDB_Profile.png", import.meta.url).href,
    수협은행: new URL("@/assets/bank-Logos/BK_SH_Profile.png", import.meta.url).href,

    // 지방은행
    경남은행: busanLogo,
    부산은행: busanLogo,
    광주은행: new URL("@/assets/bank-Logos/BK_KWANGJU_Profile.png", import.meta.url).href,
    전북은행: new URL("@/assets/bank-Logos/BK_JEONBUK_Profile.png", import.meta.url).href,
    제주은행: new URL("@/assets/bank-Logos/BK_JEJU_Profile.png", import.meta.url).href,
    아이엠뱅크: new URL("@/assets/bank-Logos/BK_DAEGU_Profile.png", import.meta.url).href,

    // 외국계은행
    한국스탠다드차타드은행: new URL("@/assets/bank-Logos/BK_SC_Profile.png", import.meta.url).href,

    // 인터넷은행
    "주식회사 카카오뱅크": new URL("@/assets/bank-Logos/BK_KAKAO_Profile.png", import.meta.url).href,
    "주식회사 케이뱅크": new URL("@/assets/bank-Logos/BK_K_Profile.png", import.meta.url).href,
    "토스뱅크 주식회사": new URL("@/assets/bank-Logos/BK_TOSS_Profile.png", import.meta.url).href,

    // 주식회사 명칭 포함
    "주식회사 하나은행": hanaLogo,
  };

  return logoMap[bankName] || null;
};

function selectProduct(product) {
  console.log("Selected product:", product);
}
</script>

<style scoped>
.my-page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-template-areas:
    "profile profile"
    "type type"
    "left right";
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.profile-section {
  grid-area: profile;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.type-section {
  grid-area: type;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 30px;
}
.left-grid {
  grid-area: left;
  display: grid;
  grid-template-rows: 1fr 2fr;
  gap: var(--spacing-md);
  height: 500px;
}
.right-grid {
  grid-area: right;
  height: 500px;
}

.user-info {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  box-sizing: border-box;
  padding: var(--spacing-sm);
}

.profile-image-placeholder {
  width: clamp(100px, 25vw, 180px);
  height: clamp(100px, 25vw, 180px);
  border-radius: 50%;
  background-color: var(--color-secondary-10);
  border: 2px solid var(--color-secondary-50);
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-text {
  flex: 1 1 auto;
  min-width: 200px;
  max-width: 600px;
  box-sizing: border-box;
  padding: var(--spacing-md);
}

.user-name {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
}

.user-name .edit {
  font-size: var(--font-size-base);
  margin-left: var(--spacing-lg);
  color: var(--color-accent);
  cursor: pointer;
}

.nickname {
  font-size: var(--font-size-4xl);
  font-weight: 800;
}

.level-title {
  font-size: var(--font-size-xl);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}

.user-type {
  font-size: var(--font-size-2xl);
  font-weight: 500;
}

.user-level {
  font-size: var(--font-size-2xl);
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  margin: 0;
}

.level-value {
  font-size: var(--font-size-2xl);
  font-weight: 800;
}

.level-bar {
  width: 100%;
  height: 10px;
  background-color: var(--color-secondary);
  border-radius: 5px;
}
.fill {
  height: 100%;
  background-color: var(--color-dark);
  width: 60%;
  border-radius: 5px;
}

.change-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-2xl);
  margin-top: var(--spacing-sm);
}

.change-type p {
  margin: 0;
  font-size: var(--font-size-base);
}

.edit-button {
  background: none;
  border: none;
  font-size: var(--font-size-base);
  cursor: pointer;
}

.section-wide {
  grid-column: span 2;
}

.tabs {
  display: flex;
  justify-content: space-around;
  background-color: var(--color-secondary-10);
  border-radius: 2rem;
  padding: 0.25rem;
  margin: 0, var(--spacing-sm);
}
.tabs button {
  flex: 1;
  border: none;
  background-color: transparent;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 2rem;
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color 0.2s ease;
}
.tabs button.active {
  background-color: var(--color-accent);
  color: white;
  font-weight: 600;
}

.product-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 10rem;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  height: auto;
}

.product-card {
  border: 1px solid var(--color-secondary-30);
  border-radius: 1rem;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  cursor: pointer;
  transition: transform 0.2s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .my-page {
    grid-template-areas:
      "profile"
      "type"
      "left"
      "right";
    grid-template-columns: 1fr;
  }
  .user-info {
    flex-direction: column;
    align-items: center;
  }
  .user-text {
    text-align: center;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .user-name {
    font-size: var(--font-size-xl);
  }
  .level-value {
    font-size: var(--font-size-lg);
  }
  .user-type,
  .user-level {
    font-size: var(--font-size-sm);
  }
  .edit-button {
    font-size: var(--font-size-sm);
  }
}

.product-card {
  transform: scale(0.95);
}
.product-card:hover {
  transform: scale(1);
}
.product-header {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.bank-logo img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
.product-info {
  font-size: 1rem;
}

.profile-image-placeholder img.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
