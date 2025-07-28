<template>
	<div class="card-product-search">
		<main class="main-content">
			<h1 class="page-title">페르소나 추천</h1>

			<!-- 🐰 캐러셀 추천 -->
			<section class="persona-carousel-section">
				<h2 class="persona-carousel-title">
					<span class="highlight">토끼형</span> 유형에게 추천되는 카드
				</h2>
				<div class="carousel-card-list">
					<div
						v-for="card in carouselCards"
						:key="card.id"
						class="carousel-card"
						@click="selectProduct(card)"
					>
						<img
							:src="card.image"
							:alt="card.name"
							class="carousel-card-image"
						/>
						<div class="carousel-card-name">{{ card.name }}</div>
						<div class="carousel-card-benefit">
							{{ card.benefit }}
						</div>
					</div>
				</div>
			</section>
			<br />
			<hr />
			<br />
			<h1 class="page-title">직접 찾아보는 카드</h1>
			<!-- ✅ 카드 종류 + 혜택 선택 영역 -->
			<section class="filter-selection-section">
				<h3 class="filter-label">카드 종류 선택</h3>
				<div class="card-type-toggle">
					<button
						:class="['type-btn', filters.creditCard ? 'active' : '']"
						@click="() => { filters.creditCard = !filters.creditCard; searchProducts(); }"
					>
						신용카드
					</button>
					<button
						:class="['type-btn', filters.debitCard ? 'active' : '']"
						@click="() => { filters.debitCard = !filters.debitCard; searchProducts(); }"
					>
						체크카드
					</button>
				</div>

				<h3 class="filter-label">카드 혜택 선택</h3>
				<div class="benefit-grid">
					<div
						v-for="benefit in benefitCategories"
						:key="benefit.id"
						class="benefit-button"
						:class="{
							selected: filters.selectedBenefits.includes(benefit.id),
						}"
						@click="toggleBenefit(benefit.id)"
					>
						<span class="emoji">{{ benefit.emoji }}</span>
						<span>{{ benefit.name }}</span>
					</div>
				</div>

			</section>

			<!-- 🔍 검색 결과 -->
			<section class="search-results" v-if="showSearchResults">
				<h2 class="results-title">검색한 카드 상품</h2>

				<div v-if="loading" class="loading-state">
					<div class="spinner"></div>
					<div>상품을 검색하고 있습니다...</div>
				</div>

				<div v-else-if="searchResults.length === 0" class="empty-state">
					<div class="empty-icon">🔍</div>
					<div>검색 조건에 맞는 상품이 없습니다.</div>
					<div>다른 조건으로 검색해보세요.</div>
				</div>

				<div v-else class="search-results-grid">
					<div
						v-for="product in searchResults"
						:key="product.id"
						class="product-card"
						@click="selectProduct(product)"
					>
						<div class="product-content" style="display: flex; align-items: center; gap: 20px;">
							<img
								:src="product.imageUrl"
								:alt="product.name"
								style="height: 100px; width: auto; border-radius: 10px;"
							/>
							<div class="product-info">
								<h4>{{ product.name }}</h4>
								<div>{{ product.issuer || '카드사 미정' }}</div>
								<div style="margin-top: 10px">
									<strong>전월실적금액:</strong>
									{{ product.preMonthMoney ? product.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
								</div>
								<div style="margin-top: 5px">
									<strong>연회비 정보:</strong>
									{{ product.annualFee || '정보 없음' }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	</div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
	name: 'CardSearchPage',
	setup() {
		const loading = ref(false);
		const showSearchResults = ref(false);

		const filters = ref({
			creditCard: true,
			debitCard: true,
			selectedBenefits: [],
		});

		const toggleBenefit = (id) => {
			const index = filters.value.selectedBenefits.indexOf(id);
			if (index === -1) filters.value.selectedBenefits.push(id);
			else filters.value.selectedBenefits.splice(index, 1);
			searchProducts(); // trigger filter
		};

		const benefitCategories = ref([
			{ id: '모든가맹점', name: '모든가맹점', emoji: '🏢' },
			{ id: '교통', name: '교통', emoji: '🚗' },
			{ id: '주유', name: '주유', emoji: '🛢️' },
			{ id: '통신', name: '통신', emoji: '📱' },
			{ id: '마트/편의점', name: '마트/편의점', emoji: '🛒' },
			{ id: '쇼핑', name: '쇼핑', emoji: '🎁' },
			{ id: '푸드', name: '푸드', emoji: '🍽️' },
			{ id: '카페/디저트', name: '카페/디저트', emoji: '☕' },
			{ id: '뷰티/피트니스', name: '뷰티/피트니스', emoji: '🚨' },
			{ id: '무실적', name: '무실적', emoji: '💰' },
			{ id: '공과금/렌탈', name: '공과금/렌탈', emoji: '🧾' },
			{ id: '병원/약국', name: '병원/약국', emoji: '🏥' },
			{ id: '애완동물', name: '애완동물', emoji: '🐱' },
			{ id: '교육/육아', name: '교육/육아', emoji: '✏️' },
			{ id: '자동차/하이패스', name: '자동차/하이패스', emoji: '🚗' },
			{ id: '레저/스포츠', name: '레저/스포츠', emoji: '⚾' },
			{ id: 'OTT/영화/문화', name: 'OTT/영화/문화', emoji: '🎬' },
			{ id: '간편결제', name: '간편결제', emoji: '💳' },
			{ id: '항공마일리지', name: '항공마일리지', emoji: '✈️' },
			{ id: '공항라운지/PP', name: '공항라운지/PP', emoji: '💺' },
			{ id: '프리미엄', name: '프리미엄', emoji: '💎' },
			{ id: '여행/숙박', name: '여행/숙박', emoji: '🧳' },
			{ id: '해외', name: '해외', emoji: '🌍' },
			{ id: '비즈니스', name: '비즈니스', emoji: '💼' },
		]);

		const carouselCards = ref([
			{
				id: 'card1',
				name: 'KB국민 My WE:SH 카드',
				image:
					'https://d1c5n4ri2guedi.cloudfront.net/card/13/card_img/28201/13card.png',
				benefit: '음식점 및 편의점 10%',
			},
			{
				id: 'card2',
				name: 'KB국민 My WE:SH 카드',
				image:
					'https://d1c5n4ri2guedi.cloudfront.net/card/2376/card_img/27725/2376card.png',
				benefit: 'OTT 30%',
			},
			{
				id: 'card3',
				name: 'KB국민 My WE:SH 카드',
				image:
					'https://d1c5n4ri2guedi.cloudfront.net/card/2846/card_img/42434/2846card_1.png',
				benefit: '카페 5%',
			},
		]);

		const searchResults = ref([]);

		const getBankLogo = (initial) => {
			const logos = {
				shinhan:
					'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png',
				hana: 'https://d1c5n4ri2guedi.cloudfront.net/card/718/card_img/28063/718card.png',
			};
			return (
				logos[initial] ||
				'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png'
			);
		};

		const selectProduct = (product) => {
			alert(`${product.name}을 선택했습니다.`);
		};

		const searchProducts = async () => {
			loading.value = true;
			showSearchResults.value = true;

			try {
				const response = await axios.post('/api/persona/cardsearch', {
					creditCard: filters.value.creditCard,
					debitCard: filters.value.debitCard,
					selectedBenefits: filters.value.selectedBenefits
						.map(id => benefitCategories.value.find(b => b.id === id)?.name)
						.filter(Boolean),
				});

				searchResults.value = response.data; // ← 백엔드에서 내려준 카드 리스트
			} catch (error) {
				console.error('카드 검색 오류:', error);
				searchResults.value = [];
			} finally {
				loading.value = false;
			}
		};
		onMounted(() => {
			searchProducts(); // 페이지 로드시 자동 실행
		});
		// Always show the search results section
		showSearchResults.value = true;
		return {
			loading,
			showSearchResults,
			filters,
			benefitCategories,
			toggleBenefit,
			searchProducts,
			carouselCards,
			searchResults,
			getBankLogo,
			selectProduct,
		};
	},
};
</script>
<style scoped>
.card-product-search {
  font-family: 'Noto Sans', sans-serif;
  background: var(--color-white);
  min-height: 100vh;
}
.main-content {
  max-width: 75rem;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}
.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  text-align: center;
}
.persona-carousel-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}
.carousel-card-list {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: nowrap;
  margin-bottom: var(--spacing-2xl);
  overflow-x: hidden;
}
.carousel-card {
  width: calc((100% - 2rem) / 3);
  background: var(--color-white);
  border-radius: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md);
  cursor: pointer;
  flex-shrink: 0;
}
.carousel-card-image {
  width: 100%;
  border-radius: var(--spacing-sm);
}
.carousel-card-name {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin: var(--spacing-sm) 0 var(--spacing-xs);
}
.carousel-card-benefit {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}
.filter-selection-section {
  text-align: left;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  border: 2px solid var(--border-light);
  border-radius: var(--spacing-xl);
  background: var(--bg-content);
}
.card-type-toggle {
  margin-bottom: var(--spacing-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}
.type-btn {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  background: var(--color-white);
  cursor: pointer;
  border-radius: var(--spacing-md);
  font-size: var(--font-size-base);
}
.type-btn.active {
  background: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  padding: 0 var(--spacing-md);
}
.benefit-button {
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  border-radius: var(--spacing-md);
  background: var(--color-white);
  cursor: pointer;
  font-weight: bold;
}
.benefit-button.selected {
  background: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}
.benefit-button .emoji {
  display: block;
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}
.search-button-wrap {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}
.search-button {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-base);
  background: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--spacing-md);
  cursor: pointer;
}
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }
  .benefit-grid {
    display: flex;
    overflow-x: auto;
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
    scroll-snap-type: x mandatory;
  }
  .benefit-button {
    flex: 0 0 auto;
    scroll-snap-align: start;
    min-width: 6rem;
  }
  .carousel-card-list {
    justify-content: center;
    overflow-x: hidden;
  }
  .carousel-card {
    width: calc((100% - 2rem) / 3);
  }
  .carousel-card-name {
    font-size: var(--font-size-sm);
  }
  .carousel-card-benefit {
    font-size: var(--font-size-xs);
  }
}
.product-card {
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
}
.product-card:hover {
  transform: translateY(-0.3125rem);
}
.product-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.product-info h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: bold;
}
.bank-name {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
.product-details {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
.highlight {
  font-size: var(--font-size-2xl);
  text-decoration: underline;
}
.filter-label {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  text-align: left;
}
</style>