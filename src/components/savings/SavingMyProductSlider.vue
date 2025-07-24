<template>
  <swiper
    :slides-per-view="1"
    :space-between="16"
    :loop="false"
    class="saving-swiper"
    @slideChange="onSlideChange"
    ref="swiperRef"
  >
    <swiper-slide v-for="(item, index) in savingList" :key="index">
      <SavingMyProductCard :saving="item" />
    </swiper-slide>
  </swiper>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

import SavingMyProductCard from './SavingMyProductCard.vue';

const emit = defineEmits(['select']);
const swiperRef = ref(null);

// 예시 데이터
const savingList = [
  {
    id: 'kb001',
    title: 'KB두근두근여행적금',
    start_date: '2025.03.06',
    end_date: '2025.09.06',
    rate: '3.6%',
  },
  {
    id: 'shinhan002',
    title: '청년도약계좌',
    start_date: '2025.01.01',
    end_date: '2030.01.01',
    rate: '4.2%',
  },
  {
    id: 'hana003',
    title: '하나장병적금',
    startDate: '2024.11.20',
    endDate: '2026.11.20',
    rate: '5.0%',
  },
];

// 슬라이드 변경 시 현재 index로 emit
const onSlideChange = (swiper) => {
  const currentIndex = swiper.activeIndex;
  const selected = savingList[currentIndex];
  // console.log('슬라이드 값 변경' + selected.id);
  if (selected) emit('select', selected.id);
};

// 최초 첫 번째 상품 emit
onMounted(() => {
  emit('select', savingList[0].id);
});
</script>

<style scoped>
.saving-swiper {
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-card);
}
</style>
