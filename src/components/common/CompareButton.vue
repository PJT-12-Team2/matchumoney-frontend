<template>
  <button
    class="compare-button"
    :class="{ added: isAlreadyCompared }"
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
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px; /* 아이콘/텍스트 간격 대비 */
  outline: none;
}
.compare-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}
.compare-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}
.compare-button.added {
  background-color: #e6f0ff;
  color: #007bff;
}
.compare-button.added:hover {
  background-color: #d0e5ff;
}
@media (max-width: 1024px) {
  .compare-button {
    font-size: var(--font-size-md);
    padding: 6px 10px; /* responsive padding like like button */
    margin: 0px -11px 0px 0px;
    padding: 4px 8px;
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
