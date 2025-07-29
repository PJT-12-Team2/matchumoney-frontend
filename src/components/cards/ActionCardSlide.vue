<template>
  <div class="action-card-slide">
    <!-- 배경 그라데이션 -->
    <div class="action-background"></div>
    
    <!-- 카드가 있는 경우: 업데이트 카드 -->
    <div v-if="hasCards" class="action-content update-card">
      <div class="action-icon">
        <i class="bi bi-arrow-clockwise"></i>
      </div>
      
      <h3 class="action-title">카드 정보 업데이트</h3>
      <p class="action-description">
        최신 카드 정보로<br>
        업데이트하시겠습니까?
      </p>
      
      <button class="action-button update-btn" @click="$emit('update')">
        <i class="bi bi-arrow-clockwise"></i>
        업데이트하기
      </button>
    </div>
    
    <!-- 카드가 없는 경우: 등록 카드 -->
    <div v-else class="action-content register-card">
      <div class="action-icon">
        <i class="bi bi-plus-circle"></i>
      </div>
      
      <h3 class="action-title">카드 등록 필요</h3>
      <p class="action-description">
        KB카드를 연동하여<br>
        마이데이터 서비스를 시작하세요
      </p>
      
      <button class="action-button register-btn" @click="$emit('register')">
        <i class="bi bi-plus-circle"></i>
        카드 등록하기
      </button>
    </div>
    
    <!-- 장식 요소 -->
    <div class="decoration-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hasCards: {
    type: Boolean,
    default: false
  }
});

defineEmits(['register', 'update']);
</script>

<style scoped>
.action-card-slide {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-card-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 5;
  pointer-events: none;
}

.action-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-accent);
  z-index: 1;
}

.action-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: var(--color-white);
  padding: var(--spacing-2xl) var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: var(--spacing-sm);
}

.action-icon {
  margin-bottom: var(--spacing-md);
  opacity: 0.95;
}

.action-icon i {
  font-size: 52px;
  background: linear-gradient(45deg, var(--color-white), var(--color-gray-50));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
}

.action-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.action-description {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  opacity: 0.95;
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  max-width: 200px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: 30px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 140px;
  justify-content: center;
}

.register-btn {
  background: linear-gradient(45deg, var(--color-success), var(--color-info));
  color: var(--color-white);
}

.register-btn:hover {
  background: linear-gradient(45deg, var(--color-success-dark), var(--color-info-dark));
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.update-btn {
  background: linear-gradient(45deg, var(--color-info), var(--color-accent));
  color: var(--color-white);
}

.update-btn:hover {
  background: linear-gradient(45deg, var(--color-info-dark), var(--color-dark));
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.action-button i {
  font-size: 16px;
}

/* 등록 카드 배경 */
.register-card .action-background {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-info) 100%);
}

/* 업데이트 카드 배경 */
.update-card ~ .action-background {
  background: linear-gradient(135deg, var(--color-info) 0%, var(--color-accent) 100%);
}

.decoration-circles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 90px;
  height: 90px;
  top: 15%;
  left: 8%;
  animation-delay: 0s;
}

.circle-2 {
  width: 70px;
  height: 70px;
  top: 65%;
  right: 12%;
  animation-delay: 2.5s;
}

.circle-3 {
  width: 50px;
  height: 50px;
  top: 8%;
  right: 18%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.3;
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .action-content {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .action-icon i {
    font-size: 40px;
  }
  
  .action-title {
    font-size: var(--font-size-lg);
  }
  
  .action-description {
    font-size: var(--font-size-xs);
  }
  
  .action-button {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-xs);
  }
}
</style>