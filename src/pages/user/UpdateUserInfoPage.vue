<template>
  <div class="container mt-5">
    <BaseCard class="rounded-xl">
      <template #title>프로필 수정</template>

      <template #content>
        <!-- 프로필 이미지 + 버튼 -->
        <div class="profile-row">
          <div class="profile-img">
            <span class="user-icon">👤</span>
          </div>
          <div class="button-center">
            <BaseButton class="mr-2" variant="primary">사진 업로드</BaseButton>
            <BaseButton class="mr-2" variant="primary">제거하기</BaseButton>
          </div>
        </div>

        <!-- 닉네임 -->
        <div class="form-group form-row">
          <label for="nickname" class="form-label nickname-label">닉네임</label>
          <input id="nickname" v-model="nickname" type="text" class="form-input nickname-input" />
        </div>

        <!-- 성별 -->
        <div class="gender-row">
          <span class="gender-label">성별</span>
          <div class="gender-center">
            <label>
              <input type="radio" value="MALE" v-model="gender" />
              남자
            </label>
            <label>
              <input type="radio" value="FEMALE" v-model="gender" />
              여자
            </label>
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="form-group form-row">
          <span class="form-label birth-label">생년월일</span>
          <div class="birth-selects">
            <select v-model="year" class="form-input select">
              <option value="" disabled>년도</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <select v-model="month" class="form-input select">
              <option value="" disabled>월</option>
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>
            <select v-model="day" class="form-input select">
              <option value="" disabled>일</option>
              <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
        </div>

        <!-- 정보 수정 버튼 -->
        <div class="mt-4">
          <BaseButton variant="primary" :fullWidth="true" @click="submitForm">정보 수정</BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script setup>
import BaseCard from "@/components/base/BaseCardGrey.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import "@/assets/main.css";
import { ref, computed, onMounted } from "vue";
import userApi from "@/api/user";

const nickname = ref("");
const gender = ref("");
const year = ref("");
const month = ref("");
const day = ref("");

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => currentYear - i);
});

onMounted(async () => {
  try {
    const res = await userApi.getMyInfo();
    console.log("유저 정보 불러오기 성공:", res);
    console.log("닉네임:", res.result.nickname);
    console.log("성별:", res.result.gender);
    console.log("생년월일:", res.result.birthDate);
    console.log("프로필 이미지:", res.result.profileImageUrl);

    nickname.value = res.result.nickname;
    gender.value = res.result.gender;
    if (res.result.birthDate) {
      const [yyyy, mm, dd] = res.result.birthDate.split("-");
      year.value = Number(yyyy);
      month.value = Number(mm);
      day.value = Number(dd);
    }
  } catch (err) {
    console.error("유저 정보 불러오기 실패:", err);
  }
});

const submitForm = async () => {
  const birthDate =
    year.value && month.value && day.value
      ? `${year.value}-${String(month.value).padStart(2, "0")}-${String(day.value).padStart(2, "0")}`
      : null;

  const updateDto = {
    nickname: nickname.value,
    gender: gender.value,
    birthDate: birthDate,
  };

  try {
    const res = await userApi.updateUserInfo(updateDto);
    console.log("회원정보 수정 성공:", res);
    alert("회원정보가 성공적으로 수정되었습니다.");
  } catch (err) {
    console.error("회원정보 수정 실패:", err);
    alert("회원정보 수정에 실패했습니다.");
  }
};
</script>

<style scoped>
::v-deep(.base-card .title) {
  margin-bottom: 4rem !important; /* !important로 강제 덮어쓰기 */
  display: block;
}

::v-deep(.base-card) {
  padding: 4rem !important; /* 내부 여백 유지 */
  height: 677px !important; /* 고정 높이 */
  box-sizing: border-box; /* padding 포함 높이 계산 */
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

/* 프로필 행 (이미지 좌측, 버튼 중앙) */
.profile-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  margin-bottom: 3rem; /* 위아래 간격 */
}

.profile-img {
  justify-self: start;
  width: 80px;
  height: 80px;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
}

/* 버튼은 중앙 정렬 */
.button-center {
  justify-self: center;
  display: flex;
  gap: 1rem;
}

/* 닉네임 행 */
.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem; /* 위아래 간격 */
}

.nickname-label {
  width: 80px;
  flex-shrink: 0;
}
.nickname-input {
  flex: 1;
}

/* 성별 행 (라벨 좌측, 라디오 중앙) */
.gender-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  margin-bottom: 3rem; /* 위아래 간격 */
}

.gender-label {
  justify-self: start;
  width: 80px;
}
.gender-center {
  justify-self: center;
  display: flex;
  gap: 2rem;
}

/* 생년월일 행 */
.birth-label {
  width: 80px;
  flex-shrink: 0;
}
.birth-selects {
  display: flex;
  gap: 1rem;
  flex: 1;
}

/* 셀렉트 최소 너비 */
.select {
  min-width: 120px;
}

.mt-4 {
  margin-top: 3rem;
}
</style>
