<template>
  <DefaultLayout>
    <div class="card-recommendations">
      <main class="main-content">
        <h2 class="page-title">내 카드 관리</h2>

        <!-- 카드 연동 버튼 -->
        <div class="sync-section" v-if="!cards.length && !isLoading">
          <div class="sync-info">
            <p>CODEF를 통해 KB카드 정보를 연동하세요</p>
            <button class="sync-btn" @click="showSyncModal = true">
              카드 연동하기
            </button>
          </div>
        </div>

        <!-- 카드 슬라이더 -->
        <div class="card-slider" v-if="cards.length">
          <CardSlider 
            :cards="cards"
            @cardClick="handleCardClick"
            @register="showSyncModal = true"
            @update="handleCardUpdate"
          />
        </div>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <div>카드 정보를 불러오고 있습니다...</div>
        </div>
      </main>

      <!-- 카드 동기화 모달 -->
      <CardSyncModal 
        :isVisible="showSyncModal"
        @close="showSyncModal = false"
        @sync="handleCardSync"
      />

      <!-- 거래내역 동기화 모달 -->
      <TransactionSyncModal
        :isVisible="showTransactionModal"
        :cardInfo="selectedCard"
        @close="showTransactionModal = false"
        @sync="handleTransactionSync"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/components/layouts/DefaultLayout.vue';
import BaseSpinner from '@/components/base/BaseSpinner.vue';
import CardSlider from '@/components/cards/CardSlider.vue';
import CardSyncModal from '@/components/cards/CardSyncModal.vue';
import TransactionSyncModal from '@/components/cards/TransactionSyncModal.vue';
import cardsApi from '@/api/cards';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const cards = ref([]);
const showSyncModal = ref(false);
const showTransactionModal = ref(false);
const selectedCard = ref(null);

const userId = computed(() => authStore.getUserId);

// 카드 목록 조회
const fetchCards = async () => {
  if (!userId.value) {
    console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  isLoading.value = true;
  try {
    console.log('📋 카드 목록 조회 시작, userId:', userId.value);
    const response = await cardsApi.getUserCards(userId.value);
    console.log('✅ 카드 목록 조회 성공:', response);
    
    cards.value = response.result || [];
    
    if (cards.value.length === 0) {
      console.log('💡 등록된 카드가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 카드 목록 조회 실패:', error);
    
    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 404) {
      console.log('💡 사용자 카드 정보가 없습니다.');
      cards.value = [];
    } else {
      alert(`카드 목록을 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  } finally {
    isLoading.value = false;
  }
};

// 카드 동기화
const handleCardSync = async (syncData) => {
  if (!userId.value) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    const requestData = {
      userId: parseInt(userId.value),
      cardId: syncData.cardId,
      cardPw: syncData.cardPw
    };
    
    console.log('🔄 카드 동기화 시작:', requestData);
    const response = await cardsApi.syncKbCards(requestData);
    console.log('✅ 카드 동기화 완료:', response);
    
    alert(`${response.message || '카드 동기화가 완료되었습니다.'}`);
    await fetchCards(); // 목록 새로고침
  } catch (error) {
    console.error('❌ 카드 동기화 실패:', error);
    
    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 400) {
      alert('입력 정보가 올바르지 않습니다. 카드 ID와 비밀번호를 확인해주세요.');
    } else if (error.response?.status === 500) {
      alert('마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert(`카드 동기화에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  }
};

// 카드 클릭 시 거래내역 동기화 모달 표시
const handleCardClick = (card) => {
  console.log('카드 클릭:', card);
  selectedCard.value = card;
  showTransactionModal.value = true;
};

// 카드 업데이트 (기존 카드들을 새로고침)
const handleCardUpdate = async () => {
  console.log('카드 정보 업데이트 시작');
  await fetchCards();
  alert('카드 정보가 업데이트되었습니다.');
};

// 거래내역 동기화 처리
const handleTransactionSync = async (transactionData) => {
  if (!selectedCard.value || !userId.value) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    console.log('🔄 거래내역 동기화 시작:', { 
      holdingId: selectedCard.value.holdingId, 
      transactionData 
    });
    
    const response = await cardsApi.syncCardTransactions(
      selectedCard.value.holdingId, 
      transactionData
    );
    
    console.log('✅ 거래내역 동기화 완료:', response);
    alert(`${response.message || '거래내역 동기화가 완료되었습니다.'}`);
  } catch (error) {
    console.error('❌ 거래내역 동기화 실패:', error);
    
    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 400) {
      alert('입력 정보가 올바르지 않습니다. 카드 정보와 날짜 범위를 확인해주세요.');
    } else if (error.response?.status === 404) {
      alert('카드 정보를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      alert('마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert(`거래내역 동기화에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  }
};

onMounted(() => {
  fetchCards();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.card-recommendations {
  font-family: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  color: var(--text-primary, #1a1a1a);
  line-height: 1.6;
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-md, 20px);
  background: var(--bg-body, #fff);
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-2xl, 24px);
  font-weight: 700;
  color: var(--color-title, #636363);
  text-align: center;
  margin-bottom: var(--spacing-xl, 30px);
}

/* 연동 섹션 */
.sync-section {
  text-align: center;
  padding: 40px 20px;
  background: var(--color-light, #f8f9fa);
  border-radius: 16px;
  margin-bottom: var(--spacing-xl, 30px);
}

.sync-info p {
  color: var(--color-title, #636363);
  margin-bottom: 20px;
  font-size: var(--font-size-base, 16px);
}

.sync-btn {
  background: var(--color-accent, #609966);
  color: var(--color-white, #fff);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: var(--font-size-base, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sync-btn:hover {
  background: #4a7c59;
}

/* 카드 슬라이더 */
.card-slider {
  position: relative;
  margin-bottom: var(--spacing-xl, 30px);
}

/* 로딩 애니메이션 */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--color-title, #636363);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid var(--color-accent, #609966);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .card-recommendations {
    padding: 16px;
  }
}
</style>