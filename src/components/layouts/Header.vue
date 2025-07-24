<!-- src/components/MainHeader.vue -->
<template>
  <!-- 🟢 상단 헤더 -->
  <header class="header">
    <div class="header-content">
      <!-- 🏠 로고 -->
      <RouterLink
        to="/"
        class="logo-section text-decoration-none text-white"
      >
      <img :src="myLogo" alt="맞추머니 로고" class="logo-img" />
      <span class="app-name text-white">맞추머니</span>
      </RouterLink>

      <!-- ✅ 메뉴 + 알림 + 프로필 -->
      <nav class="header-nav">
        <!-- ① 데스크탑 메뉴 -->
        <ul class="nav-menu d-none d-lg-flex">
          <li><RouterLink to="/recommend"  active-class="active">상품추천</RouterLink></li>
          <li><RouterLink to="/asset"      active-class="active">자산관리</RouterLink></li>
          <li><RouterLink to="/card"       active-class="active">카드</RouterLink></li>
          <li><RouterLink to="/loan"       active-class="active">대출</RouterLink></li>
          <li><RouterLink to="/insurance"  active-class="active">보험</RouterLink></li>
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

          <!-- 🙍‍♂️ 프로필(데스크탑) -->
          <RouterLink to="/profile" class="profile-link d-none d-md-flex">
            <img
              :src="profileImageSrc"
              alt="프로필"
              class="rounded-circle"
              style="width: 36px; height: 36px; object-fit: cover"
            />
          </RouterLink>

          <!-- 로그인 버튼(모바일) -->
          <button
            class="login-btn d-block d-md-none"
            @click="$router.push('/auth/login')"
          >
            로그인
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
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import SideMenu    from '@/components/SideMenu.vue'
import defaultUser from '@/assets/user.png'
import myLogo from '@/assets/Logo.png'         /* ✅ 추가 */

/* ─────────── 1. 모바일 메뉴 ─────────── */
const showMenu = ref(false)

/* ─────────── 2. 프로필 이미지 ────────── */
const profile_image_url = ref('')            // 로그인 후 URL 주입
const profileImageSrc   = computed(() =>
  profile_image_url.value || defaultUser
)

/* ─────────── 3. 알림 로직 ──────────── */
const showNoti      = ref(false)
const notifications = ref([
  { id: 1, text: '새 카드 추천이 도착했어요!', link: '/recommend', read: false },
  { id: 2, text: '이번 달 소비 리포트가 업데이트됐어요.', link: '/history',   read: false }
])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNoti() { showNoti.value = !showNoti.value }
function markAsRead(id) {
  const target = notifications.value.find(n => n.id === id)
  if (target) target.read = true
  showNoti.value = false
}
function onKey(e) { if (e.key === 'Escape') showNoti.value = false }
onMounted(() => window.addEventListener('keydown', onKey))
</script>

<style scoped>
/* 기존 공통 변수·리셋이 global 에 있다면 @import 로 불러옵니다 */
@import "@/assets/main.css";          /* 필요하면 경로 수정 */

/* ─────────── 헤더 레이아웃 ─────────── */
.header { background:#40513b; color:#fff; padding:20px 40px; position:sticky; top:0; z-index:100; }
.header-content { display:flex; justify-content:space-between; align-items:center; max-width:1160px; margin:0 auto; }

/* 로고 */
.logo-section { display:flex; align-items:center; gap:15px; }
.logo { width:45px; height:45px; background:#609966; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px; }
.app-name { font-weight:700; font-size:24px; }

/* 메뉴 */
.header-nav   { display:flex; align-items:center; gap:30px; justify-content: flex-end; }
.nav-menu     { display:flex; gap:25px; list-style:none; margin:0; padding:0; }
.nav-menu a   { color:inherit; padding:8px 16px; border-radius:8px; transition:background .3s; }
.nav-menu a:hover { background:rgba(255,255,255,.1); }
.nav-menu .active { background:rgba(255,255,255,.2); font-weight:700; }

/* 액션 영역 */
.header-actions { display:flex; align-items:center; gap:20px; }

/* 알림 */
.notification      { position:relative; font-size:20px; cursor:pointer; }
.notification-dot  { position:absolute; top:-2px; right:-2px; width:8px; height:8px; background:#ff0000; border-radius:50%; }
.noti-dropdown     { min-width:220px; max-height:240px; overflow-y:auto; font-size:.85rem; }

/* 프로필 */
.profile-link { display:flex; align-items:center; }

/* 로그인 버튼(모바일) */
.login-btn { background:transparent; border:2px solid rgba(255,255,255,.3); color:#fff; padding:8px 16px; border-radius:25px; font-size:14px; font-weight:600; }

/* 햄버거 버튼(모바일) */
.btn.fs-4 { line-height:1; }

/* 반응형 조정(선택) */
@media (max-width: 992px) { /* lg 미만 */
  .nav-menu { display:none; }
}
/* MainHeader.vue <style scoped> 맨 아래에 추가 */
.notification .noti-dropdown {
  background-color: #fff;           /* 투명 → 흰 배경 */
  box-shadow: 0 8px 16px rgba(0,0,0,.12); /* 그림자 부드럽게 단일화 */
  backdrop-filter: none;            /* 혹시 상속됐다면 해제 */
  right: 0; left: auto;             /* 아이콘 오른쪽 정렬 */
}
.logo-img { width:45px; height:45px; object-fit:contain; border-radius:12px; }
</style>