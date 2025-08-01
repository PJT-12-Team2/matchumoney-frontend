<template>
  <!-- 🟢 상단 헤더 -->
  <header class="header">
    <div class="header-content">
      <!-- 🏠 로고 -->
      <RouterLink to="/" class="logo-section text-decoration-none text-white">
        <img :src="myLogo" alt="맞추머니 로고" class="logo-img" />
        <span class="app-name text-white">맞추머니</span>
      </RouterLink>

      <!-- 메뉴 + 알림 + 프로필 -->
      <nav class="header-nav">
        <!-- ① 데스크탑 메뉴 -->
        <ul class="nav-menu d-none d-lg-flex">
          <!-- 페르소나 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'persona'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/persona/start" active-class="active"
              >페르소나</RouterLink
            >
            <div v-if="showDropdown === 'persona'" class="dropdown-submenu">
              <RouterLink to="/persona/deposits" class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink to="/persona/savings" class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/persona/cards" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 마이데이터 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'mydata'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/asset" active-class="active"
              >마이데이터</RouterLink
            >
            <div v-if="showDropdown === 'mydata'" class="dropdown-submenu">
              <RouterLink
                to="/deposits/recommendations/history"
                class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink
                to="/savings/recommendations/history"
                class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/mydata/cards" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 상품비교 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'compare'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/card" active-class="active">상품비교</RouterLink>
            <div v-if="showDropdown === 'compare'" class="dropdown-submenu">
              <RouterLink to="/compare/deposits" class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink to="/compare/savings" class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/compare/cards" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 교육 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'education'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/loan" active-class="active">교육</RouterLink>
            <div v-if="showDropdown === 'education'" class="dropdown-submenu">
              <RouterLink to="/education/quiz" class="dropdown-item"
                >퀴즈</RouterLink
              >
              <RouterLink to="/education/video" class="dropdown-item"
                >교육 영상</RouterLink
              >
            </div>
          </li>
        </ul>

        <!-- ② 알림 + 프로필 / 햄버거 -->
        <div class="header-actions">
          <!-- 🔔 알림 -->
          <div class="notification position-relative" @click="toggleNoti">
            <i class="bi bi-bell"></i>
            <div v-if="unreadCount" class="notification-dot"></div>

            <!-- 드롭다운 -->
            <div
              v-if="showNoti"
              class="dropdown-menu dropdown-menu-end show noti-dropdown"
            >
              <p
                v-if="notifications.length === 0"
                class="dropdown-item text-muted mb-0"
              >
                알림이 없습니다
              </p>
              <RouterLink
                v-for="n in notifications"
                :key="n.id"
                :to="n.link"
                class="dropdown-item small"
                @click="markAsRead(n.id)"
              >
                {{ n.text }}
              </RouterLink>
            </div>
          </div>

          <!-- 로그인/로그아웃 버튼 (데스크탑) - 알림과 프로필 사이에 위치 -->
          <button class="auth-btn d-none d-md-flex" @click="handleAuthAction">
            {{ isLoggedIn ? '로그아웃' : '로그인' }}
          </button>

          <!-- 🙍‍♂️ 프로필(데스크탑) - 로그인 시에만 표시 -->
          <RouterLink
            v-if="isLoggedIn"
            to="/mypage"
            class="profile-link d-none d-md-flex"
          >
            <img
              :src="profileImageSrc"
              alt="프로필"
              class="rounded-circle"
              style="width: 2.25rem; height: 2.25rem; object-fit: cover"
            />
          </RouterLink>

          <!-- 로그인 버튼(모바일) -->
          <button class="login-btn d-block d-md-none" @click="handleAuthAction">
            {{ isLoggedIn ? '로그아웃' : '로그인' }}
          </button>

          <!-- ☰ 햄버거(모바일) -->
          <button
            class="btn text-white fs-4 ms-3 d-lg-none"
            @click="showMenu = true"
          >
            ☰
          </button>
        </div>
      </nav>
    </div>

    <!-- 📱 모바일 사이드 메뉴 -->
    <SideMenu :visible="showMenu" @close="showMenu = false" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router'; // useRouter 추가
import { useAuthStore } from '@/stores/auth'; // 인증 스토어 추가
import SideMenu from '@/components/SideMenu.vue';
import defaultUser from '@/assets/user.png';
import myLogo from '@/assets/Logo.png';

/* ─────────── 인증 스토어 ─────────── */
const authStore = useAuthStore();
const router = useRouter(); // 라우터 추가

/* ─────────── 1. 모바일 메뉴 ─────────── */
const showMenu = ref(false);

/* ─────────── 드롭다운 메뉴 상태 ─────────── */
const showDropdown = ref(null);

/* ─────────── 2. 프로필 이미지 ────────── */
const profile_image_url = ref(''); // 로그인 후 URL 주입
const profileImageSrc = computed(() => profile_image_url.value || defaultUser);

/* ─────────── 🆕 로그인 상태 및 버튼 로직 ─────────── */
const isLoggedIn = computed(
  () => !!(authStore.accessToken && authStore.userId)
);

const handleAuthAction = () => {
  if (isLoggedIn.value) {
    // 로그아웃
    authStore.logout();
    // 홈페이지로 리다이렉트
    router.push('/');
  } else {
    // 로그인 페이지로 이동
    router.push('/login');
  }
};

/* ─────────── 3. 알림 로직 ──────────── */
const showNoti = ref(false);
const notifications = ref([
  {
    id: 1,
    text: '새 카드 추천이 도착했어요!',
    link: '/recommend',
    read: false,
  },
  {
    id: 2,
    text: '이번 달 소비 리포트가 업데이트됐어요.',
    link: '/history',
    read: false,
  },
]);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length
);

function toggleNoti() {
  showNoti.value = !showNoti.value;
}
function markAsRead(id) {
  const target = notifications.value.find((n) => n.id === id);
  if (target) target.read = true;
  showNoti.value = false;
}
function onKey(e) {
  if (e.key === 'Escape') showNoti.value = false;
}
onMounted(() => window.addEventListener('keydown', onKey));
</script>

<style scoped>
/* 기존 공통 변수·리셋이 global 에 있다면 @import 로 불러옵니다 */
@import '@/assets/main.css'; /* 필요하면 경로 수정 */

/* ─────────── 헤더 레이아웃 ─────────── */
.header {
  background: #40513b;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 2.5rem; /* horizontal padding moved here */
}
/* 로고 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.9375rem;
}
.logo {
  width: 2.8125rem;
  height: 2.8125rem;
  background: #609966;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}
.app-name {
  font-weight: 700;
  font-size: 1.5rem;
}

/* 메뉴 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 1.875rem;
  justify-content: flex-end;
}
.nav-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 🆕 네비게이션 아이템 스타일 */
.nav-item {
  position: relative;
}

.nav-menu a {
  color: inherit;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s;
  text-decoration: none;
}
.nav-menu a:hover {
  background: rgba(255, 255, 255, 0.1);
}
.nav-menu .active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

/* 🆕 드롭다운 서브메뉴 스타일 */
.dropdown-submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  padding: 8px 0;
  z-index: 1000;
  animation: fadeInDown 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  margin-top: 8px;
}

/* 드롭다운 화살표 */
.dropdown-submenu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #ffffff;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

.dropdown-submenu .dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

/* 각 메뉴 아이템에 아이콘 추가 */
.dropdown-submenu .dropdown-item::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #40513b);
  margin-right: 12px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.dropdown-submenu .dropdown-item:hover {
  background: var(--color-primary);
  color: var(--color-title);
  /* transform: translateX(4px); */
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.dropdown-submenu .dropdown-item:hover::before {
  background: #ffffff;
  opacity: 1;
  transform: scale(1.2);
}

/* 각 아이템 사이에 미세한 구분선 */
.dropdown-submenu .dropdown-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.1),
    transparent
  );
}

/* 드롭다운 애니메이션 개선 */
@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-15px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* 호버 시 메인 메뉴 아이템 스타일 개선 */
.nav-item:hover > a {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 액션 영역 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 알림 */
.notification {
  position: relative;
  font-size: 1.25rem;
  cursor: pointer;
}
.notification-dot {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  background: #ff0000;
  border-radius: 50%;
}
.noti-dropdown {
  min-width: 13.75rem;
  max-height: 15rem;
  overflow-y: auto;
  font-size: 0.85rem;
}

/* 프로필 */
.profile-link {
  display: flex;
  align-items: center;
}

/* 🆕 로그인/로그아웃 버튼(데스크탑) */
.auth-btn {
  background: transparent;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 1.5625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.auth-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 로그인 버튼(모바일) */
.login-btn {
  background: transparent;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 1.5625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 햄버거 버튼(모바일) */
.btn.fs-4 {
  line-height: 1;
}

/* 반응형 조정(선택) */
@media (max-width: 992px) {
  /* lg 미만 */
  .nav-menu {
    display: none;
  }
}
/* MainHeader.vue <styl scoped> 맨 아래에 추가 */
.notification .noti-dropdown {
  background-color: #fff; /* 투명 → 흰 배경 */
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.12); /* 그림자 부드럽게 단일화 */
  backdrop-filter: none; /* 혹시 상속됐다면 해제 */
  right: 0;
  left: auto; /* 아이콘 오른쪽 정렬 */
}
.logo-img {
  width: 2.8125rem;
  height: 2.8125rem;
  object-fit: contain;
  border-radius: 0.75rem;
}

/* Add margin below header to visually separate from content, if content is not offset by padding */
</style>
