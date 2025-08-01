<template>
  <div class="product-section">
    <!-- 🆕 KB국민은행 전용 메시지 (계좌가 없을 때) -->
    <div
      v-if="isKbOnly && hasSearched && !loading && products.length > 0"
      class="kb-only-message slide-up fade-in"
    >
      <div class="kb-only-text">
        <span class="bank-icon">🏦</span>
        {{ customerName }}님을 위한 KB국민은행 추천 상품을 보여드립니다!
      </div>
    </div>

    <!-- 추천 메시지 (계좌가 있을 때) -->
    <div
      v-else-if="!isKbOnly && hasSearched && !loading && products.length > 0"
      class="recommendation-message slide-up fade-in"
    >
      <div class="recommendation-text">
        <span class="recommendation-icon">💰</span>
        {{ customerName }}님의 {{ balance }} 잔액으로 가입 가능한
        {{ products.length }}개 상품을 찾았어요!
      </div>
    </div>

    <!-- 검색 결과가 없을 때 메시지 -->
    <div
      v-if="hasSearched && !loading && products.length === 0"
      class="no-results-message slide-up fade-in"
    >
      <div class="no-results-text">
        <span class="sad-icon">😔</span>
        <span v-if="isKbOnly">
          현재 KB국민은행 상품을 불러올 수 없습니다.
        </span>
        <span v-else>
          {{ customerName }}님의 잔액으로 가입 가능한 상품이 없습니다.
        </span>
      </div>
    </div>

    <!-- 상품 리스트 (검색 후에만 표시) -->
    <section class="products-section" v-if="hasSearched">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <div v-if="isKbOnly">KB국민은행 상품을 찾고 있습니다...</div>
        <div v-else>맞춤 상품을 찾고 있습니다...</div>
      </div>

      <div v-else-if="products.length > 0" class="product-list fade-in">
        <div
          v-for="(product, index) in products"
          :key="product.id || index"
          class="product-card"
          @click="$emit('productSelect', product)"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="product-card-horizontal">
            <!-- 왼쪽: 로고 -->
            <div class="bank-logo-container">
              <img :src="getBankLogo(product.bankName)" alt="은행 로고" />
            </div>

            <!-- 가운데: 은행명 + 상품명 -->
            <div class="product-name-block">
              <div class="bank-name-bold">{{ product.bankName }}</div>
              <div class="product-name-bold">{{ product.productName }}</div>
            </div>

            <!-- 오른쪽: 금리 및 기타 정보 -->
            <div class="product-info-block">
              <div class="rate-line">
                <span class="label-bold">최고 금리 : </span>
                <span class="highlight-rate">{{ product.maxIntrRate2 }}%</span>
              </div>
              <div class="rate-line">
                최저 금리 : {{ product.maxIntrRate }}%
              </div>
              <div class="rate-line">
                최소 가입 금액 : {{ product.minAmount }}
              </div>
              <div class="rate-line">
                기준 기간 : {{ product.maxSaveTrm }}개월
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// defineProps와 defineEmits는 Vue 3.3+에서 자동으로 사용 가능한 컴파일러 매크로입니다

// Props
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hasSearched: {
    type: Boolean,
    default: false,
  },
  customerName: {
    type: String,
    default: '고객',
  },
  balance: {
    type: String,
    default: '',
  },
  // 🆕 KB국민은행 전용 모드인지 여부
  isKbOnly: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['productSelect']);

// 은행 로고 가져오기 함수
const getBankLogo = (bankName) => {
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
      '@/assets/bank-Logos/BK_Woori_Profile.png',
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

  return logoMap[bankName] || '';
};
</script>

<style scoped>
/* ===== 🆕 KB국민은행 전용 메시지 ===== */
.kb-only-message {
  background: linear-gradient(135deg, #fff9e6 0%, #fef3c7 100%);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 4px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.kb-only-text {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
}

.bank-icon {
  font-size: 18px;
}

/* ===== 검색 결과 없음 메시지 ===== */
.no-results-message {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 4px solid #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.no-results-text {
  font-size: 15px;
  font-weight: 600;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
}

.sad-icon {
  font-size: 18px;
}

/* ===== 추천 메시지 ===== */
.recommendation-message {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 4px solid #609966;
}

.recommendation-text {
  font-size: 14px;
  font-weight: 700;
  color: #609966;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.recommendation-icon {
  font-size: 16px;
}

/* ===== 상품 리스트 ===== */
.products-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #636363;
  margin-bottom: 20px;
}

.product-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.product-card {
  background: var(--color-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #609966;
}

/* ===== 상품 카드 내부 레이아웃 ===== */
.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
}

.bank-logo-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.product-name-block {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

/* ===== 상품 텍스트 스타일 ===== */
.bank-name-bold {
  font-size: 14px;
  font-weight: 700;
  color: #1e2b4e;
  margin-bottom: 2px;
}

.product-name-bold {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.rate-line {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.label-bold {
  font-weight: bold;
  color: #333;
}

.highlight-rate {
  font-size: 18px;
  color: #609966;
  font-weight: bold;
}

/* ===== 로딩 애니메이션 ===== */
.loading {
  text-align: center;
  padding: 40px;
  color: #636363;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #609966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ===== 페이드 애니메이션 ===== */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 393px) {
  .bank-logo-container {
    width: 4rem;
    height: 4rem;
  }

  .product-name-block {
    padding: 0 12px;
  }

  .kb-only-text,
  .no-results-text {
    font-size: 14px;
  }
}

@media (min-width: 1200px) {
  .product-list {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .product-card {
    padding: 18px;
  }
}
</style>
