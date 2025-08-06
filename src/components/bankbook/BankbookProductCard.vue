<template>
  <div class="product-card">
    <div class="product-card__header">
      <div>
        <div class="product-card__company">{{ saving.company }}</div>
        <div class="product-card__title">{{ saving.title }}</div>
      </div>
      <FavoriteToggle
        v-model="saving.is_starred"
        :productId="saving.id"
        :productType="productType"
      />
    </div>
    <div class="product-card__body" @click="onClick">
      <div class="product-card__logo-box">
        <img
          :src="saving.company_image"
          loading="lazy"
          alt="logo"
          class="product-card__logo"
          v-if="saving.company_image"
        />
        <img
          src="../../assets/Logo_dis.png"
          alt="logo"
          class="product-card__logo"
          v-else
        />
        <CompareButton :productId="saving.id" :productType="productType" />
      </div>

      <div class="product-card__info">
        <div class="product-card__row">
          <span>최고 금리</span>
          <span class="product-card__highlight"
            >{{ roundToTwoDecimalPlaces(saving.maxRate) }}%</span
          >
        </div>
        <div class="product-card__row">
          <span>기본 금리</span>
          <span>{{ roundToTwoDecimalPlaces(saving.baseRate) }}%</span>
        </div>
        <div class="product-card__row">
          <span>금액</span>
          <span v-if="saving.amount"
            >매달 {{ Number(saving.amount).toLocaleString('ko-KR') }}원
            이하</span
          >
          <span v-else>제한 조건 없음</span>
        </div>
        <div class="product-card__row">
          <span>개월 수</span>
          <span>{{ saving.period }}개월</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import { roundToTwoDecimalPlaces } from '@/util/numberFormatter';
import { ProductType } from '@/constants/productTypes';

const productType = ProductType.SAVING;
const props = defineProps({
  saving: {
    type: Object,
    required: true,
  },
});

const onClick = () => {
  console.log(`${props.saving.id} 상세보러 가자!!`);
  // 향후 비교목록에 저장하는 로직 추가 가능
};
</script>

<style scoped>
.product-card {
  width: 100%;
  background-color: var(--color-light);
  box-shadow: var(--shadow-xl);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: solid 0.2rem var(--color-light);
}

.product-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__company {
  font-size: var(--font-size-sm);
  color: var(--color-gray-400);
  font-weight: bold;
}
.product-card__header > div,
.product-card__info > span {
  flex: 1;
  min-width: 0;
}

.product-card__title {
  font-size: var(--font-size-xl);
  color: var(--color-title);
  font-weight: bold; /* 말줄임 처리 필수 속성 */
  white-space: nowrap; /* 줄바꿈 방지 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 말줄임(...) 처리 */
  display: block; /* 필수 */
  max-width: 100%; /* 폭 제한 */
  min-width: 0; /* flex 컨테이너 내부일 때 필수 */
}

.product-card__body {
  display: flex;
  gap: 5%;
}

.product-card__logo-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xs);
  width: 24%;
  text-align: center;
}

.product-card__logo {
  width: 100%;
  object-fit: contain;
  border-radius: 50%;

  padding: var(--spacing-md);
}

.product-card__info {
  width: 68%;
  display: grid;
  align-items: center;
  grid-template-columns:
    1fr
    2fr;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-gray-500);
}

.product-card__row {
  /* 말줄임 처리 필수 속성 */
  white-space: nowrap; /* 줄바꿈 방지 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 말줄임(...) 처리 */
  display: block; /* 필수 */
  max-width: 100%; /* 폭 제한 */
  min-width: 0; /* flex 컨테이너 내부일 때 필수 */
  display: contents; /* 자식 span이 직접 grid 셀 차지하도록 */
}

.product-card__highlight {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: bold;
}
@media (max-width: 1024px) {
  .product-card__title {
    font-size: var(--font-size-2xl);
  }
  .product-card__company {
    font-size: var(--font-size-base);
  }
  .product-card__info {
    font-size: var(--font-size-base);
  }
  .product-card__highlight {
    font-size: var(--font-size-base);
  }
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border: solid 0.2rem var(--color-accent);
}
</style>
