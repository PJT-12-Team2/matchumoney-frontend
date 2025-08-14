<template>
  <!-- 🟢 상단 헤더 -->
  <header class="header">
    <div class="header-content">
      <!-- 🏠 로고 -->
      <RouterLink to="/" class="logo-section text-decoration-none text-white">
        <img :src="myLogo" alt="맞추머니 로고" class="logo-img" />
        <span class="app-name text-black">맞추머니</span>
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
            <RouterLink
              to="/deposits/recommendations/history"
              active-class="active"
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
            <RouterLink to="/compare" active-class="active"
              >상품비교</RouterLink
            >
            <div v-if="showDropdown === 'compare'" class="dropdown-submenu">
              <RouterLink to="/compare?type=DEPOSIT" class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink to="/compare?type=SAVING" class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/compare?type=CARD" class="dropdown-item"
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
            <RouterLink to="/education/quiz" active-class="active"
              >교육</RouterLink
            >
            <div v-if="showDropdown === 'education'" class="dropdown-submenu">
              <RouterLink to="/education/quiz" class="dropdown-item"
                >퀴즈</RouterLink
              >
              <RouterLink to="/education/contents" class="dropdown-item"
                >교육 콘텐츠</RouterLink
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
            class="btn text-black fs-4 ms-3 d-lg-none"
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

/* ─────────── 로그인 상태 및 버튼 로직 ─────────── */
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
  background: #ffffff;
  color: #1e2b4e;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-dark);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 2.5rem;
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
  background: var(--color-accent);
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

/* 네비게이션 아이템 스타일 */
.nav-item {
  position: relative;
  background: var(--color-white);
  color: var(--color-dark);
}

.nav-menu a {
  color: inherit;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s;
  text-decoration: none;
}
.nav-menu a:hover {
  background: var(--color-light);
}
.nav-menu .active {
  background: var(--color-white-20);
  font-weight: 700;
}

/* 드롭다운 서브메뉴 스타일 */
.dropdown-submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  min-width: 140px;
  padding: 8px 0;
  z-index: 1000;
  animation: fadeInDown 0.3s ease-out;
  border: 1px solid var(--border-light);
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
  border-bottom: 8px solid var(--color-white);
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

.dropdown-submenu .dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--text-primary);
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
  background: linear-gradient(135deg, var(--color-accent), var(--color-dark));
  margin-right: 12px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.dropdown-submenu .dropdown-item:hover {
  background: var(--color-primary);
  color: var(--text-primary);
  box-shadow: inset 0 0 20px var(--color-white-10);
}

.dropdown-submenu .dropdown-item:hover::before {
  background: var(--color-white);
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
    var(--border-light),
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
  background: var(--color-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  font-weight: bold;
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
  background: var(--color-error);
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

/* 로그인/로그아웃 버튼(데스크탑) */
.auth-btn {
  background: var(--color-dark);
  border: 0.125rem solid var(--color-white);
  color: var(--color-white);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.auth-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 로그인 버튼(모바일) */
.login-btn {
  background: var(--color-white);
  border: 0.125rem solid var(--color-white);
  color: var(--color-dark);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

/* 알림 드롭다운 스타일 개선 */
.notification .noti-dropdown {
  background-color: var(--color-white);
  box-shadow: var(--shadow-lg);
  backdrop-filter: none;
  right: 0;
  left: auto;
}

.logo-img {
  width: 2.8125rem;
  height: 2.8125rem;
  object-fit: contain;
  border-radius: 0.75rem;
}

/* CSS 변수로 추가된 투명도 색상들 */
:root {
  --color-white-10: rgba(255, 255, 255, 0.1);
  --color-white-15: rgba(255, 255, 255, 0.15);
  --color-white-20: rgba(255, 255, 255, 0.2);
  —color-white-30: rgba(255, 255, 255, 0.3);
  —color-white-50: rgba(255, 255, 255, 0.5);
}
</style>
