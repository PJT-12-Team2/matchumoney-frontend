<template>
  <div class="mypage container fade-in">
    <!-- 헤더는 App.vue에서 공통으로 렌더링된다고 가정 -->

    <main class="content flex flex-column align-center mt-5">
      <!-- 프로필 이미지 -->
      <div class="profile-img">
        <template v-if="user?.profileImageUrl">
          <img :src="user.profileImageUrl" alt="프로필 이미지" class="profile-picture" />
        </template>
        <template v-else>
          <span class="user-icon">👤</span>
        </template>
      </div>

      <!-- 사용자 정보 리스트 -->
      <div class="info-list card mt-5">
        <div class="info-item">
          <span class="label text-dark">이메일</span>
          <span class="value text-secondary">{{ user?.email }}</span>
        </div>
        <router-link to="/mypage/update" class="info-item clickable">
          <span class="label text-dark">닉네임</span>
          <span class="value text-secondary">{{ user?.nickname }}</span>
          <span class="arrow text-accent">></span>
        </router-link>

        <router-link to="/mypage/update" class="info-item clickable">
          <span class="label text-dark">성별</span>
          <span class="value text-secondary">{{ user?.gender }}</span>
          <span class="arrow text-accent">></span>
        </router-link>

        <router-link to="/mypage/update" class="info-item clickable">
          <span class="label text-dark">생년월일</span>
          <span class="value text-secondary">{{ formattedBirthDate }}</span>
          <span class="arrow text-accent">></span>
        </router-link>

        <router-link to="/mypage/update/password" class="info-item clickable">
          <span class="label">비밀번호 변경</span>
          <span class="value"></span>
          <span class="arrow">></span>
        </router-link>
        <button class="info-item clickable" @click="handleLogout">
          <span class="label text-dark">로그아웃</span>
          <span class="value text-secondary"></span>
          <span class="arrow text-accent">></span>
        </button>

        <button class="info-item clickable" @click="handleDeleteAccount">
          <span class="label text-dark">회원 탈퇴</span>
          <span class="value text-secondary"></span>
          <span class="arrow text-accent">></span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import userApi from "@/api/user";

const user = ref(null);

const formattedBirthDate = computed(() => {
  if (!user.value?.birthDate) return "";
  const date = new Date(user.value.birthDate);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
});

onMounted(async () => {
  try {
    const res = await userApi.getMyInfo();
    user.value = res.result;
  } catch (err) {
    console.error("내 정보 조회 실패", err);
  }
});

function handleLogout() {
  // Assuming logout logic is handled elsewhere or needs to be added
  window.location.href = "/login";
}

function handleDeleteAccount() {
  // console.log("회원 탈퇴 클릭");
  // 실제 탈퇴 API 연동 필요
}
</script>

<style scoped>
/* router-link 기본 밑줄 제거 */
a.info-item {
  text-decoration: none; /* 밑줄 제거 */
  color: inherit; /* 글자 색도 부모 색상 유지 */
}

.mypage {
  background-color: var(--bg-body);
  color: var(--text-primary);
}

.profile-img {
  width: 120px;
  height: 120px;
  border: 3px solid var(--color-accent);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 64px;
  background-color: var(--color-primary-10);
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.info-list {
  width: 100%;
  max-width: 500px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

/* 왼쪽 메뉴 제목 */
.info-item .label {
  flex: 0 0 auto;
  text-align: left;
  min-width: 80px;
}

/* 가운데 값: 오른쪽 정렬 */
.info-item .value {
  flex: 1;
  text-align: right;
  margin-right: var(--spacing-sm);
  color: var(--text-secondary);
}

/* 오른쪽 화살표 */
.info-item .arrow {
  flex: 0 0 auto;
  color: var(--color-accent);
  font-weight: bold;
}

.info-item.clickable {
  background-color: transparent; /* 회색 배경 제거 */
  border: none;
  width: 100%;
  text-align: left;
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.info-item.clickable:hover {
  background-color: var(--bg-hover);
}

/* 기본 버튼 스타일 제거 */
button.info-item {
  background: none; /* 버튼 배경 제거 */
  border: none;
  outline: none;
  appearance: none;
}
</style>
