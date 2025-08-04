<script setup>
import { ref, watch } from 'vue';
import SavingMyProductSlider from '@/components/savings/SavingMyProductSlider.vue';
import BankbookProductList from '@/components/bankbook/BankbookProductList.vue';
import RecommendationLayout from '@/components/layouts/RecommendationLayout.vue';
import savingApi from '@/api/savings';
import Loading from '@/components/common/Loading.vue';
const selectedId = ref(null);
const savings = ref([]);
const loading = ref(false);

const savingsCache = ref({});

watch(
  selectedId,
  async (newId) => {
    if (newId != null) {
      loading.value = true;

      try {
        // 캐시에 존재하면 API 호출 없이 이미 불러온 값 사용
        if (savingsCache.value[newId]) {
          savings.value = savingsCache.value[newId];
        } else {
          const data = await savingApi.getRecommendSavings(newId);
          savings.value = data;

          //불러왔으면 캐시에 저장
          savingsCache.value[newId] = data;
        }
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- <Test /> -->
  <div class="content">
    <RecommendationLayout title="적금 추천">
      <template #slider>
        <SavingMyProductSlider
          @select="(id) => (selectedId = id)"
          v-model:loading="loading"
        />
      </template>

      <!-- 다시 불러오기 의 경우 -->
      <template #highlight v-if="selectedId == -1">
        혹시 이런 상품은 어떠세요?
      </template>
      <!-- 추천하는 적금이 있으면 -->
      <template #highlight v-else-if="savings.length > 0">
        지금보다 더 좋은 적금 상품을 찾았어요!
      </template>

      <!-- 더 좋은 적금이 없으면 -->
      <template #highlight v-else>
        지금보다 더 좋은 상품을 찾지 못했어요.
      </template>
      <template #content v-if="savings.length > 0">
        <BankbookProductList
          :selectedId="selectedId"
          :savings="savings"
          v-model="loading"
        />
      </template>
    </RecommendationLayout>
  </div>
  <Loading :loading="loading" />
</template>
<style scoped>
.content {
  width: 80%;
  margin: auto;
}
@media (max-width: 640px) {
  .content {
    width: 100%;
    margin: auto;
  }
}
</style>
