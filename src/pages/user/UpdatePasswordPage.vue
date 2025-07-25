<template>
  <div class="container mt-5">
    <BaseCard class="rounded-xl">
      <template #title>비밀번호 변경</template>

      <template #content>
        <!-- 현재 비밀번호 -->
        <div class="form-group form-row">
          <label for="currentPw" class="form-label pw-label">
            현재 비밀번호 확인
            <span class="required">*</span>
          </label>
          <input
            id="currentPw"
            v-model="currentPw"
            type="password"
            class="form-input pw-input"
            placeholder="현재 비밀번호 입력" />
        </div>

        <!-- 새 비밀번호 -->
        <div class="form-group form-row">
          <label for="newPw" class="form-label pw-label">
            새 비밀번호
            <span class="required">*</span>
          </label>
          <input
            id="newPw"
            v-model="newPw"
            type="password"
            class="form-input pw-input"
            placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8~20자)" />
        </div>

        <div class="form-group confirm-row">
          <label for="confirmPw" class="form-label pw-label">
            새 비밀번호 확인
            <span class="required">*</span>
          </label>
          <div class="pw-input-wrapper">
            <input
              id="confirmPw"
              v-model="confirmPw"
              type="password"
              class="form-input pw-input"
              placeholder="비밀번호 재입력" />
            <!-- 항상 렌더링하고 visibility로 제어 -->
            <p class="error-msg" :class="{ visible: errorMessage }">
              {{ errorMessage || "‎" }}
            </p>
          </div>
        </div>

        <!-- 변경 버튼 -->
        <div class="mt-4">
          <BaseButton variant="primary" :fullWidth="true" @click="handleChangePassword">비밀번호 변경</BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script setup>
import BaseCard from "@/components/base/BaseCardGrey.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import "@/assets/main.css";
import { ref, watch } from "vue";

const currentPw = ref("");
const newPw = ref("");
const confirmPw = ref("");
const errorMessage = ref("");

// 실시간으로 새 비밀번호와 확인이 일치하는지 체크
watch([newPw, confirmPw], ([newVal, confirmVal]) => {
  if (newVal && confirmVal && newVal !== confirmVal) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
  } else {
    errorMessage.value = "";
  }
});

const handleChangePassword = () => {
  if (newPw.value !== confirmPw.value) {
    errorMessage.value = "비밀번호가 일치하지 않습니다";
    return;
  }
  errorMessage.value = "";
  console.log("비밀번호 변경 요청", {
    current: currentPw.value,
    new: newPw.value,
  });
  // TODO: 실제 API 요청
};
</script>

<style scoped>
::v-deep(.base-card .title) {
  margin-bottom: 4rem !important;
  display: block;
}

::v-deep(.base-card) {
  padding: 4rem !important;
}

.container {
  max-width: 100%;
  margin: 0 auto;
}

.base-card {
  width: 100%;
  min-height: 627px;
  margin: 0 auto;
}

/* 각 행 레이아웃 */
.form-row {
  display: grid;
  grid-template-columns: 200px 1fr; /* 왼쪽 라벨, 오른쪽 입력 */
  align-items: center;
  margin-bottom: 2.5rem;
}

/* 라벨 */
.pw-label {
  justify-self: start;
  font-weight: 500;
}
.required {
  color: red;
  margin-left: 0.25rem;
}

/* 인풋 */
.pw-input {
  flex: 1;
}

.pw-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%; /* 입력 영역이 가득 차도록 */
}

.error-msg {
  min-height: 1.2rem; /* 항상 공간 확보 */
  font-size: 0.9rem;
  margin-top: 0.3rem;
  margin-bottom: 0; /* 기존 margin-bottom 제거 */
  color: red;
  visibility: hidden; /* 기본은 숨김 */
}

.error-msg.visible {
  visibility: visible; /* 메시지가 있으면 보이기 */
}

.mt-4 {
  margin-top: 3rem;
}

.confirm-row {
  display: grid;
  grid-template-columns: 200px 1fr; /* 라벨과 입력 영역 동일한 그리드 */
  align-items: start;
  margin-bottom: 2.5rem;
}
.confirm-row .pw-label {
  justify-self: start;
  font-weight: 500;
  padding-top: 0.3rem;
}
</style>
