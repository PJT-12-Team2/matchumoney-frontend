<template>
  <div class="product-list">
    <BankbookProductCard
      v-for="(saving, index) in filteredSavings"
      :key="index"
      :saving="saving"
    />
  </div>
</template>
<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.product-card {
  flex: 1 1 calc(50% - var(--font-size-xs)); /* 2개씩 */
  max-width: calc(50% - var(--font-size-xs));
}

@media (max-width: 1280px) {
  .product-card {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>
<script setup>
import { ref, computed, defineProps } from 'vue';
import BankbookProductCard from './BankbookProductCard.vue';

const props = defineProps({
  selectedId: String,
});

const filteredSavings = computed(() =>
  props.selectedId
    ? savings.value.filter((s) => s.id === props.selectedId)
    : savings.value
);

const savings = ref([
  {
    id: 'kb001',
    company: 'KB국민은행',
    title: '여행자유적금',
    max_rate: '연 3.80 %',
    base_rate: '연 2.40 %',
    amount: '월 10만원 ~ 200만원',
    period: '12개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: true,
  },
  {
    id: 'shinhan002',
    company: '신한은행',
    title: '쏠스마트적금',
    max_rate: '연 3.10 %',
    base_rate: '연 2.00 %',
    amount: '월 3만원 ~ 70만원',
    period: '24개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: false,
  },
  {
    id: 'kb001',
    company: 'KB국민은행',
    title: 'KB하이플랜적금',
    max_rate: '연 4.00 %',
    base_rate: '연 2.75 %',
    amount: '월 5만원 ~ 150만원',
    period: '06개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: false,
  },
  {
    id: 'shinhan002',
    company: '신한은행',
    title: '신한청년희망적금',
    max_rate: '연 3.45 %',
    base_rate: '연 2.30 %',
    amount: '월 1만원 ~ 100만원',
    period: '18개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: true,
  },
  {
    id: 'kb001',
    company: 'KB국민은행',
    title: 'KB자유정기적금',
    max_rate: '연 3.55 %',
    base_rate: '연 2.55 %',
    amount: '월 2만원 ~ 120만원',
    period: '36개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: true,
  },
  {
    id: 'shinhan002',
    company: '신한은행',
    title: '신한꿈나무적금',
    max_rate: '연 3.90 %',
    base_rate: '연 2.80 %',
    amount: '월 2만원 ~ 60만원',
    period: '06개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: false,
  },
  {
    id: 'hana003',
    company: '하나은행',
    title: '하나군적금',
    max_rate: '연 4.10 %',
    base_rate: '연 2.85 %',
    amount: '월 5만원 ~ 80만원',
    period: '18개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: true,
  },
  {
    id: 'hana003',
    company: '하나은행',
    title: '하나스마트적금',
    max_rate: '연 3.60 %',
    base_rate: '연 2.40 %',
    amount: '월 1만원 ~ 100만원',
    period: '24개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: false,
  },
  {
    id: 'hana003',
    company: '하나은행',
    title: '하나하이적금',
    max_rate: '연 3.20 %',
    base_rate: '연 1.90 %',
    amount: '월 3만원 ~ 90만원',
    period: '12개월',
    company_logo_url:
      'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    is_starred: false,
  },
]);
</script>
