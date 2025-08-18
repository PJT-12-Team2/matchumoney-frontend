<template>
  <div class="my-page">
    <BackButton />
    <h1 class="greeting area-greeting">
      <strong>{{ user?.nickname ?? '사용자' }}</strong>
      님. 오늘도 화이팅하세요!
    </h1>
    <BaseCardGrey class="profile-section">
      <template #title>
        <div class="section-header">
          <span>내 정보</span>
          <button class="link-minimal" @click="router.push('/myinfo')">
            내 정보 관리
          </button>
        </div>
      </template>
      <template #content>
        <section class="user-info">
          <div class="profile-image-placeholder">
            <img
              :src="profileImageUrl"
              alt="프로필 이미지"
              class="profile-image"
            />
          </div>
          <div class="user-text">
            <div class="user-name-and-meta">
              <h1 class="user-name">
                <span class="nickname">{{
                  user?.nickname ?? '정보 없음'
                }}</span>
                <span class="level-title">님</span>
                <span :class="['top-percent-badge', topPercentClass]"
                  >상위 {{ topPercent }}%</span
                >
              </h1>
              <ul class="user-meta-horizontal">
                <li v-if="user?.gender">{{ user.gender }}</li>
                <li v-if="user?.birth">{{ user.birth }}</li>
                <li v-if="user?.email">{{ user.email }}</li>
              </ul>
            </div>
            <div class="xp-panel" role="region" aria-label="내 경험치">
              <div class="xp-row">
                <span class="xp-title">내 경험치</span>
                <span class="xp-badge">Lv. {{ level }}</span>
              </div>
              <div class="xp-bar" aria-hidden="true">
                <div
                  class="xp-bar-fill"
                  :style="{ width: fillPercentage }"
                ></div>
              </div>
              <div class="xp-stats">
                <span class="xp-now">{{ exp % 100 }}/100</span>
                <span class="xp-next"
                  >다음 레벨까지 {{ 100 - (exp % 100) }}xp</span
                >
              </div>
            </div>
          </div>
        </section>
      </template>
    </BaseCardGrey>

    <div class="left-grid">
      <BaseCardGrey>
        <template #title>
          <div class="section-header">
            <span>나의 카드</span>
            <button class="link-minimal" @click="router.push('/cards/manage')">
              카드 편집
            </button>
          </div>
        </template>
        <template #content>
          <div class="card-slider-wrapper compact">
            <!-- 카드가 있을 때 -->
            <CardVisualSlider
              v-if="cards && cards.length > 0"
              :cards="cards"
              @add-card="handleCardRegistration"
            />
            <!-- 카드가 없을 때 -->
            <CardRegistrationPrompt
              v-else
              title="내 카드 정보 불러오기"
              description="CODEF를 통해 카드 정보를 연동하여 맞춤 추천을 받아보세요!"
              @register="handleCardRegistration"
            />
          </div>
        </template>
      </BaseCardGrey>
    </div>

    <div class="right-grid">
      <BaseCardGrey style="height: 100%">
        <template #title>
          <div class="persona-header">
            <span>나의 페르소나</span>
            <button
              class="fav-view-all-btn"
              @click="router.push('/persona/start')"
            >
              페르소나 수정
            </button>
          </div>
        </template>
        <template #content>
          <div class="persona-card">
            <div class="persona-figure">
              <img
                :src="personaImageUrl"
                alt="페르소나 이미지"
                class="persona-image"
              />
              <div class="speech-bubble" role="note">
                레벨이 오를수록<br />제가 진화해요!
              </div>
            </div>
            <h3 class="persona-name">{{ myPageInfo?.persona?.nameKo }} 유형</h3>
            <p class="persona-desc">{{ myPageInfo?.persona?.quote }}</p>
            <div class="persona-extras">
              <div class="extras-title">추천 바로가기</div>
              <div class="extras-actions">
                <button
                  class="extras-btn"
                  @click="router.push(`/persona/savings`)"
                >
                  적금 추천
                </button>
                <button
                  class="extras-btn"
                  @click="router.push(`/persona/deposits`)"
                >
                  예금 추천
                </button>
                <button
                  class="extras-btn"
                  @click="router.push(`/persona/cards`)"
                >
                  카드 추천
                </button>
              </div>
            </div>
          </div>
        </template>
      </BaseCardGrey>
    </div>

    <!-- 즐겨찾기 가로 리스트 (전체 폭, 새 행) -->
    <div class="favorites-row">
      <BaseCardGrey>
        <template #title>
          <div class="section-header favbar-header">
            <span>내 즐겨찾기</span>
            <button class="link-minimal" @click="router.push('/favorites')">
              전체 보기
            </button>
          </div>
        </template>
        <template #content>
          <div class="favbar">
            <!-- Tabs on the first row (horizontal) -->
            <div class="favbar-tabs" role="tablist" aria-label="즐겨찾기 탭">
              <button
                :class="{ active: selectedTab === '예금' }"
                role="tab"
                :aria-selected="selectedTab === '예금'"
                @click="selectedTab = '예금'"
              >
                예금
              </button>
              <button
                :class="{ active: selectedTab === '적금' }"
                role="tab"
                :aria-selected="selectedTab === '적금'"
                @click="selectedTab = '적금'"
              >
                적금
              </button>
              <button
                :class="{ active: selectedTab === '카드' }"
                role="tab"
                :aria-selected="selectedTab === '카드'"
                @click="selectedTab = '카드'"
              >
                카드
              </button>
            </div>
            <br />
            <!-- Products under the tabs (full width) -->
            <div class="favbar-scroller" tabindex="0">
              <div
                v-for="(p, i) in getProductsByTab"
                :key="'h-' + i"
                class="hcard"
                @click="selectProduct(p)"
              >
                <div class="hcard-thumb" v-if="p.type !== '카드'">
                  <img
                    v-if="getBankLogo(p.bankName)"
                    :src="getBankLogo(p.bankName)"
                    alt=""
                  />
                  <div v-else class="thumb-fallback">
                    <img
                      :src="disLogo"
                      alt="로고 없음"
                      class="thumb-fallback-img"
                    />
                  </div>
                </div>
                <div class="hcard-thumb" v-else>
                  <img
                    v-if="p.productImage"
                    :src="p.productImage"
                    alt="카드 이미지"
                  />
                  <div v-else class="thumb-fallback">
                    <img
                      :src="disLogo"
                      alt="로고 없음"
                      class="thumb-fallback-img"
                    />
                  </div>
                </div>

                <div class="hcard-body">
                  <div class="hcard-name" :title="p.productName">
                    {{ p.productName || '항목 없음' }}
                  </div>
                  <div class="hcard-meta">
                    <template v-if="p.type !== '카드'">
                      <div class="meta-line">
                        <span class="chip">{{ p.bankName || '은행' }}</span>
                      </div>
                      <div class="meta-line">
                        <template v-if="p.maxIntrRate2">
                          최고 {{ p.maxIntrRate2 }}%
                          <template v-if="p.maxSaveTrm"
                            >/ {{ p.maxSaveTrm }}개월</template
                          >
                        </template>
                        <template v-else-if="p.maxIntrRate">
                          최고 {{ p.maxIntrRate }}%
                          <template v-if="p.maxSaveTrm"
                            >/ {{ p.maxSaveTrm }}개월</template
                          >
                        </template>
                      </div>
                    </template>
                    <template v-else>
                      <span class="chip chip--tight">{{
                        p.credit ? p.credit + '카드' : '카드'
                      }}</span>
                      <div v-if="p.annualFee" class="fee-inline">
                        {{ formatAnnualFee(p.annualFee) }}
                      </div>
                      <div v-if="p.preMonthMoney">
                        전월실적 {{ (p.preMonthMoney / 10000).toFixed(0) }}만원
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div v-if="!getProductsByTab?.length" class="hcard empty">
                해당 즐겨찾기가 없습니다
              </div>
            </div>
          </div>
        </template>
      </BaseCardGrey>
    </div>

    <!-- Quick actions -->
    <div class="actions-grid area-actions">
      <button
        v-for="(a, i) in quickActions"
        :key="i"
        class="action-card"
        @click="handleQuickAction(a)"
      >
        <div class="action-icon" aria-hidden="true">
          <i v-if="a.iconClass" :class="a.iconClass"></i>
          <span v-else>{{ a.icon }}</span>
        </div>
        <div class="action-texts">
          <div class="action-title">{{ a.title }}</div>
          <div class="action-desc">{{ a.desc }}</div>
        </div>
      </button>
    </div>
  </div>

  <!-- 카드 동기화 모달 -->
  <CardSyncModal
    :isVisible="showSyncModal"
    @close="showSyncModal = false"
    @sync="handleCardSync"
  />
</template>

<script setup>
import CardVisualSlider from '@/components/cards/CardVisualSlider.vue';
import CardSyncModal from '@/components/cards/CardSyncModal.vue';
import CardRegistrationPrompt from '@/components/cards/CardRegistrationPrompt.vue';
import BaseCardGrey from '@/components/base/BaseCardGrey.vue';
import BackButton from '@/components/common/BackButton.vue';
import { ref, computed, onMounted } from 'vue';
import userApi from '@/api/user';
import cardsApi from '@/api/cards';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const cards = ref([]);
const showSyncModal = ref(false);
const isLoading = ref(false);

// 상위 퍼센트
const topPercent = ref(null);
const topPercentClass = computed(() => {
  const percent = Number(topPercent.value);
  if (!Number.isFinite(percent)) return 'badge-newbie';

  if (percent <= 1) return 'badge-diamond';
  if (percent <= 10) return 'badge-platinum';
  if (percent <= 35) return 'badge-gold';
  if (percent <= 60) return 'badge-silver';
  if (percent <= 85) return 'badge-bronze';
  return 'badge-newbie';
});

const userMeta = computed(() => {
  const parts = [];
  if (user.value.birth) parts.push(user.value.birth);
  if (user.value.gender) parts.push(user.value.gender);
  if (user.value.email) parts.push(user.value.email);
  return parts.join(' / ');
});
const userId = computed(() => authStore.getUserId());
function parseAnnualFee(raw) {
  if (!raw) return [];
  // Split by '/', remove square brackets and extra spaces
  return String(raw)
    .split('/')
    .map((s) => s.replace(/[\[\]]/g, '').trim())
    .filter(Boolean);
}
function formatAnnualFee(raw) {
  return parseAnnualFee(raw).join(' ㆍ ');
}
// 카드 동기화
const handleCardSync = async (syncData) => {
  if (!userId.value) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  try {
    const requestData = {
      userId: parseInt(userId.value),
      cardId: syncData.cardId,
      cardPw: syncData.cardPw,
    };

    const response = await cardsApi.syncKbCards(requestData);

    alert(`${response.message || '카드 동기화가 완료되었습니다.'}`);

    // 카드 동기화 모달 닫기
    showSyncModal.value = false;

    // 목록 새로고침
    await fetchCards();
  } catch (error) {
    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 400) {
      alert(
        '입력 정보가 올바르지 않습니다. 카드 ID와 비밀번호를 확인해주세요.'
      );
    } else if (error.response?.status === 500) {
      alert('마이데이터 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert(
        `카드 동기화에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

// 카드 슬라이더에서 카드 변경 시 거래내역 및 카드 혜택 조회
const handleCardChange = async (card) => {
  // console.log("🔄 카드 변경:", card.cardName);
  await Promise.all([
    loadExistingTransactions(card),
    loadCurrentCardBenefits(card),
  ]);
};

// 카드 업데이트 (CardSyncModal 표시)
const handleCardUpdate = () => {
  // console.log("카드 업데이트 버튼 클릭 - CardSyncModal 표시");
  showSyncModal.value = true;
};

// 카드 등록 핸들러
const handleCardRegistration = () => {
  showSyncModal.value = true;
};

const fetchCards = async () => {
  if (!userId.value) {
    console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  isLoading.value = true;
  try {
    console.log('📋 카드 목록 조회 시작, userId:', userId.value);
    const response = await cardsApi.getUserCards(userId.value);
    console.log('✅ 카드 목록 조회 성공:', response);

    cards.value = response.result || [];

    // if (cards.value.length === 0) {
    //   console.log("💡 등록된 카드가 없습니다.");
    // } else {
    //   console.log(`💡 ${cards.value.length}개의 카드를 불러왔습니다.`);
    // }
  } catch (error) {
    console.error('❌ 카드 목록 조회 실패:', error);

    if (error.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      authStore.logout();
      router.push('/login');
    } else if (error.response?.status === 404) {
      console.log('💡 사용자 카드 정보가 없습니다.');
      cards.value = [];
    } else {
      alert(
        `카드 목록을 불러오는데 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  } finally {
    isLoading.value = false;
  }
};
const router = useRouter();
const user = ref({});
user.value.birth = '';
user.value.email = '';
user.value.gender = '';
function mapGender(raw) {
  if (!raw && raw !== 0) return '';
  const v = String(raw).trim().toUpperCase();
  // Common codes and variants
  if (['M', 'MALE', '남', '남성', '1', '01'].includes(v)) return '남성';
  if (['F', 'FEMALE', '여', '여성', '2', '02'].includes(v)) return '여성';
  // Fallback: return original when it's already a user-facing string
  return raw;
}
const exp = ref(0); // default exp
const level = computed(() => Math.floor(exp.value / 100) + 1);
const fillPercentage = computed(() => `${exp.value % 100}%`);

const expCurrent = computed(() => exp.value % 100);
const expRemaining = computed(() => 100 - (exp.value % 100));

const selectedTab = ref('예금');

// ✅ Quick action routes (필요 시 프로젝트 라우트에 맞게 경로만 바꿔주세요)
const ROUTES = {
  quizHistory: '/education/quiz', // 내 퀴즈 푼거 보기
  favorites: '/compare', // 내 즐겨찾기 바로가기 (기존에 사용 중)
  mydataSpending: '/mydata/cards', // 마이데이터 소비내역 보기
  personaResult: '/persona/result', // 내 페르소나 결과보기
};

const quickActions = [
  {
    title: '내 퀴즈 기록 보기',
    desc: '최근 퀴즈 기록을 확인해요',
    iconClass: 'fa-solid fa-question',
    icon: '',
    route: ROUTES.quizHistory,
  },
  {
    title: '내 비교함 바로가기',
    desc: '비교함에 있는 상품을 한눈에',
    iconClass: 'fa-solid fa-code-compare',
    icon: '',
    route: ROUTES.favorites,
  },
  {
    title: '마이데이터 소비내역 보기',
    desc: '이번 달 지출 흐름 보기',
    iconClass: 'fa-solid fa-database',
    icon: '',
    route: ROUTES.mydataSpending,
  },
  {
    key: 'personaResult',
    title: '내 페르소나 결과보기',
    desc: '나의 유형 다시보기',
    iconClass: 'fa-solid fa-person',
    icon: '',
    route: ROUTES.personaResult, // base path, slug는 핸들러에서 붙임
  },
];

// 한글 페르소나명 → 영문 슬러그 매핑
const PERSONA_SLUG_MAP = {
  고양이: 'cat',
  개미: 'ant',
  토끼: 'rabbit',
  거북이: 'turtle',
  펭귄: 'penguin',
  부엉이: 'owl',
  호랑이: 'tiger',
  다람쥐: 'squirrel',
};

function mapPersonaSlugFromName(nameKo) {
  if (!nameKo) return '';
  return PERSONA_SLUG_MAP[nameKo.trim()] || '';
}

function extractSlugFromImage(url) {
  if (!url) return '';
  const file = (url.split('/').pop() || '').toLowerCase();
  return file.replace(/\.[^.]+$/, ''); // "cat.png" → "cat"
}

const personaSlug = computed(() => {
  const nameKo = myPageInfo.value?.persona?.nameKo || '';
  let slug = mapPersonaSlugFromName(nameKo);
  if (!slug) {
    slug = extractSlugFromImage(
      personaImageUrl.value || myPageInfo.value?.persona?.imageUrl || ''
    );
  }
  return slug || '';
});

function handleQuickAction(a) {
  if (a?.key === 'personaResult') {
    const nameKo = myPageInfo.value?.persona?.nameKo || '';
    let slug = mapPersonaSlugFromName(nameKo);
    if (!slug) {
      // 이미지 파일명에서 추론 (예: /character_images/cat.png)
      slug = extractSlugFromImage(
        personaImageUrl.value || myPageInfo.value?.persona?.imageUrl || ''
      );
    }

    if (slug) {
      router.push(`${ROUTES.personaResult}/${slug}`);
    } else {
      // 슬러그 추론 실패 시 기본 경로로 이동
      router.push(ROUTES.personaResult);
    }
    return;
  }
  // 기타 액션은 정적 라우트로 이동
  router.push(a.route);
}

const favoriteSavings = ref([]);
const favoriteDeposits = ref([]);
const favoriteCards = ref([]);
const products = ref([]);
const myPageInfo = ref({ persona: {} });

const personaImageUrl = ref('');
const profileImageUrl = ref('');

function getCharacterFolderByLevel(lv) {
  // 기본: 2레벨 등 대부분은 기존 폴더 사용
  if (lv === 1) return 'level1_character_images';
  if (lv === 3) return 'level3_character_images';
  if (lv === 4) return 'level4_character_images';
  return 'character_images';
}

onMounted(async () => {
  try {
    const response = await userApi.getMyPage();
    const data = response.result;
    if (!data) return;

    user.value.nickname = data.nickname;
    user.value.birth = data.birth ?? data.birthDate ?? data.birthday ?? '';
    user.value.email = data.email ?? '';
    exp.value = data.exp;
    user.value.gender = mapGender(
      data.gender ?? data.genderCode ?? data.sex ?? data.gender_type ?? ''
    );

    // Updated: choose character image folder by level (1,3,4 use special folders; otherwise default)
    const rawImagePath = data.persona?.imageUrl;
    const fileName = rawImagePath?.split('/').pop();
    const folder = getCharacterFolderByLevel(level.value);
    const imageUrl = fileName
      ? new URL(`../../assets/${folder}/${fileName}`, import.meta.url).href
      : '';
    personaImageUrl.value = imageUrl;

    // Set profile image URL (social login / local)
    profileImageUrl.value =
      data.profileImageUrl ??
      data.profile_image_url ??
      new URL('@/assets/user.png', import.meta.url).href;
    myPageInfo.value.persona = {
      quote: data.persona?.quote ?? '',
      nameKo: data.persona?.nameKo ?? '',
      imageUrl,
    };

    favoriteSavings.value = data.favoriteSavings;
    favoriteDeposits.value = data.favoriteDeposits;
    favoriteCards.value = data.favoriteCards;

    updateProducts();

    const r = await userApi.getTopPercent();
    // console.log(r);
    topPercent.value = r?.result ?? null;
  } catch (error) {
    console.error('❌ 마이페이지 정보 조회 실패', error);
  }
});

function updateProducts() {
  const REQUIRED = 3;
  let items = [];

  // 공통 필드 추출 유틸
  const pickBank = (obj) =>
    obj.bankName ?? obj.company ?? obj.bank_name ?? obj.kor_co_nm ?? '';
  const pickName = (obj) =>
    obj.productName ?? obj.product_name ?? obj.title ?? obj.fin_prdt_nm ?? '';
  const pickPeriod = (obj) =>
    obj.maxSaveTrm ??
    obj.save_trm ??
    obj.period ??
    obj.sugPeriod ??
    obj.maxTerm ??
    obj.saveTrm ??
    '';
  const pickMaxRate2 = (obj) =>
    obj.maxIntrRate2 ?? obj.max_rate2 ?? obj.maxRate ?? '';
  const pickMaxRate1 = (obj) =>
    obj.maxIntrRate ??
    obj.max_rate ??
    obj.basicRate ??
    obj.base_rate ??
    obj.baseRate ??
    '';

  if (selectedTab.value === '적금') {
    items = favoriteSavings.value.map((raw) => ({
      bankName: pickBank(raw),
      productName: pickName(raw),
      type: '적금',
      maxSaveTrm: pickPeriod(raw),
      maxIntrRate: pickMaxRate1(raw),
      maxIntrRate2: pickMaxRate2(raw),
      savingId:
        raw.savingId ?? raw.saving_product_id ?? raw.savingProductId ?? raw.id,
    }));
  } else if (selectedTab.value === '예금') {
    items = favoriteDeposits.value.map((raw) => ({
      bankName: pickBank(raw),
      productName: pickName(raw),
      type: '예금',
      maxSaveTrm: pickPeriod(raw),
      maxIntrRate: pickMaxRate1(raw),
      maxIntrRate2: pickMaxRate2(raw),
      depositId: raw.depositId ?? raw.deposit_product_id ?? raw.id,
    }));
  } else if (selectedTab.value === '카드') {
    items = favoriteCards.value.map((raw) => ({
      productName: raw.name,
      productImage: raw.imageUrl,
      type: '카드',
      credit: raw.type,
      annualFee: raw.annualFee,
      preMonthMoney: raw.preMonthMoney,
      cardId: raw.cardId ?? raw.card_product_id ?? raw.id,
    }));
  }

  // 3개 고정 노출
  if (items.length < REQUIRED) {
    const fillCount = Math.max(0, REQUIRED - items.length);
    const fallback = {
      isFallback: true,
      type: selectedTab.value,
      productName: '항목 없음',
    };
    items = [...items, ...Array(fillCount).fill(fallback)];
  } else if (items.length > REQUIRED) {
    items = items.slice(0, REQUIRED);
  }

  products.value = items;
}

import { watch } from 'vue';
watch(selectedTab, () => {
  updateProducts();
});

const getProductsByTab = computed(() => products.value);

// Fallback bank/logo image
const disLogo = new URL('@/assets/logo_dis.png', import.meta.url).href;

const getBankLogo = (bankName) => {
  // 공통 로고 파일
  const busanLogo = new URL(
    '@/assets/bank-Logos/BK_BUSAN_Profile.png',
    import.meta.url
  ).href;
  const hanaLogo = new URL(
    '@/assets/bank-Logos/BK_HANA_Profile.png',
    import.meta.url
  ).href;

  const logoMap = {
    // 주요 시중은행
    국민은행: new URL('@/assets/bank-Logos/BK_KB_Profile.png', import.meta.url)
      .href,
    하나은행: hanaLogo,
    농협은행주식회사: new URL(
      '@/assets/bank-Logos/BK_NH_Profile.png',
      import.meta.url
    ).href,
    신한은행: new URL(
      '@/assets/bank-Logos/BK_Shinhan_Profile.png',
      import.meta.url
    ).href,
    우리은행: new URL(
      '@/assets/bankLogo_images/BK_Woori_Profile.png',
      import.meta.url
    ).href,

    // 특수은행
    중소기업은행: new URL(
      '@/assets/bank-Logos/BK_IBK_Profile.png',
      import.meta.url
    ).href,
    한국산업은행: new URL(
      '@/assets/bank-Logos/BK_KDB_Profile.png',
      import.meta.url
    ).href,
    수협은행: new URL('@/assets/bank-Logos/BK_SH_Profile.png', import.meta.url)
      .href,

    // 지방은행
    경남은행: busanLogo,
    부산은행: busanLogo,
    광주은행: new URL(
      '@/assets/bank-Logos/BK_KWANGJU_Profile.png',
      import.meta.url
    ).href,
    전북은행: new URL(
      '@/assets/bank-Logos/BK_JEONBUK_Profile.png',
      import.meta.url
    ).href,
    제주은행: new URL(
      '@/assets/bank-Logos/BK_JEJU_Profile.png',
      import.meta.url
    ).href,
    아이엠뱅크: new URL(
      '@/assets/bank-Logos/BK_DAEGU_Profile.png',
      import.meta.url
    ).href,

    // 외국계은행
    한국스탠다드차타드은행: new URL(
      '@/assets/bank-Logos/BK_SC_Profile.png',
      import.meta.url
    ).href,

    // 인터넷은행
    '주식회사 카카오뱅크': new URL(
      '@/assets/bank-Logos/BK_KAKAO_Profile.png',
      import.meta.url
    ).href,
    '주식회사 케이뱅크': new URL(
      '@/assets/bank-Logos/BK_K_Profile.png',
      import.meta.url
    ).href,
    '토스뱅크 주식회사': new URL(
      '@/assets/bank-Logos/BK_TOSS_Profile.png',
      import.meta.url
    ).href,

    // 주식회사 명칭 포함
    '주식회사 하나은행': hanaLogo,
  };

  return logoMap[bankName] || null;
};

function selectProduct(product) {
  if (product?.isFallback) return;
  if (product?.type === '적금' && product?.savingId) {
    router.push(`/detail/saving/${product.savingId}`);
    return;
  }
  if (product?.type === '예금' && product?.depositId) {
    router.push(`/detail/deposit/${product.depositId}`);
    return;
  }
  if (product?.type === '카드' && product?.cardId) {
    router.push(`/detail/card/${product.cardId}`);
    return;
  }
  console.warn(
    '선택한 상품에 유효한 ID가 없어 상세 페이지로 이동할 수 없습니다:',
    product
  );
}

onMounted(() => {
  fetchCards();
});
</script>

<style scoped>
.profile-section,
.left-grid,
.right-grid {
  align-self: stretch;
}
.profile-section > :deep(.base-card-grey),
.left-grid > :deep(.base-card-grey),
.right-grid > :deep(.base-card-grey) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* Let persona-card stretch to fill card body so extras can sit at bottom if space allows */
/* persona-card: contain bubble absolutely and prevent overflow */
.persona-card {
  flex: 1;
  position: relative;
  overflow: visible; /* 글씨(말풍선)가 카드 밖으로 넘어가도 보이도록 */
}

/* Extras block under persona summary */
.persona-extras {
  margin-top: var(--spacing-md);
  border-top: 1px dashed var(--color-secondary-30);
  padding-top: var(--spacing-md);
  width: 100%;
}
.extras-title {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-80);
  margin-bottom: 0.35rem;
}
.extras-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.extras-btn {
  border: 1px solid var(--color-secondary-30);
  background: transparent;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.extras-btn:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}
.greeting {
  grid-column: 1 / -1; /* 전체 그리드 폭 */
  font-size: clamp(24px, 2.2vw + 8px, 32px);
  font-size: clamp(20px, 1.6vw + 6px, 26px);
  margin: 0 0 var(--spacing-sm);
  text-align: left;
}
.greeting strong {
  font-weight: 800;
}
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.section-header .link-minimal {
  margin-top: 2px;
}
.section-header span,
.persona-header span {
  font-size: var(--font-size-lg);
  font-weight: 700;
}
.my-page {
  display: grid;
  grid-template-columns: 2.2fr 1fr; /* left wider column */
  grid-template-areas:
    'greeting greeting'
    'profile profile'
    'left persona'
    'favrow favrow'
    'actions actions';
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}
.favorites-row {
  grid-area: favrow;
}

.area-greeting {
  grid-area: greeting;
}
.profile-section {
  grid-area: profile;
}
.left-grid {
  grid-area: left;
}
.right-grid {
  grid-area: persona;
}
.area-actions {
  grid-area: actions;
}

.profile-section {
  grid-area: profile;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.left-grid {
  display: grid;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
}
.right-grid {
  height: 100%;
}
.user-meta-line {
  margin-top: 0.25rem;
}
/* 페르소나 카드 스타일 */
.persona-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-md);
}
.persona-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  padding: var(--spacing-md);
}
.persona-image {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.persona-figure {
  position: relative;
  display: inline-block;
  transform: translateY(8px); /* 카드 높이는 그대로, 시각적으로만 아래로 */
}
/* 말풍선을 캐릭터 오른쪽에 배치하고, 꼬리와 팁을 왼쪽으로 이동 */
/* === Persona speech bubble (clean classic style) === */
/* === Persona speech bubble (pill, rounder, smaller, classic triangle) === */
.speech-bubble {
  position: absolute;
  top: 50%;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  max-width: 180px; /* narrower to fit card */
  background: #ffffff;
  border: 1px solid var(--color-secondary-30);
  border-radius: 18px; /* 더 동글동글 */
  padding: 10px 14px;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--color-secondary-100);
  box-shadow: var(--shadow-sm);
  z-index: 2;
  animation: bubblePop 280ms ease-out;
  white-space: normal;
  word-break: keep-all; /* 한국어 단어 예쁘게 줄바꿈 */
}
/* 테두리용 외곽 삼각형 */
.speech-bubble::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-right: 10px solid var(--color-secondary-30); /* border color */
}
/* 내부 흰색 삼각형 */
.speech-bubble::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -9px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 9px solid #fff; /* bubble bg */
}
@media (max-width: 768px) {
  .speech-bubble {
    left: calc(100% + 6px);
    max-width: 160px;
    font-size: 0.95rem;
    padding: 9px 12px;
    border-radius: 16px; /* 모바일에서도 둥글게 */
  }
  .speech-bubble::before {
    left: -9px;
    border-right-width: 9px;
    border-top-width: 8px;
    border-bottom-width: 8px;
  }
  .speech-bubble::after {
    left: -8px;
    border-right-width: 8px;
    border-top-width: 7px;
    border-bottom-width: 7px;
  }
}

/* Global override for all BaseCardGrey cards */
:deep(.base-card-grey) {
  background: transparent !important; /* 기존: #fff */
  border: 1px solid var(--color-secondary-30) !important;
}
.profile-toolbar {
  margin-left: auto; /* ← 오른쪽 끝으로 밀기 */
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 버튼이 줄바꿈되지 않게 */
}
.link-minimal {
  border: 1px solid var(--color-secondary-30);
  background: transparent;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.link-minimal:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}
.persona-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0.25rem 0;
  margin-top: 0.5rem; /* 말풍선이 우측에 있어도 텍스트와 시각적 간섭 최소화 */
}
.persona-desc {
  color: var(--color-secondary-80);
  font-size: 0.875rem;
  line-height: 1.4;
}

/* == Experience panel == */
.xp-panel {
  margin-top: var(--spacing-md);
  width: 100%;
  border: 1px solid var(--color-secondary-30);
  border-radius: 12px;
  padding: var(--spacing-md);
  box-sizing: border-box;
  padding: var(--spacing-md) var(--spacing-lg); /* ← 좌우 여백 확대 */
}
.xp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.xp-title {
  font-weight: 700;
}
.xp-badge {
  border: 1px solid var(--color-secondary-40);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: var(--font-size-sm);
}
.xp-bar {
  position: relative;
  height: 10px;
  background: var(--color-secondary-20);
  border-radius: 999px;
  overflow: hidden;
}
.xp-bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: var(--color-accent);
  transition: width 350ms ease;
}
.xp-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-secondary-80);
  margin-top: 0.35rem;
}
.user-meta {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: grid;
  gap: 0.35rem;
}
.user-meta .label {
  display: inline-block;
  width: 5.5rem;
  color: var(--color-secondary-80);
}
.user-meta .value {
  font-weight: 600;
}

.user-meta-vertical {
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 2px; /* 항목 간 간격 */
  color: var(--color-secondary-100);
}
.user-meta-vertical li {
  line-height: 1.35;
  font-size: var(--font-size-base);
}

/* 이름 왼쪽, 메타 오른쪽 정렬 */
.user-name-and-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between; /* 이름 왼쪽, 메타 오른쪽 */
  gap: var(--spacing-lg);
  width: 100%;
}
.user-name-and-meta .user-name {
  margin: 0; /* 여백만 초기화 */
}

.user-meta-horizontal {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  color: var(--color-secondary-90);
  font-weight: 500;
}
.user-meta-horizontal li {
  line-height: 1.35;
  font-size: var(--font-size-base);
}
/* 항목들 사이 구분자: 가운데 점, 여백 균형 */
.user-meta-horizontal li + li::before {
  content: '·';
  margin: 0 var(--spacing-md);
  color: var(--color-secondary-60);
}

.user-info {
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* ← 한 줄 유지 */
  justify-content: flex-start; /* ← 왼쪽 정렬 */
  gap: var(--spacing-xl); /* 간격 약간 줄임 */
  box-sizing: border-box;
  padding: var(--spacing-md) var(--spacing-lg);
}

.profile-image-placeholder {
  width: 124px;
  height: 124px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid var(--color-secondary-50);
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-text {
  flex: 1 1 auto;
  width: 100%;
  min-width: 200px;
  max-width: 100%; /* ← 여기! 600px 제한 제거 */
  box-sizing: border-box;
  padding: var(--spacing-md);
}

.user-name {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-xs);
}
.nickname {
  font-size: var(--font-size-3xl);
}
.level-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}

.user-type {
  font-size: var(--font-size-2xl);
  font-weight: 500;
}

.user-level {
  font-size: var(--font-size-2xl);
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  margin: 0;
}

.level-value {
  font-size: var(--font-size-2xl);
  font-weight: 800;
}

.level-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-secondary-20);
  border-radius: 5px;
}
.fill {
  height: 100%;
  background-color: #2e7d32;
  width: 60%;
  border-radius: 5px;
}

.change-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.change-type p {
  margin: 0;
  font-size: var(--font-size-base);
}

.edit-button {
  background: none;
  border: none;
  font-size: var(--font-size-base);
  cursor: pointer;
}

.tabs {
  display: flex;
  justify-content: space-around;
  background-color: var(--color-secondary-10);
  border-radius: 2rem;
  padding: 0.2rem;
  margin: 0 var(--spacing-md);
  border: 1px solid var(--color-secondary-30);
}
.tabs button {
  flex: 1;
  border: none;
  background-color: transparent;
  padding: 0.35rem 0.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.tabs button.active {
  background-color: var(--color-accent);
  color: white;
  font-weight: 600;
}

.fav-header {
  display: flex;
  align-items: baseline; /* keep baseline alignment */
  justify-content: space-between; /* move button to right */
  gap: var(--spacing-md);
  width: 100%;
}
.fav-view-all-btn {
  border: 1px solid var(--color-secondary-30);
  background: transparent;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}
.fav-view-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: var(--color-accent);
}
.edit-btn {
  margin-left: var(--spacing-lg);
  padding: 0.25rem 0.75rem; /* keep same as fav-view-all-btn */
}

.product-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 14rem;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  height: auto;
}

.product-card {
  border: 1px solid var(--color-secondary-30);
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  background: transparent;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease,
    border-color 0.15s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}
.product-header {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.bank-logo img {
  width: 96px;
  height: 96px;
  object-fit: contain;
}
.fallback-img {
  width: 96px;
  height: 96px;
}

.product-info {
  font-size: 1rem;
}

.profile-image-placeholder img.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 768px) {
  /* ====== Global container & page grid ====== */
  .my-page {
    grid-template-columns: 1fr;
    grid-template-areas:
      'greeting'
      'profile'
      'persona'
      'left'
      'favrow'
      'actions';
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .my-page h1 span {
    /* greeting/title size */
    font-size: var(--font-size-xl);
  }
  .my-page h2 {
    font-size: var(--font-size-2xl);
  }
  .my-page h3 {
    font-size: var(--font-size-2xl);
  }

  /* Ensure general text elements never drop below base */
  .my-page p,
  .my-page span,
  .my-page a,
  .my-page button,
  .my-page li,
  .my-page .hcard-name,
  .my-page .hcard-meta,
  .my-page .action-title,
  .my-page .action-desc {
    font-size: var(--font-size-lg);
  }

  /* Greeting */
  .greeting {
    text-align: center;
    font-size: clamp(18px, 4.5vw, 22px);
    margin-bottom: var(--spacing-sm);
    padding-left: 0; /* center alignment on mobile, no extra left padding */
  }

  /* ====== Profile / user info ====== */
  .user-info {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }

  .profile-image-placeholder {
    width: clamp(120px, 28vw, 160px);
    height: clamp(120px, 28vw, 160px);
    border-radius: 50%;
  }

  .user-text {
    padding: 0;
    text-align: center;
  }

  .user-name {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-xs);
  }

  .nickname {
    font-size: var(--font-size-2xl);
  }

  .user-name-and-meta {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .user-meta-horizontal {
    justify-content: center;
    gap: var(--spacing-sm);
    font-size: 0.95rem;
  }

  .user-meta-horizontal li + li::before {
    margin: 0 var(--spacing-sm);
  }

  /* XP panel tighter */
  .xp-panel {
    padding: var(--spacing-md);
  }

  /* ====== Persona card ====== */
  .right-grid {
    height: auto;
  }

  .persona-card {
    padding: var(--spacing-md);
  }
  /* Center persona extras actions on mobile */
  .extras-actions {
    justify-content: center;
  }
  .extras-title {
    text-align: center;
  }

  .persona-image {
    width: 140px;
    height: 140px;
  }

  /* ====== Card slider section (left-grid) ====== */
  .left-grid > :deep(.base-card-grey),
  .right-grid > :deep(.base-card-grey) {
    min-height: 300px;
  }

  .card-slider-wrapper {
    padding: 0.25rem 0;
    margin-top: var(--spacing-sm);
  }

  :deep(.slider-container),
  :deep(.swiper),
  :deep(.swiper-wrapper),
  :deep(.swiper-slide) {
    background: transparent !important;
  }

  /* ====== Favorites row ====== */
  .favbar {
    padding: var(--spacing-sm);
  }

  .favbar-tabs {
    width: 100%;
    justify-content: space-between;
    padding: 0.35rem;
    gap: 0.35rem;
  }

  .favbar-tabs button {
    flex: 1 1 0;
    text-align: center;
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
  }

  .favbar-scroller {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .hcard {
    display: grid;
    grid-template-columns: 56px 1fr;
    align-items: center;
    gap: var(--spacing-2xl);
    padding: 0.75rem;
    border-radius: 12px;
    min-height: 84px;
  }

  .hcard-thumb {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    margin-left: var(--spacing-2xl);
    margin-right: var(--spacing-2xl);
  }

  .hcard-thumb img,
  .thumb-fallback-img {
    object-fit: contain;
  }

  .hcard-body {
    min-width: 0;
  }

  .hcard-name {
    font-size: 1rem;
  }

  .hcard-meta {
    margin-top: 2px;
    gap: 0.15rem;
    font-size: 0.9rem;
  }

  .hcard-meta .chip {
    font-size: 0.72rem;
    padding: 0 0.45rem;
  }

  .fee-inline {
    white-space: normal;
    line-height: 1.3;
  }

  /* ====== Quick actions ====== */
  .actions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .action-card {
    min-width: 0;
    padding: var(--spacing-md);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
  }
}

.card-slider-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0.5rem 0;
  margin-top: var(--spacing-md);
  box-sizing: border-box;
}

/* (old) card-and-favorites wrapper removed */
.card-slider-wrapper.compact {
  padding: 0.25rem 0; /* 슬라이더 여백 축소 */
  margin-top: var(--spacing-sm);
}
.fav-tabs {
  margin: 0 var(--spacing-md);
}
.product-name {
  font-weight: 700;
}
.product-meta {
  color: var(--color-secondary-80);
  font-size: 0.9rem;
  margin-top: 2px;
}

.card-visual-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem 0;
}
.card-visual-section {
  width: 150px;
  height: 100px;
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-secondary-30);
  padding: var(--spacing-2xl);
}
.card-visual-section img.card-image {
  max-width: 80%;
  height: auto;
}
.card-visual-section .card-name {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.hide-card-info :deep(.card-info-section) {
  display: none !important;
}

::v-deep .card-info-section {
  display: none !important;
}
.slider-container {
  height: 10rem;
  overflow: hidden;
}
.slider-container {
  height: 10rem;
  overflow: hidden;
}

/* Force slider backgrounds to white */
:deep(.slider-container),
:deep(.swiper),
:deep(.swiper-wrapper),
:deep(.swiper-slide) {
  background: transparent !important; /* 기존: #fff */
}

.slide-item {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--color-secondary-30);
  border-radius: 1rem;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  background-color: var(--bg-content);
  transition: transform 0.2s ease;
  background-color: transparent;
}
.slide-item:hover {
  transform: scale(1);
}
.badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.25rem var(--spacing-md);
}
.badge-placeholder {
  font-size: 1.1rem;
  line-height: 1;
}

/* == Quick actions == */
.actions-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
.action-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border: 1px solid var(--color-secondary-30);
  background: var(--bg-content);
  border-radius: 1rem;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    border-color 0.15s ease;
  text-align: left;
  min-width: 240px;
  align-self: stretch;
}
.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent);
}
.action-icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* remove color */
  color: inherit; /* follow text color */
  font-size: 1.1rem;
  line-height: 1;
  flex: 0 0 42px;
  border: none; /* no ring */
}

.action-icon i {
  font-size: 1.1rem;
  line-height: 1;
}
.action-texts {
  display: flex;
  flex-direction: column;
}
.action-title {
  font-weight: 700;
  font-size: var(--font-size-base);
}
.action-desc {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-80);
  margin-top: 2px;
}

@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.favbar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  align-items: stretch; /* 컨텐츠를 가로로 꽉 차게 */
  width: 100%;
}
.favbar-tabs {
  display: inline-flex;
  flex-direction: row;
  gap: 0.5rem;
  background: var(--color-secondary-10);
  border: 1px solid var(--color-secondary-30);
  border-radius: 999px;
  padding: 0.4rem;
  width: max-content;
  margin: 0 auto;
}
.favbar-tabs button {
  border: none;
  background: transparent;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  text-align: left;
}
.favbar-tabs button.active {
  background: var(--color-accent);
  color: #fff;
}
.favbar-scroller {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
  overflow: visible;
  width: 100%; /* 가로 꽉 차게 */
  max-width: 100%;
  padding-bottom: 0;
}
.favbar-scroller::-webkit-scrollbar {
  height: 6px;
}
.favbar-scroller::-webkit-scrollbar-thumb {
  background: var(--color-secondary-30);
  border-radius: 999px;
}
.hcard {
  width: 100%;
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  border: 1px solid var(--color-secondary-30);
  border-radius: 12px;
  padding: 0.9rem;
  background: var(--bg-content);
  box-shadow: var(--shadow-sm);
  scroll-snap-align: start;
  transition: box-shadow 0.15s ease, transform 0.15s ease,
    border-color 0.15s ease;
}
.hcard:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
  transform: translateY(-1px);
}
.hcard-thumb {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--color-secondary-80);
  flex: 0 0 64px;
}
.hcard-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.thumb-fallback {
  font-size: 0.85rem;
  color: var(--color-secondary-80);
}
.thumb-fallback-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.hcard-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center; /* vertically center text alongside thumb */
}
.chip--tight {
  align-self: flex-start;
}
.fee-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fee-inline {
  margin-top: 2px;
  font-size: 0.9rem;
  color: var(--color-secondary-90);
  white-space: nowrap;
}
.hcard-name {
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.hcard-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
  color: var(--color-secondary-90);
  margin-top: 2px;
}
.hcard-meta .meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
  align-items: center;
}
.hcard-meta .chip {
  border: 1px solid var(--color-secondary-30);
  border-radius: 999px;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  display: inline-flex; /* shrink to content */
  align-items: center;
  white-space: nowrap; /* keep one line */
  width: auto;
}
.hcard-desc {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-secondary-80);
  line-height: 1.35;
  max-height: 2.7em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hcard.empty {
  justify-content: center;
  color: var(--color-secondary-70);
}

.top-percent-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  animation: badgeGlow 2s ease-in-out infinite alternate;
  margin-left: 0.5rem;
  vertical-align: text-top;
  position: relative;
  top: -0.18em;
}

.badge-diamond {
  background: linear-gradient(135deg, #6fafe4 0%, #c2dce7 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}
.badge-platinum {
  background: linear-gradient(135deg, #80c9c9 0%, #c3ebe7 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}
.badge-gold {
  background: linear-gradient(135deg, #f2bc33 0%, #fbe479 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}
.badge-silver {
  background: linear-gradient(135deg, #e6ecf3 0%, #8ba3bb 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}
.badge-bronze {
  background: linear-gradient(135deg, #ffd2b5 0%, #b05d19 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}
.badge-newbie {
  background: linear-gradient(135deg, #bae3af 0%, #c1dfc4 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(177, 156, 217, 0.4);
}

.badge-diamond::before {
  content: '💎';
}
.badge-platinum::before {
  content: '🏆';
}
.badge-gold::before {
  content: '🥇';
}
.badge-silver::before {
  content: '🥈';
}
.badge-bronze::before {
  content: '🥉';
}
.badge-newbie::before {
  content: '🌱';
}

/* @keyframes badgeGlow {
  from {
    transform: scale(1) translateY(0px);
  }
  to {
    transform: scale(1.02) translateY(-1px);
  }
} */

@media (max-width: 1024px) {
  .favbar-scroller {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
