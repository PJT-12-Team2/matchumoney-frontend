import { createRouter, createWebHistory } from 'vue-router'

/* ── 페이지 컴포넌트 ─────────────────────── */
import HomePage              from '@/pages/HomePage.vue'
import PersonaSurveyPage     from '@/pages/persona/PersonaSurveyPage.vue'
import PersonaSurveyStart    from '@/pages/persona/PersonaSurveyStartPage.vue'
import PersonaCardAllList    from '@/pages/persona/PersonaCardAllList.vue'
import PersonaDepositAllList from '@/pages/persona/PersonaDepositAllListPage.vue'
import PersonaSavingAllList from '@/pages/persona/PersonaSavingAllListPage.vue'
/*  결과 페이지 (동적)  */
const ResultPage   = () => import('@/pages/persona/PersonaResultPage.vue')


/* 8종 페르소나 코드 */
const personaCodes = [
  'turtle', 'squirrel', 'ant', 'owl', 'rabbit', 'cat', 'tiger', 'penguin'
]

const routes = [
  /* ── 홈 ─────────────────────────────────── */
  { path: '/', name: 'home', component: HomePage },

  /* ── persona 그룹 (prefix) ───────────────── */
  {
    path: '/persona',
    children: [
      /* 설문 시작 화면   → /persona/test  (예: 소개·스타트) */
      { path: 'start',      name: 'PersonaTest',   component: PersonaSurveyStart },

      /* 설문 본문       → /persona/survey */
      { path: 'survey',    name: 'PersonaSurvey', component: PersonaSurveyPage },

      /* 카드 전체 리스트 → /persona/cards */
      { path: 'cards',     name: 'PersonaCards',  component: PersonaCardAllList },
      { path: 'savings',     name: 'PersonaSavings',  component: PersonaSavingAllList },
      { path: 'deposits',     name: 'PersonaDeposits',  component: PersonaDepositAllList },

      /* 결과 페이지      → /persona/result/:code */
      {
        path: 'result/:code',
        name: 'PersonaResult',
        component: ResultPage,
        props: true,
        beforeEnter: (to, _, next) => {
          if (personaCodes.includes(to.params.code)) next()
          else next('/')
        }
      }
    ]
  },

  /* ── 예전 경로 리다이렉트 (SEO·북마크 유지) ───────────── */
  { path: '/survey',       redirect: '/persona/survey' },
  { path: '/personatest',  redirect: '/persona/test'   },
  { path: '/personaCardList', redirect: '/persona/cards' },
  ...personaCodes.map(c => ({ path: `/${c}`, redirect: `/persona/result/${c}` })),
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})