<template>
  <Swiper
    :slides-per-view="1"
    :space-between="16"
    :loop="false"
    class="saving-swiper"
    @slideChange="onSlideChange"
    ref="swiperRef"
  >
    <SwiperSlide v-for="(item, index) in savingList" :key="index">
      <SavingMyProductCard :saving="item" />
    </SwiperSlide>
    <SwiperSlide @click="showModal = true">
      <div class="saving-card">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="product-logo"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="#40513B"
            d="M296 256c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm192 200v-48c0-4.4-3.6-8-8-8H296c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8m-48 396H208V148h560v344c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V108c0-17.7-14.3-32-32-32H168c-17.7 0-32 14.3-32 32v784c0 17.7 14.3 32 32 32h272c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m104.1-115.6c1.8-34.5 16.2-66.8 40.8-91.4c26.2-26.2 62-41 99.1-41c37.4 0 72.6 14.6 99.1 41c3.2 3.2 6.3 6.6 9.2 10.1L769.2 673a8 8 0 0 0 3 14.1l93.3 22.5c5 1.2 9.8-2.6 9.9-7.7l.6-95.4a8 8 0 0 0-12.9-6.4l-20.3 15.8C805.4 569.6 748.1 540 684 540c-109.9 0-199.6 86.9-204 195.7c-.2 4.5 3.5 8.3 8 8.3h48.1c4.3 0 7.8-3.3 8-7.6M880 744h-48.1c-4.3 0-7.8 3.3-8 7.6c-1.8 34.5-16.2 66.8-40.8 91.4c-26.2 26.2-62 41-99.1 41c-37.4 0-72.6-14.6-99.1-41c-3.2-3.2-6.3-6.6-9.2-10.1l23.1-17.9a8 8 0 0 0-3-14.1l-93.3-22.5c-5-1.2-9.8 2.6-9.9 7.7l-.6 95.4a8 8 0 0 0 12.9 6.4l20.3-15.8C562.6 918.4 619.9 948 684 948c109.9 0 199.6-86.9 204-195.7c.2-4.5-3.5-8.3-8-8.3"
          />
        </svg>

        <div class="card-content">
          <div class="card-title">
            <template v-if="savingList.length === 0">
              내 예/적금 불러오기
            </template>
            <template v-else> 예/적금 다시 불러오기</template>
          </div>
          <div class="card-info label">
            <template v-if="savingList.length === 0">
              예/적금 정보를 불러와<br />
              지금 바로 시작해보세요!
            </template>
            <template v-else>
              예/적금 정보를 다시 불러와<br />
              최신 상태로 확인해보세요!
            </template>
          </div>
        </div>
      </div>
    </SwiperSlide>
  </Swiper>

  <SavingConnectModal
    v-model:visible="showModal"
    v-model:loading="isLoading"
    @update:visible="showModal = $event"
    @submit="handleSync"
  >
  </SavingConnectModal>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import SavingMyProductCard from './SavingMyProductCard.vue';
import savingApi from '@/api/savings';
import SavingConnectModal from './SavingConnectModal.vue';
const isLoading = ref(false);
const showModal = ref(false);

const emit = defineEmits(['select']);

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
  const data = await savingApi.getList();
  savingList.value = data;
  if (data.length > 0) emit('select', data[0].id);
});

const handleSync = async (loginDto) => {
  isLoading.value = true;
  try {
    const res = await savingApi.syncAccounts(loginDto);
    savingList.value = res;

    alert('예/적금 연결 성공!');
    showModal.value = false;
  } catch (e) {
    console.error(e);
    alert('예/적금 연결 실패');
  } finally {
    isLoading.value = false;
    emit('select', savingList.value[0].id);
  }
};
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
