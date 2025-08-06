<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import SavingMyProductSlider from '@/components/savings/SavingMyProductSlider.vue';
import BankbookProductList from '@/components/bankbook/BankbookProductList.vue';
import RecommendationLayout from '@/components/layouts/RecommendationLayout.vue';
import savingApi from '@/api/savings';
import Loading from '@/components/common/Loading.vue';
import BaseSpinner from '@/components/base/BaseSpinner.vue';
const selectedId = ref(null);
const savings = ref([]);
const savingsCache = ref({});
const page = ref(0);
const size = 4;
const hasMore = ref(true);

const loading = ref(false);
const bottomLoading = ref(false);

const scrollTrigger = ref(null);
let observer;

//  무한 스크롤 로딩과 초기 로딩을 분리
const fetchNextPage = async (isInitial = false) => {
  if (
    !selectedId.value ||
    (!isInitial && (bottomLoading.value || !hasMore.value))
  )
    return;

  if (isInitial) loading.value = true;
  else bottomLoading.value = true;

  try {
    const result = await savingApi.getRecommendSavings(
      selectedId.value,
      page.value,
      size
    );

    if (result.length < size) {
      hasMore.value = false;
    }

    if (!savingsCache.value[selectedId.value]) {
      savingsCache.value[selectedId.value] = [];
    }

    savingsCache.value[selectedId.value].push(...result);
    savings.value = savingsCache.value[selectedId.value];
    page.value++;
  } finally {
    if (isInitial) loading.value = false;
    else bottomLoading.value = false;
  }
};

watch(
  selectedId,
  async (newId) => {
    if (newId == null) return;

    page.value = 0;
    hasMore.value = true;
    savingsCache.value[newId] = [];
    savings.value = [];

    await fetchNextPage(true); // 초기 로딩 시 true 전달
  },
  { immediate: true }
);

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchNextPage(false); // 무한 스크롤 시 false 전달
    }
  });

  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
  }
});

onUnmounted(() => {
  if (observer && scrollTrigger.value) {
    observer.unobserve(scrollTrigger.value);
  }
});
</script>

<template>
  <div class="content-my">
    <RecommendationLayout title="적금 추천">
      <template #slider>
        <SavingMyProductSlider
          @select="(id) => (selectedId = id)"
          v-model:loading="loading"
        />
      </template>

      <template #highlight v-if="selectedId === -1">
        혹시 이런 상품은 어떠세요?
      </template>
      <template #highlight v-else-if="savings.length > 0">
        지금보다 더 좋은 적금 상품을 찾았어요!
      </template>
      <template #highlight v-else>
        지금보다 더 좋은 상품을 찾지 못했어요.
      </template>

      <template #content v-if="savings.length > 0">
        <BankbookProductList :selectedId="selectedId" :savings="savings" />
      </template>
    </RecommendationLayout>

    <!--  초기 로딩 (전체 페이지 로딩 시 화면 덮는 스피너) -->
    <Loading :loading="loading" />

    <!--  무한 스크롤 로딩 시 하단 스피너 -->
    <div v-if="bottomLoading" class="center"><BaseSpinner></BaseSpinner></div>

    <!--  무한 스크롤 트리거 -->
    <div ref="scrollTrigger" style="height: 1px"></div>

    <p v-if="!hasMore && savings.length > 0" class="end-message"></p>
  </div>
</template>

<style scoped>
.content-my {
  width: 80%;
  margin: auto;
  padding: 2rem 0;
}

.end-message {
  text-align: center;
  margin: 16px;
  color: #777;
}

@media (max-width: 640px) {
  .content-my {
    width: 90%;
  }
}
.center {
  width: 100%;
  max-height: 0.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1.2rem;
}
</style>
