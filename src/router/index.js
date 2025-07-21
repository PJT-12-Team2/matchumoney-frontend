import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import PersonaSurveyPage from '../pages/PersonaSurveyPage.vue'
import TurtleResult from '@/pages/persona/TurtleResult.vue';
import SquirrelResult from '@/pages/persona/SquirrelResult.vue';
import AntResult from '@/pages/persona/AntResult.vue';
import OwlResult from '@/pages/persona/OwlResult.vue';
import RabbitResult from '@/pages/persona/RabbitResult.vue';
import CatResult from '@/pages/persona/CatResult.vue';
import TigerResult from '@/pages/persona/TigerResult.vue';
import PenguinResult from '@/pages/persona/PenguinResult.vue';
import CardTestPage from '@/pages/PersonaTestPage.vue';
import PersonaCardList from "@/pages/PersonaCardList.vue";


const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/survey",
    name: "survey",
    component: PersonaSurveyPage,
  },
  { path: '/turtle', name: 'turtle', component: TurtleResult },
  { path: '/squirrel', name: 'squirrel', component: SquirrelResult },
  { path: '/ant', name: 'ant', component: AntResult },
  { path: '/owl', name: 'owl', component: OwlResult },
  { path: '/rabbit', name: 'rabbit', component: RabbitResult },
  { path: '/cat', name: 'cat', component: CatResult },
  { path: '/tiger', name: 'tiger', component: TigerResult },
  { path: '/penguin', name: 'penguin', component: PenguinResult },
  {
    path: '/personatest',
    name: 'CardTest',
    component: CardTestPage
  },
  { path: '/personaCardList',
    name : 'personaCardList',
    component: PersonaCardList
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
