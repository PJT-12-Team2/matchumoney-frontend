<template>
  <div class="container mt-5">
    <BaseCardGrey class="login-card">
      <template #content>
        <h1 class="login-title">프로필 수정</h1>
        <!-- 프로필 이미지 + 버튼 -->
        <div class="profile-row">
          <div class="profile-img">
            <span class="user-icon">👤</span>
          </div>
          <div class="button-center">
            <BaseButton class="mr-2" variant="primary">업로드</BaseButton>
          </div>
        </div>

        <!-- 닉네임 -->
        <div class="login-row">
          <div class="login-label">닉네임</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="nickname" placeholder="닉네임 입력" />
          </div>
        </div>

        <!-- 성별 -->
        <div class="login-row">
          <div class="login-label">성별</div>
        </div>
        <div class="login-row">
          <div class="input-action-row" style="justify-content: center">
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
        <div class="login-row">
          <div class="login-label">생년월일</div>
        </div>
        <div class="login-row">
          <div class="input-action-row birth-selects">
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
          <RouterLink to="/myinfo" custom v-slot="{ navigate }">
            <BaseButton
              variant="primary"
              :fullWidth="true"
              @click="
                async () => {
                  await submitForm();
                  navigate();
                }
              ">
              수정
            </BaseButton>
          </RouterLink>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import BaseCardGrey from "@/components/base/BaseCardGrey.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import "@/assets/main.css";
import { ref, computed, onMounted } from "vue";
import userApi from "@/api/user";
import { useRouter } from "vue-router";
const router = useRouter();

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
    // console.log("유저 정보 불러오기 성공:", res);
    // console.log("닉네임:", res.result.nickname);
    // console.log("성별:", res.result.gender);
    // console.log("생년월일:", res.result.birthDate);
    // console.log("프로필 이미지:", res.result.profileImageUrl);

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
    // console.log("회원정보 수정 성공:", res);
    alert("회원정보가 성공적으로 수정되었습니다.");
    router.push("/myinfo");
  } catch (err) {
    // console.error("회원정보 수정 실패:", err);
    alert("회원정보 수정에 실패했습니다.");
  }
};
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
}

.base-card {
  width: 100%;
  min-height: 627px;
  margin: 0 auto;
}

.login-card {
  width: 435px;
  height: 630px;
  padding: 1rem;
}

.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-dark);
}

/* 프로필 행 (이미지 위, 버튼 아래) */
.profile-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.profile-img {
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
}

/* 버튼은 중앙 정렬 */
.button-center {
  display: flex;
  gap: 1rem;
}

/* New login-row and login-label styles */
.login-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: var(--spacing-sm);
}

.login-label {
  font-size: 0.9rem;
  color: var(--color-dark);
  margin-bottom: 0.3rem;
}

.input-action-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

/* birth-selects within input-action-row */
.birth-selects {
  gap: 1rem;
}

/* 셀렉트 최소 너비 */
.select {
  min-width: 120px;
}

.mt-4 {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  ::v-deep(.base-card) {
    padding: 2rem !important;
    height: auto !important;
  }

  .profile-row {
    grid-template-columns: 1fr;
    justify-items: center;
    row-gap: 1rem;
  }

  .button-center {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .login-row {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .login-label {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .input-action-row {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
    font-size: 1.2rem;
  }

  .birth-selects {
    flex-direction: row;
    gap: 0.5rem;
  }

  .select {
    min-width: 33%;
  }

  .login-card {
    width: 90%;
    height: auto;
  }

  .login-title {
    font-size: 2rem;
  }

  .login-label {
    font-size: 1.2rem;
  }

  .select {
    font-size: 1.2rem;
  }

  ::v-deep(.input-field) {
    font-size: 1.2rem;
    height: 48px;
    padding: 0.75rem;
  }

  ::v-deep(.input-label) {
    font-size: 1.2rem;
  }

  .mt-4 button {
    font-size: 1.2rem;
    height: 30px;
    width: 50%;
  }

  .profile-img {
    width: 100px;
    height: 100px;
    font-size: 50px;
  }

  .button-center .base-button {
    font-size: 1.2rem;
  }
}
</style>
