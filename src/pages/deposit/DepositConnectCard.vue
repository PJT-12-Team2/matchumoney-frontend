<template>
  <div class="deposit-connect-card" @click="openModal">
    <!-- 연결 아이콘 -->
    <div class="connect-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
        <path
          fill="#609966"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
        />
      </svg>
    </div>

    <!-- 연결 안내 텍스트 -->
    <div class="connect-content">
      <div class="connect-title">계좌 연결하기</div>
      <div class="connect-subtitle">
        은행 계좌를 연결하여<br />
        맞춤형 예금 상품을 추천받아보세요!
      </div>
    </div>
  </div>

  <!-- 계좌 연결 모달 -->
  <SavingConnectModal
    v-model:visible="showModal"
    v-model:loading="isConnecting"
    @submit="handleConnect"
  />
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import { useAuthStore } from '@/stores/auth';
import SavingConnectModal from '@/components/savings/SavingConnectModal.vue';
import depositsApi from '@/api/deposit.js';

const props = defineProps({
  userId: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['connect-success']);

// 기존 인증 스토어 사용
const authStore = useAuthStore();

const showModal = ref(false);
const isConnecting = ref(false);

// 실제 사용할 userId (auth store 구조에 맞게 수정)
const effectiveUserId = props.userId || authStore.userId;

const openModal = () => {
  console.log('🔧 openModal 호출됨:', {
    effectiveUserId,
    authStoreUserId: authStore.userId,
    propsUserId: props.userId,
  });

  if (!effectiveUserId) {
    console.error('❌ 사용자 ID가 없습니다:', {
      effectiveUserId,
      authStoreUserId: authStore.userId,
      propsUserId: props.userId,
    });
    alert('로그인이 필요합니다.');
    return;
  }
  showModal.value = true;
};

const handleConnect = async (loginData) => {
  if (!effectiveUserId) {
    alert('사용자 정보를 찾을 수 없습니다.');
    return;
  }

  isConnecting.value = true;

  try {
    console.log('계좌 연결 시도:', {
      userId: effectiveUserId,
      loginData: { id: loginData.id, password: '***' }, // 비밀번호는 로그에 남기지 않음
    });

    // 🔧 개발 환경에서 특정 테스트 계정은 성공 시뮬레이션
    if (
      import.meta.env.DEV &&
      loginData.id === 'testuser' &&
      loginData.password === '1234'
    ) {
      console.log('🔧 개발 환경: 계좌 연동 성공 시뮬레이션');

      // 성공 시뮬레이션용 딜레이
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 연동 성공 플래그 저장 (Mock 계좌 데이터 표시용)
      localStorage.setItem(`dev_account_connected_${effectiveUserId}`, 'true');

      alert('계좌 연결 성공! (개발 테스트)');
      showModal.value = false;
      emit('connect-success');
      return;
    }

    // 🆕 실제 예금 API 호출
    const response = await depositsApi.connectAccount({
      userId: effectiveUserId,
      bankLoginId: loginData.id,
      bankPassword: loginData.password,
    });

    console.log('계좌 연결 응답:', response);

    alert('계좌 연결 성공!');
    showModal.value = false;

    // 부모 컴포넌트에 연결 성공 알림
    emit('connect-success');
  } catch (error) {
    console.error('계좌 연결 실패:', error);

    // 에러 타입별 메시지 처리
    let errorMessage = '계좌 연결에 실패했습니다.';

    if (error.response?.status === 401) {
      errorMessage = '은행 로그인 정보가 올바르지 않습니다.';
    } else if (error.response?.status === 404) {
      errorMessage = '해당 은행에서 계좌를 찾을 수 없습니다.';
    } else if (error.response?.status === 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    alert(errorMessage);
  } finally {
    isConnecting.value = false;
  }
};
</script>

<style scoped>
.deposit-connect-card {
  background: var(--color-light);
  border: 2px dashed var(--color-accent);
  border-radius: 20px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.deposit-connect-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-title);
}

.connect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 60px;
  height: 60px;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.connect-content {
  text-align: center;
}

.connect-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-title);
  margin-bottom: 10px;
}

.connect-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #609966;
  line-height: 1.5;
}

/* 반응형 디자인 */
@media (max-width: 393px) {
  .deposit-connect-card {
    padding: 30px 15px;
    min-height: 180px;
  }

  .icon {
    width: 50px;
    height: 50px;
  }

  .connect-title {
    font-size: 20px;
  }

  .connect-subtitle {
    font-size: 14px;
  }
}
</style>
