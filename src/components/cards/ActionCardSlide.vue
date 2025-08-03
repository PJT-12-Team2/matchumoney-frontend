<template>
  <div class="action-card-container">
    <!-- 카드 -->
    <div class="action-card">
      <!-- 카드 모양 아이콘 -->
      <div class="card-icon">
        <div class="card-shape">
          <div class="card-chip"></div>
          <div class="card-lines">
            <div class="card-line"></div>
            <div class="card-line"></div>
          </div>
          <div class="card-number">**** ****</div>
        </div>
      </div>

      <div class="card-content">
        <div class="card-title">
          <template v-if="hasCards">카드 다시 불러오기</template>
          <template v-else>내 카드 등록하기</template>
        </div>
        <div class="card-info">
          <template v-if="hasCards">
            카드 정보를 다시 불러와<br />
            최신 상태로 확인해보세요!
          </template>
          <template v-else>
            KB카드 마이데이터를 연동하여<br />
            카드 정보를 가져와보세요!
          </template>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="action-button" @click.stop="handleAction">
        <i v-if="hasCards" class="bi bi-arrow-clockwise"></i>
        <i v-else class="bi bi-plus-circle"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hasCards: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["register", "update"]);

// 버튼만 클릭 시 동작
const handleAction = () => {
  if (props.hasCards) {
    emit("update");
  } else {
    emit("register");
  }
};
</script>

<style scoped>
.action-card-container {
  width: 100%;
  height: 100%;
}

.action-card {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-radius: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
}

/* 카드 아이콘 */
.card-icon {
  flex-shrink: 0;
  margin-right: var(--spacing-lg);
}

.card-shape {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-chip {
  width: 12px;
  height: 10px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.card-lines {
  position: absolute;
  top: 22px;
  left: 10px;
  right: 10px;
}

.card-line {
  height: 1px;
  background: var(--color-black);
  margin-bottom: 2px;
}

.card-line:first-child {
  width: 70%;
}

.card-line:last-child {
  width: 50%;
}

.card-number {
  position: absolute;
  bottom: 6px;
  left: 10px;
  font-size: 8px;
  color: var(--color-black); /* 검정 계열 */
  font-weight: 600;
  letter-spacing: 1px;
}

/* 카드 내용 */
.card-content {
  flex: 1;
  text-align: left;
}

.card-title {
  font-weight: 700;
  font-size: var(--font-size-xl);
  color: #222; /* 검정 계열 */
  margin-bottom: var(--spacing-sm);
  text-shadow: none; /* 그림자 제거 */
  line-height: 1.3;
}

.card-info {
  font-size: var(--font-size-sm);
  color: var(--color-black); /* 검정 계열 */
  line-height: 1.5;
  opacity: 0.97;
  text-shadow: none; /* 그림자 제거 */
}

/* 액션 버튼 */
.action-button {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  background: var(--color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-button:hover {
  background: var(--color-white);
  transform: scale(1.05);
}

.action-button i {
  font-size: var(--font-size-xl);
  color: var(--color-black); /* 검정 계열 */
  text-shadow: none; /* 그림자 제거 */
}

/* 태블릿 */
@media (max-width: var(--breakpoint-lg)) {
  .action-card {
    min-height: 180px;
    padding: var(--spacing-lg);
  }

  .card-icon {
    margin-right: var(--spacing-md);
  }

  .card-shape {
    width: 70px;
    height: 44px;
  }

  .card-title {
    font-size: var(--font-size-lg);
  }

  .action-button {
    width: 45px;
    height: 45px;
  }

  .action-button i {
    font-size: var(--font-size-lg);
  }
}

/* 모바일 */
@media (max-width: var(--breakpoint-md)) {
  .action-card {
    min-height: 160px;
    padding: var(--spacing-md);
    flex-direction: column;
    text-align: center;
    justify-content: center;
    gap: var(--spacing-md);
  }

  .card-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }

  .card-shape {
    width: 60px;
    height: 38px;
  }

  .card-chip {
    width: 10px;
    height: 8px;
    top: 6px;
    left: 8px;
  }

  .card-lines {
    top: 18px;
    left: 8px;
    right: 8px;
  }

  .card-number {
    bottom: 4px;
    left: 8px;
    font-size: 7px;
    color: #222; /* 모바일에서도 */
  }

  .card-title {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-xs);
    color: #222;
  }

  .card-info {
    font-size: var(--font-size-xs);
    color: #333;
  }

  .action-button {
    width: 40px;
    height: 40px;
    margin-top: var(--spacing-sm);
  }

  .action-button i {
    font-size: var(--font-size-base);
    color: #222;
  }
}

/* 작은 모바일 */
@media (max-width: var(--breakpoint-sm)) {
  .action-card {
    min-height: 140px;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .card-shape {
    width: 50px;
    height: 32px;
  }

  .card-chip {
    width: 8px;
    height: 6px;
    top: 5px;
    left: 6px;
  }

  .card-lines {
    top: 14px;
    left: 6px;
    right: 6px;
  }

  .card-number {
    bottom: 3px;
    left: 6px;
    font-size: 6px;
    color: #222;
  }

  .card-title {
    font-size: var(--font-size-sm);
    color: #222;
  }

  .card-info {
    font-size: 0.7rem;
    color: #333;
  }

  .action-button {
    width: 35px;
    height: 35px;
  }

  .action-button i {
    font-size: var(--font-size-sm);
    color: #222;
  }
}
</style>
