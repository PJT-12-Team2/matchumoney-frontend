<!-- components/searchPopup.vue -->
<template>
  <div class="modal-overlay z-prime" @click.self="$emit('close')">
    <div class="popup-container">
      <div class="close">
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- <div class="popup-header">
        <i class="fas fa-search"></i>
        비교하고자 하시는 {{ props.typeKo }} 상품을 선택해주세요.
      </div> -->
      <br />
      <input v-model="keyword" placeholder="키워드 검색" class="base-input" />
      <div class="info">
        <div>{{ props.typeKo }} 상품 리스트</div>
        <div>정렬</div>
      </div>
      <div class="popup-body">
        <template v-if="loading">
          <div class="popup-body loading">
            <BaseSpinner />
          </div>
        </template>
        <ul v-show="!loading">
          <li
            v-for="item in filteredData"
            :key="item.id"
            @click="click(item.id)"
          >
            <div class="img-wrap">
              <img
                :src="item.image ? item.image : `/src/assets/logo_dis.png`"
                @load="onImageLoad($event, item.id)"
                :class="imageSizeMap[item.id]"
              />
            </div>
            <div class="content-box">
              <div class="name">{{ item.finPrdtName }}</div>
              <div class="company">{{ item.korCoName }}</div>
            </div>
          </li>
          <li v-if="filteredData.length === 0">검색 결과가 없습니다.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  defineProps,
  reactive,
} from 'vue';
import { useCompareStore } from '@/stores/compareStore';
import compareApi from '@/api/compare';
import BaseSpinner from '../base/BaseSpinner.vue';

const loading = ref(false);
const data = ref([]);
const keyword = ref('');
const compareStore = useCompareStore();
const props = defineProps({
  type: String,
  typeKo: String,
});

defineEmits(['close']);

const imageSizeMap = reactive({});
const loadedImageCount = ref(0); // ✅ 로딩된 이미지 수
const totalImageCount = ref(0); // ✅ 전체 이미지 수

// 이미지 로딩 완료 감지
function onImageLoad(event, id) {
  const img = event.target;
  const isTall = img.naturalHeight > img.naturalWidth;
  imageSizeMap[id] = isTall ? 'tall' : 'wide';

  loadedImageCount.value++;
  if (loadedImageCount.value >= totalImageCount.value) {
    loading.value = false; // ✅ 모든 이미지 로드 완료
  }
}

async function fetchProducts() {
  loading.value = true;
  try {
    const result = await compareApi.getSearchList(props.type);
    data.value = result;
    totalImageCount.value = result.length; // ✅ 총 이미지 개수 설정
    loadedImageCount.value = 0; // ✅ 초기화
  } catch (e) {
    console.error('search List 불러오기 실패:', e);
    loading.value = false;
  }
}

const filteredData = computed(() => {
  return data.value.filter((item) => item.finPrdtName.includes(keyword.value));
});

const click = (id) => {
  compareStore.addProduct({
    id: id,
    type: props.type,
  });
};

onMounted(async () => {
  document.body.style.overflow = 'hidden';
  await fetchProducts();
});
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.z-prime {
  z-index: 10000;
}
.popup-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: var(--breakpoint-sm);
  padding: 1.6rem 3rem 3rem 3rem;
  background-color: white;
  box-shadow: var(--shadow-sm);
  border-radius: var(--spacing-sm);
}

.popup-header {
  font-weight: bold;
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
}

.base-input {
  padding: var(--spacing-sm) var(--spacing-md);
  width: 100%;
  border: 1px solid var(--color-accent); /* fallback color */
  box-sizing: border-box;
  border-radius: var(--spacing-sm);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
}
.loading {
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-body ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popup-body li {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-200);
  align-items: center;
}
.popup-body li:hover {
  background-color: var(--color-gray-100);
}
.popup-body {
  height: 50vh;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none; /* IE, Edge */
}
.popup-body::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eee;
  height: var(--spacing-3xl);
  width: var(--spacing-3xl);
  border-radius: 50%;
}
img.wide {
  width: var(--spacing-3xl);
}
img.tall {
  height: var(--spacing-3xl);
}

.content-box {
  text-align: start;
}
.content-box > .name {
  font-size: var(--font-size-lg);
  font-weight: bold;
}
.content-box > .company {
  font-size: var(--font-size-base);
}
.info {
  padding: var(--spacing-md) 0 var(--spacing-md);
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.close {
  display: flex;
  justify-content: end;
}
.close > * {
  background-color: transparent;
  border: 0;
  font-size: var(--font-size-2xl);
}
.close > *:hover {
  scale: 1.1;
}
</style>
