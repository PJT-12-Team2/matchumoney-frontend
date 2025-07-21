<template>
  <nav class="navbar py-4" :style="{ backgroundColor: '#445C3C' }">
    <div class="container d-flex justify-content-between align-items-center">
      <!-- 🏠 홈 -->
      <RouterLink to="/" class="d-flex align-items-center gap-1 text-decoration-none">
        <img src="@/assets/Logo.png" alt="로고" style="height: 70px" />
        <span class="navbar-brand mb-0 h1 text-white">맞추머니</span>
      </RouterLink>

      <!-- ✅ 데스크탑 메뉴 -->
      <div class="d-none d-md-flex align-items-center gap-5">
        <RouterLink to="/"          class="nav-link">Home</RouterLink>
        <RouterLink to="/category"  class="nav-link">Category</RouterLink>
        <RouterLink to="/history"   class="nav-link">History</RouterLink>
        <RouterLink to="/education" class="nav-link">Education</RouterLink>

        <!-- 🔔 알림 버튼 + 드롭다운 -->
        <div class="position-relative">
          <button class="btn text-white p-0 fs-4" @click="toggleNoti">
            <i class="bi bi-bell"></i>
            <!-- 읽지 않은 알림 개수 배지 -->
            <span v-if="unreadCount" class="badge rounded-pill bg-danger noti-badge">
              {{ unreadCount }}
            </span>
          </button>

          <!-- 드롭다운 -->
          <div
            v-if="showNoti"
            class="dropdown-menu dropdown-menu-end show noti-dropdown"
          >
            <p v-if="notifications.length === 0" class="dropdown-item text-muted mb-0">
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

        <!-- 🙍‍♂️ 프로필 -->
        <RouterLink to="/profile" class="profile-link">
          <img
            :src="profileImageSrc"
            alt="프로필"
            class="rounded-circle"
            style="width: 36px; height: 36px; object-fit: cover"
          />
        </RouterLink>
      </div>

      <!-- ✅ 모바일 햄버거 -->
      <button class="btn text-white fs-4 ms-3 d-md-none" @click="showMenu = true">
        ☰
      </button>
    </div>

    <!-- 사이드 메뉴(모바일) -->
    <SideMenu :visible="showMenu" @close="showMenu = false" />
  </nav>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/* imports                                                             */
/* ------------------------------------------------------------------ */
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import SideMenu from '@/components/SideMenu.vue'

/* ------------------------------------------------------------------ */
/* 1. 모바일 메뉴 온/오프                                              */
/* ------------------------------------------------------------------ */
const showMenu = ref(false)

/* ------------------------------------------------------------------ */
/* 2. 프로필 이미지 (동적 URL + 기본 이미지)                            */
/* ------------------------------------------------------------------ */
// 👉 실제로는 로그인 시점 / Pinia·Vuex 스토어 등에서 받아오도록 변경
const profile_image_url = ref('') // 빈 값이면 기본 이미지 사용
// 기본 이미지
import defaultUser from '@/assets/user.png'
const profileImageSrc = computed(() =>
  profile_image_url.value ? profile_image_url.value : defaultUser
)

/* ------------------------------------------------------------------ */
/* 3. 알림 데이터 & 드롭다운                                           */
/* ------------------------------------------------------------------ */
const showNoti = ref(false)

/* 더미 알림 (id, text, link, read) */
const notifications = ref([
  { id: 1, text: '새 카드 추천이 도착했어요!', link: '/recommend', read: false },
  { id: 2, text: '이번 달 소비 리포트가 업데이트됐어요.', link: '/history', read: false }
])
const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

function toggleNoti() {
  showNoti.value = !showNoti.value
}

/* 알림 클릭 시 읽음 처리 */
function markAsRead(id) {
  const target = notifications.value.find(n => n.id === id)
  if (target) target.read = true
  // 드롭다운 자동 닫기
  showNoti.value = false
}

/* ESC 누르면 드롭다운 닫히게 */
function onKey(e) {
  if (e.key === 'Escape') showNoti.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
</script>

<style scoped>
/* 공통 링크 스타일 */
.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.95rem;
}
.nav-link:hover {
  text-decoration: underline;
}
/* 프로필 link 영역 */
.profile-link {
  display: flex;
  align-items: center;
}
/* 알림 배지 */
.noti-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  font-size: 0.6rem;
}
/* 드롭다운 */
.noti-dropdown {
  min-width: 220px;
  max-height: 240px;
  overflow-y: auto;
  font-size: 0.85rem;
}
/* 브랜드(맞추머니) */
.navbar-brand {
  font-size: 1.35rem;   /* 기본 1rem → 1.35rem ≈ 22 px */
  font-weight: 600;     /* 살짝 굵게 */
}

/* 메뉴 링크(Home, Category…) */
.nav-link {
  font-size: 1.05rem;   /* 기본 0.95 ➟ 1.05 rem ≈ 17 px */
  font-weight: 500;
}
</style>
