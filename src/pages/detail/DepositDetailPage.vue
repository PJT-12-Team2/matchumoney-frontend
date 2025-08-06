<template>
  <div class="container" v-if="depositData">
    <div class="deposit-detail-page">
      <section class="card-header">
        <div class="card-image-wrapper">
          <img :src="bankLogoUrl" alt="은행 로고" class="card-image" />
          <div class="reaction-group">
            <span
              class="reaction-button"
              @click.stop="handleLikeClick"
              :class="{ active: isLiked }"
            >
              {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
            </span>
            <button class="compare-button">➕ 비교함 담기</button>
          </div>
        </div>

        <div class="card-info">
          <i
            :class="[isFavorite ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
            @click="toggleFavorite"
            title="즐겨찾기"
          ></i>
          <h2 class="card-title">{{ depositData.finPrdtNm }}</h2>
          <p class="subtitle">{{ depositData.korCoNm }}</p>

          <ul class="card-benefits">
            <li>
              {{ topRateTerm }}개월 기준 최대 금리
              <strong>{{ (topRate * 100).toFixed(2) }}%</strong>
            </li>
            <li>
              {{ baseRateTerm }}개월 기준 기본 금리
              <strong>{{ (baseRate * 100).toFixed(2) }}%</strong>
            </li>
          </ul>

          <div class="button-group">
            <button class="go-to-card full-width">카드사 바로가기</button>
            <button class="compare-link full-width">비교함 바로가기</button>
          </div>

          <div class="card-meta">
            <span
              >가입 방법 : <strong>{{ depositData.joinWay }}</strong></span
            >
          </div>
        </div>
      </section>

      <section class="persona-banner-section">
        <div class="info-banner">
          <p class="badge">
            <span class="highlight">{{ personaName }}</span> 유형이 많이 찾는
            상품
          </p>
        </div>
      </section>

      <section class="interest-section">
        <h2 class="section-title">금리 안내</h2>
        <div class="interest-summary">
          <div class="deposit-amount">
            <div class="label">예치금액</div>
            <div class="formatted-input-wrapper">
              <input
                v-model.number="depositAmount"
                class="amount-input"
                type="number"
                min="0"
                step="10000"
              />
              <span class="won-label">원</span>
            </div>
            <div class="input-guide">
              {{ formattedAmount }}원 ({{ formattedAmountMan }}만원)
            </div>
          </div>
          <div class="rate-tab">
            <div
              class="tab"
              :class="{ active: selectedRateType === 'top' }"
              @click="selectedRateType = 'top'"
            >
              최고금리 <strong>{{ (topRate * 100).toFixed(2) }}%</strong>
            </div>
            <div
              class="tab"
              :class="{ active: selectedRateType === 'base' }"
              @click="selectedRateType = 'base'"
            >
              기본금리 <strong>{{ (baseRate * 100).toFixed(2) }}%</strong>
            </div>
          </div>
          <div class="payout-summary">
            <div>
              원금합계 <strong>{{ formattedAmount }}원</strong>
            </div>
            <div>
              세전이자 <strong>+{{ formattedPreTaxInterest }}원</strong>
            </div>
            <div>
              이자과세(15.4%) <strong>-{{ formattedTax }}원</strong>
            </div>
            <div class="total">
              세후수령액 <strong>{{ formattedAfterTax }}원</strong>
            </div>
          </div>
        </div>

        <div class="subsection">
          <div class="term-rates">
            <h4>기간별 금리</h4>
            <table>
              <thead>
                <tr>
                  <th>기간</th>
                  <th>금리</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="option in depositData.options"
                  :key="option.depositOptionId"
                >
                  <td>{{ option.saveTrm }}개월</td>
                  <td>{{ option.intrRate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="subsection">
          <div class="rate-conditions">
            <h4>우대 조건</h4>
            <p>{{ depositData.spclCnd }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>만기 후 이자율</h4>
            <p v-html="depositData.mtrtInt?.replaceAll('\n', '<br>')"></p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>가입 대상</h4>
            <p>{{ depositData.joinMember }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>기타 유의 사항</h4>
            <p>{{ depositData.etcNote }}</p>
          </div>
        </div>
      </section>
      <section class="recommend-buttons">
        <router-link to="/persona/deposits" class="recommend-button green"
          >나의 페르소나로 예금 추천 받기</router-link
        >
        <router-link to="/mydata/deposits" class="recommend-button"
          >마이데이터 기반 예금 추천 받기</router-link
        >
      </section>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import favorite from '@/api/favorite';

const personaNameMap = {
  1: '거북이',
  2: '다람쥐',
  3: '개미',
  4: '부엉이',
  5: '토끼',
  6: '고양이',
  7: '호랑이',
  8: '펭귄',
  9: '기타',
};

const getBankInitial = (name) => {
  if (name.includes('신한')) return 'shinhan';
  if (name.includes('하나')) return 'hana';
  if (name.includes('우리')) return 'woori';
  if (name.includes('국민')) return 'kb';
  if (name.includes('농협')) return 'nh';
  if (name.includes('카카오')) return 'kakao';
  if (name.includes('토스')) return 'toss';
  if (name.includes('부산')) return 'bnk';
  if (name.includes('광주')) return 'gwangju';
  if (name.includes('중소기업')) return 'ibk';
  if (name.includes('아이엠')) return 'im';
  if (name.includes('제주')) return 'jeju';
  if (name.includes('전북')) return 'jeonbook';
  if (name.includes('산업')) return 'sanup';
  if (name.includes('수협')) return 'su';
  if (name.includes('SC제일') || name.includes('스탠다드차타드')) return 'sc';
  if (name.includes('케이뱅크') || name.includes('K뱅크')) return 'k';
  return 'shinhan';
};

const getBankLogo = (initial) => {
  const logos = {
    shinhan: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url)
      .href,
    hana: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
    woori: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
    kb: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
    nh: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
    kakao: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
    toss: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
    bnk: new URL('@/assets/bankLogo_images/bnk.png', import.meta.url).href,
    gwangju: new URL('@/assets/bankLogo_images/gwangju.png', import.meta.url)
      .href,
    ibk: new URL('@/assets/bankLogo_images/ibk.png', import.meta.url).href,
    im: new URL('@/assets/bankLogo_images/im.png', import.meta.url).href,
    jeju: new URL('@/assets/bankLogo_images/jeju.png', import.meta.url).href,
    jeonbook: new URL('@/assets/bankLogo_images/jeonbook.png', import.meta.url)
      .href,
    sanup: new URL('@/assets/bankLogo_images/sanup.png', import.meta.url).href,
    su: new URL('@/assets/bankLogo_images/su.png', import.meta.url).href,
    sc: new URL('@/assets/bankLogo_images/sc.png', import.meta.url).href,
    k: new URL('@/assets/bankLogo_images/k.png', import.meta.url).href,
  };
  return logos[initial] || logos['shinhan'];
};

export default {
  data() {
    return {
      depositData: null,
      depositAmount: 10000000,
      likeCount: 0,
      isLiked: false,
      isFavorite: false,
      bankLogoUrl: '',
      selectedRateType: 'top',
      userId: null,
    };
  },
  computed: {
    topRate() {
      if (!this.depositData || !this.depositData.options) return 0;
      return (
        Math.max(
          ...this.depositData.options.map((o) => parseFloat(o.intrRate2 || 0))
        ) / 100
      );
    },
    baseRate() {
      if (!this.depositData || !this.depositData.options) return 0;
      const twelveMonth = this.depositData.options.find(
        (o) => o.saveTrm === '12'
      );
      return (twelveMonth ? parseFloat(twelveMonth.intrRate) : 0) / 100;
    },
    topRateTerm() {
      if (!this.depositData || !this.depositData.options) return '-';
      const best = this.depositData.options.reduce((prev, curr) => {
        const prevRate = parseFloat(prev?.intrRate2 || 0);
        const currRate = parseFloat(curr?.intrRate2 || 0);
        return currRate > prevRate ? curr : prev;
      }, {});
      return best?.saveTrm || '-';
    },
    baseRateTerm() {
      if (!this.depositData || !this.depositData.options) return '-';
      const twelveMonth = this.depositData.options.find(
        (o) => o.saveTrm === '12'
      );
      return twelveMonth?.saveTrm || '-';
    },
    formattedAmount() {
      return this.depositAmount.toLocaleString();
    },
    preTaxInterest() {
      const rate =
        this.selectedRateType === 'top' ? this.topRate : this.baseRate;
      return this.depositAmount * rate;
    },
    tax() {
      return this.preTaxInterest * 0.154;
    },
    afterTax() {
      return this.depositAmount + this.preTaxInterest - this.tax;
    },
    formattedPreTaxInterest() {
      return Math.round(this.preTaxInterest).toLocaleString();
    },
    formattedTax() {
      return Math.round(this.tax).toLocaleString();
    },
    formattedAfterTax() {
      return Math.round(this.afterTax).toLocaleString();
    },
    formattedAmountMan() {
      return Math.floor(this.depositAmount / 10000).toLocaleString();
    },
    personaName() {
      return personaNameMap[this.depositData?.personaId] || '기타';
    },
  },
  mounted() {
    const id = this.$route.params.depositId;
    let userId = null;
    try {
      userId = sessionStorage.getItem('userId');
      if (userId) userId = Number(userId);
    } catch (e) {
      userId = null;
    }
    this.userId = userId;

    api
      .get(`/deposit-products/${id}`)
      .then((res) => {
        console.log(res);
        this.depositData = res.data;
        const initial = getBankInitial(this.depositData.korCoNm || '');
        this.bankLogoUrl = getBankLogo(initial);

        this.isLiked = res.data.liked;
        this.likeCount = res.data.likeCount;
      })
      //   .then((res) => {      })
      .catch((err) => {
        console.error(err);
      });
  },
  methods: {
    toggle(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },
    async toggleFavorite() {
      if (!this.userId) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
          this.$router.push('/login');
        }
        return;
      }

      const productId = this.depositData?.depositProductId;
      const productType = 'DEPOSIT';

      try {
        if (this.isFavorite) {
          await favorite.deleteFavorite(productId, productType);
        } else {
          await favorite.addFavorite(productId, productType);
        }
        this.isFavorite = !this.isFavorite;
      } catch (error) {
        console.error('즐겨찾기 처리 중 오류 발생:', error);
      }
    },
    handleLikeClick() {
      if (!this.userId) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
          this.$router.push('/login');
        }
        return;
      }
      this.toggleLike();
    },
    toggleLike() {
      if (!this.depositData) return;

      const id = this.depositData.depositProductId;

      const likePromise = this.isLiked
        ? api.delete(`/deposit-products/${id}/likes`)
        : api.post(`/deposit-products/${id}/likes`);

      likePromise
        .then((res) => {
          this.isLiked = res.data.liked;
          this.likeCount = res.data.likeCount;
          //console.log(res);
          //return response;
          //return api.get(`/deposit-products/${id}/likes`);
        })
        //.then((res) => {})
        .catch((err) => console.error(err));
    },
  },
// removed created() lifecycle hook that initializes userId
};
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
}
.deposit-detail-page {
  padding: 20px;
}

.card-image {
  width: 160px;
  height: auto;
  border-radius: 12px;
  margin-bottom: 10px;
}

.compare-button {
  background: none;
  border: none;
  color: #333;
  font-weight: bold;
  cursor: pointer;
}

.badge {
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
}

.card-benefits {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.card-benefits li {
  font-size: 16px;
  margin-bottom: 6px;
}

.button-group {
  display: flex;
  width: 100%;
  margin-top: 10px;
  gap: 12px;
}

.full-width {
  width: 100%;
}

.button-group > .go-to-card,
.button-group > .compare-link {
  flex: 1 1 0;
  width: 100%;
  text-align: center;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 8px;
  font-weight: bold;
}

.go-to-card {
  background-color: #4caf50;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.go-to-card:hover {
  background-color: #3e8e41;
}

.compare-link {
  background-color: #81c784;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.compare-link:hover {
  background-color: #66bb6a;
}

.card-meta span {
  display: inline-block;
  margin-right: 16px;
  font-size: 13px;
  color: #777;
}

.benefits-section {
  margin-top: 30px;
}

.benefit-paragraph h4 {
  font-size: 16px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 4px;
}

.benefit-paragraph p {
  font-size: 14px;
  color: #444;
  margin-bottom: 12px;
}

.highlight {
  color: #2e7d32;
  font-weight: 900;
  font-size: 18px;
  text-decoration: underline;
}

.reaction-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.reaction-button,
.compare-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reaction-button:hover,
.compare-button:hover {
  background-color: #e0e0e0;
}

/* 금리 안내 스타일 */
.interest-section {
  margin-top: 40px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.interest-summary {
  margin-bottom: 20px;
}

.deposit-amount .label {
  font-size: 14px;
  color: #777;
}

.deposit-amount .value {
  font-size: 24px;
  font-weight: bold;
  margin: 4px 0 12px;
}

.rate-tab {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.rate-tab .tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #ddd;
}

.rate-tab .tab:last-child {
  border-right: none;
}

.rate-tab .tab.active {
  background: #e6f4ec;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  border-radius: 6px;
  margin: -1px;
}

.payout-summary {
  background: #e6f4ec;
  padding: 16px;
  border-radius: 8px;
}

.payout-summary div {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

.payout-summary .total {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-top: 10px;
}

.term-rates table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.term-rates th,
.term-rates td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.term-rates th {
  background: #f0f0f0;
}

.rate-conditions h4 {
  margin-top: 20px;
}

.rate-conditions ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

.rate-type {
  font-weight: bold;
  margin-top: 10px;
}

/* New styles */
.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #2e7d32;
}

.subsection {
  background-color: #f5fdf7;
  padding: 12px 16px 16px 16px;
  border-radius: 10px;
  margin-top: 20px;
  border: 1px solid #d6eddc;
}

.subsection h4 {
  font-size: 18px;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 8px;
  margin-top: 0;
}

.subsection ul {
  margin: 0;
  padding-left: 20px;
}

.subsection p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #444;
}
</style>
<style scoped>
.benefit-block {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 20px;
}

.benefit-block h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 6px;
}

.benefit-block p {
  font-size: 14px;
  color: #444;
  margin: 0;
}

/* Modern formatted input styles for 예치금액 */
.formatted-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
  margin-top: 4px;
}

.amount-input {
  font-size: 24px;
  font-weight: bold;
  border: none;
  outline: none;
  width: 100%;
  padding-right: 40px;
  background: transparent;
}

.won-label {
  position: absolute;
  right: 0;
  bottom: 6px;
  font-weight: bold;
  font-size: 20px;
  color: #333;
}

.input-guide {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.info-banner {
  background-color: #f0f8f5;
  border: 1px solid #d2e8dd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  text-align: center;
}

.persona-banner-section {
  margin-top: 20px;
}

.card-header {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.favorite-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.favorite-icon:hover {
  transform: scale(1.2);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.recommend-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

.recommend-button {
  display: inline-block;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  background-color: #fff;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
}

.recommend-button.green {
  background-color: #2e7d32;
  color: #fff;
  border: none;
}

.recommend-button.green:hover {
  background-color: #27682a;
}

.recommend-button:hover {
  background-color: #e0f3e7;
}
.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}
</style>
