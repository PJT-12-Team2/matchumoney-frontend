<template>
  <button
    class="compare-button"
    :class="{ remove: isAlreadyCompared }"
    @pointerdown.stop
    @click.stop.prevent="onCompareClick"
  >
    {{ isAlreadyCompared ? '⊖비교제거' : '⊕비교추가' }}
  </button>

  <!-- ✅ 모달은 body로 텔레포트 -->
  <teleport to="body">
    <template v-if="showModal" @click.stop>
      <transition name="mb-pop" appear>
        <button class="mb-modal hover-lift" @click.stop="goCompare">
          비교함으로 이동하기
        </button></transition
      >
    </template>
  </teleport>
</template>

<script setup>
import { useCompareStore } from '@/stores/compareStore';
import { defineProps, computed, ref, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const compareStore = useCompareStore();
const router = useRouter();

const props = defineProps({
  productId: { type: Number, required: true },
  productType: { type: String, required: true },
});

const showModal = ref(false);
const autoHideTimer = ref(null); // ✅ 타이머

const isAlreadyCompared = computed(() =>
  compareStore.isCompared(props.productId, props.productType)
);

function clearAutoHide() {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value);
    autoHideTimer.value = null;
  }
}
function scheduleAutoHide(ms = 5000) {
  clearAutoHide();
  autoHideTimer.value = setTimeout(() => {
    showModal.value = false;
    autoHideTimer.value = null;
  }, ms);
}

const onCompareClick = async (e) => {
  e?.stopPropagation?.();
  e?.preventDefault?.();

  if (isAlreadyCompared.value) {
    compareStore.removeProduct({
      id: props.productId,
      type: props.productType,
    });
    showModal.value = false;
    clearAutoHide();
    return;
  }

  const before = compareStore.isCompared(props.productId, props.productType);
  compareStore.addProduct({ id: props.productId, type: props.productType });
  await nextTick();
  const after = compareStore.isCompared(props.productId, props.productType);

  if (!before && after) {
    showModal.value = true;
    scheduleAutoHide(5000); // ✅ 5초 후 자동 닫힘
  }
};

const goCompare = () => {
  showModal.value = false;
  clearAutoHide(); // ✅ 이동 시 타이머 정리
  router.push(`/compare?type=${props.productType}`);
};

onUnmounted(clearAutoHide); // ✅ 컴포넌트 파기 시 정리
</script>

<style scoped>
.compare-button {
  font-size: 0.8rem;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0.2rem 0.1rem;
  border-radius: 0.4rem;
  transition: transform 0.2s;
}
.compare-button:hover {
  transform: scale(1.05);
}
.compare-button.remove {
  color: red;
}
@media (max-width: 1024px) {
  .compare-button {
    font-size: var(--font-size-sm);
  }
}
</style>

<style>
.mb-modal {
  position: fixed;
  left: 50%;
  bottom: 1%;
  transform: translate(-50%, -50%);
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--spacing-3xl);
  box-shadow: var(--shadow-modal);
  z-index: 2147483647;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: bold;
  border: 0;
} /* 공통 전환 추가 (기존 style 아래에 붙이기) */
.mb-modal {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out,
    opacity 0.2s ease-out;
}

/* 1) Lift: 살짝 위로 떠오르고 그림자 강화 */
.mb-modal.hover-lift:hover {
  background: var(--color-dark);
  transform: translate(-50%, -50%) translateY(-4px);
}
/* 등장/퇴장 트랜지션 */
.mb-modal.mb-pop-enter-active,
.mb-modal.mb-pop-leave-active {
  transition: opacity 0.22s ease-out, transform 0.22s ease-out;
}

.mb-modal.mb-pop-enter-from,
.mb-modal.mb-pop-leave-to {
  opacity: 0;
  /* 살짝 아래/작게 시작 */
  transform: translate(-50%, -60%) scale(0.96);
}

.mb-modal.mb-pop-enter-to,
.mb-modal.mb-pop-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
