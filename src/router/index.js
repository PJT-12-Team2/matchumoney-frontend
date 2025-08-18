// router/index.js 또는 router.js
import KakaoCallbackPage from '@/pages/auth/KakaoCallbackPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

/* ── 페이지 컴포넌트 ─────────────────────── */
import LoginPage from '@/pages/auth/LoginPage.vue';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.vue';
import SignupPage from '@/pages/auth/SignupPage.vue';
import RecommendDeposit from '@/pages/deposit/RecommendDeposit.vue';
import HomePage from '@/pages/HomePage.vue';
import MyInfoPage from '@/pages/user/MyInfoPage.vue';
import MyPage from '@/pages/user/MyPage.vue';
import UpdatePasswordPage from '@/pages/user/UpdatePasswordPage.vue';
import UpdateUserInfoPage from '@/pages/user/UpdateUserInfoPage.vue';
import FavoritePage from '@/pages/user/MyFavoritePage.vue';
import FortunePage from '@/pages/quiz/FortunePage.vue';
import PersonaCardAllList from '@/pages/persona/PersonaCardAllList.vue';
import PersonaDepositAllList from '@/pages/persona/PersonaDepositAllListPage.vue';
import PersonaSavingAllList from '@/pages/persona/PersonaSavingAllListPage.vue';
import PersonaSurveyPage from '@/pages/persona/PersonaSurveyPage.vue';
import PersonaSurveyStart from '@/pages/persona/PersonaSurveyStartPage.vue';

import MyDataCardPage from '@/pages/mydata/MyDataCardPage.vue';
import RecommendSavings from '@/pages/savings/recommendations/RecommendSavings.vue';

import CardRecommendationPage from '@/pages/cards/CardRecommendationPage.vue';

import CardDetailPage from '@/pages/detail/CardDetailPage.vue';
import DepositDetailPage from '@/pages/detail/DepositDetailPage.vue';
import SavingDetailPage from '@/pages/detail/SavingDetailPage.vue';

import EducationBoardPage from '@/components/education/EducationBoardPage.vue';
import WebtoonPage from '@/components/education/WebtoonPage.vue';
import VideoPage from '@/components/education/EducationVideoBoardPage.vue';
import QuizEntry from '@/pages/quiz/QuizEntry.vue';
import ComparePage from '@/pages/compare/ComparePage.vue';

import DailyQuiz from '@/pages/quiz/DailyQuiz.vue';
/* 결과 페이지 (동적 import) */
const ResultPage = () => import('@/pages/persona/PersonaResultPage.vue');

/* 8종 페르소나 코드 */
const personaCodes = [
  'turtle',
  'squirrel',
  'ant',
  'owl',
  'rabbit',
  'cat',
  'tiger',
  'penguin',
];

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: false }, // 메인 페이지는 공개
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
    meta: { requiresAuth: false }, // 회원가입은 공개
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }, // 로그인은 공개
  },
  {
    path: '/oauth/kakao/callback',
    name: 'KakaoCallback',
    component: KakaoCallbackPage,
    meta: { requiresAuth: false }, // 카카오 콜백은 공개
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPasswordPage,
    meta: { requiresAuth: false }, // 비밀번호 재설정은 공개
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
    meta: { requiresAuth: true }, // 마이페이지는 인증 필요
  },
  { path: '/myinfo', name: 'myinfo', component: MyInfoPage },
  {
    path: '/myinfo/update',
    name: 'updateUserInfo',
    component: UpdateUserInfoPage,
  },
  {
    path: '/myinfo/update/password',
    name: 'updatePassword',
    component: UpdatePasswordPage,
  },

  {
    path: '/myinfo/update',
    name: 'updateUserInfo',
    component: UpdateUserInfoPage,
  },
  {
    path: '/myinfo/update/password',
    name: 'updatePassword',
    component: UpdatePasswordPage,
  },
  {
    path: '/detail/deposit/:depositId',
    name: 'DepositDetail',
    component: DepositDetailPage,
    props: true,
  },
  {
    path: '/detail/card/:cardId',
    name: 'CardDetail',
    component: CardDetailPage,
    props: true,
  },
  {
    path: '/detail/saving/:savingId',
    name: 'SavingDetail',
    component: SavingDetailPage,
    props: true,
  },
  {
    path: '/detail/deposit/:depositId',
    name: 'DepositDetail',
    component: DepositDetailPage,
    props: true,
  },
  {
    path: '/detail/card/:cardId',
    name: 'CardDetail',
    component: CardDetailPage,
    props: true,
  },
  {
    path: '/detail/saving/:savingId',
    name: 'SavingDetail',
    component: SavingDetailPage,
    props: true,
  },
  {
    path: '/deposits/recommendations/history',
    name: 'RecommendDeposit',
    component: RecommendDeposit,
  },
  {
    path: '/savings/recommendations/history',
    name: 'RecommendSavings',
    component: RecommendSavings,
  },
  {
    path: '/compare',
    name: 'ComparePage',
    component: ComparePage,
  },

  {
    path: '/mydata/cards',
    name: 'MyDataCards',
    component: MyDataCardPage,
  },
  {
    path: '/cards/recommendations',
    name: 'CardRecommendations',
    component: CardRecommendationPage,
  },
  {
    path: '/cards/recommendations/:cardId',
    name: 'CardRecommendation',
    component: CardRecommendationPage,
    props: true,
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: FortunePage,
    props: true,
  },
  {
    path: '/education',
    children: [
      { path: 'quiz', name: 'quiz', component: QuizEntry },
      { path: 'contents', name: 'contents', component: EducationBoardPage },
      { path: 'video', name: 'video', component: VideoPage },
      {
        path: 'video/full/:videoId',
        name: 'VideoDetail',
        component: () => import('@/components/education/VideoDetailPage.vue'),
        props: true,
      },
      { path: 'webtoon', name: 'webtoon', component: WebtoonPage },
    ],
  },
  {
    path: '/quiz',
    children: [
      { path: '', name: 'QuizEntry', component: QuizEntry },
      { path: 'daily', name: 'DailyQuiz', component: DailyQuiz },
    ],
  },
  {
    path: '/persona',
    children: [
      { path: 'start', name: 'PersonaTest', component: PersonaSurveyStart },
      { path: 'survey', name: 'PersonaSurvey', component: PersonaSurveyPage },
      { path: 'cards', name: 'PersonaCards', component: PersonaCardAllList },
      {
        path: 'savings',
        name: 'PersonaSavings',
        component: PersonaSavingAllList,
      },
      {
        path: 'deposits',
        name: 'PersonaDeposits',
        component: PersonaDepositAllList,
      },
      {
        path: 'result/:code',
        name: 'PersonaResult',
        component: ResultPage,
        props: true,
        beforeEnter: (to, _, next) => {
          if (personaCodes.includes(to.params.code)) next();
          else next('/');
        },
      },
    ],
  },
  { path: '/survey', redirect: '/persona/survey' },
  { path: '/personatest', redirect: '/persona/test' },
  { path: '/personaCardList', redirect: '/persona/cards' },
  ...personaCodes.map((c) => ({
    path: `/${c}`,
    redirect: `/persona/result/${c}`,
  })),
  {
    path: '/favorites',
    name: 'favoritePage',
    component: FavoritePage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// 공개 페이지 (로그인 없이 접근 가능)
const publicRoutes = [
  '/', // 메인 페이지
  '/login', // 로그인
  '/signup', // 회원가입
  '/reset-password', // 비밀번호 재설정
  '/oauth/kakao/callback', // 카카오 콜백
];

// 라우터 가드 설정
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isPublicRoute =
    publicRoutes.includes(to.path) || to.meta?.requiresAuth === false;

  // 공개 라우트라면 통과
  if (isPublicRoute) {
    next();
    return;
  }

  // 인증이 필요한 페이지인 경우 로그인 확인
  if (!authStore.isLoggedIn) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // 로그인 후 원래 페이지로 돌아가기 위한 정보
    });
    return;
  }

  // 로그인된 경우 통과
  next();
});

export default router;
