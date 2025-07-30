<template>
  <Swiper
    :slides-per-view="1"
    :space-between="16"
    :loop="false"
    class="saving-swiper"
    :pagination="{ clickable: true }"
    @slideChange="onSlideChange"
    ref="swiperRef"
  >
    <SwiperSlide v-for="(item, index) in savingList" :key="index">
      <SavingMyProductCard :saving="item" />
    </SwiperSlide>
    <SwiperSlide>
      <SavingReloadCard
        :listLength="savingList.length"
        v-model:loading="isLoading"
      />
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import SavingMyProductCard from './SavingMyProductCard.vue';
import savingApi from '@/api/savings';
import SavingReloadCard from './SavingReloadCard.vue';

const emit = defineEmits(['update:loading', 'select']);

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
// 양방향 바인딩을 위한 computed
const isLoading = computed({
  get: () => props.loading,
  set: (value) => emit('update:loading', value),
});

const onSlideChange = (swiper) => {
  const currentIndex = swiper.activeIndex;

  // 불러오기 카드인 경우: 마지막 인덱스는 emit 생략
  if (currentIndex === savingList.value.length) {
    emit('select', -1);
    return;
  }

  const selected = savingList.value[currentIndex];
  if (selected) {
    // console.log('id 변경: ' + selected.id);
    emit('select', selected.id);
  }
};
const savingList = ref([]);

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await savingApi.getList();
    savingList.value = data;
    if (data.length > 0) {
      emit('select', data[0].id);
    }
  } catch (e) {
    console.log(e);
  } finally {
    isLoading.value = false;
  }
});
</script>
<style scoped>
.saving-card {
  background-color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--spacing-lg);
  gap: var(--spacing-md);
  box-shadow: var(--shadow-card);
}

.product-logo {
  width: 24%;
  max-width: 200px;
  max-height: 100px;
}

.card-content {
}

.card-title {
  font-weight: bold;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: end;
  font-size: var(--font-size-base);
  color: var(--color-title);
}

.date-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.rate-section {
  display: flex;
  align-items: end;
  gap: var(--spacing-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.value,
.label {
  color: var(--color-title);
  font-weight: bold;
}

.rate {
  color: var(--color-accent);
  font-weight: bold;
  font-size: var(--font-size-xl);
}
</style>
