<template>
	<div class="card-product-search">
		<main class="main-content">
			<h1 class="page-title">페르소나 추천</h1>

			<!-- 🐰 캐러셀 추천 -->
			<section class="persona-carousel-section">
				<h2 class="persona-carousel-title">
					<span class="highlight">{{ personaName }}</span> 유형에게 추천하는
					카드
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
						@click="
							() => {
								filters.creditCard = !filters.creditCard;
								searchProducts();
							}
						"
					>
						신용카드
					</button>
					<button
						:class="['type-btn', filters.debitCard ? 'active' : '']"
						@click="
							() => {
								filters.debitCard = !filters.debitCard;
								searchProducts();
							}
						"
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
						<div
							class="product-content"
							style="display: flex; align-items: center; gap: 20px"
						>
							<img
								:src="product.imageUrl"
								:alt="product.name"
								style="height: 100px; width: auto; border-radius: 10px"
							/>
							<div class="product-info">
								<h4>{{ product.name }}</h4>
								<div>{{ product.issuer || '카드사 미정' }}</div>
								<div style="margin-top: 10px">
									<strong>전월실적금액:</strong>
									{{
										product.preMonthMoney
											? product.preMonthMoney.toLocaleString() + '원'
											: '정보 없음'
									}}
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

		const carouselCards = ref([]);
		const personaName = ref('');

		const fetchRecommendedCards = async () => {
			try {
				const personaId = 1; // TODO: 실제 사용자 personaId로 대체
				const response = await axios.get(
					`/api/persona/${personaId}/recommendations`
				);

				carouselCards.value = response.data.cards.map((card) => ({
					id: card.cardProductId,
					name: card.name,
					image: card.cardImageUrl,
				}));
				personaName.value = response.data.persona.personaName;
			} catch (error) {
				console.error('추천 카드 불러오기 실패:', error);
			}
		};

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
					selectedBenefits: filters.value.selectedBenefits,
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
			fetchRecommendedCards();
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
	background: #fff;
	min-height: 100vh;
}
.main-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 40px;
}
.page-title {
	font-size: 28px;
	font-weight: 700;
	margin-bottom: 30px;
	text-align: center;
}
.persona-carousel-title {
	font-size: 22px;
	margin-bottom: 20px;
	text-align: center;
}
.carousel-card-list {
	display: flex;
	gap: 20px;
	justify-content: center;
	flex-wrap: wrap;
	margin-bottom: 40px;
}
.carousel-card {
	width: 300px;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	padding: 16px;
	cursor: pointer;
}
.carousel-card-image {
	width: 100%;
	border-radius: 8px;
}
.carousel-card-name {
	font-size: 22px;
	font-weight: bold;
	margin: 10px 0 4px;
}
.carousel-card-benefit {
	font-size: 18px;
	color: #666;
}
.filter-selection-section {
	text-align: left;
	margin-bottom: 40px;
	padding: 30px;
	border: 2px solid #ccc;
	border-radius: 16px;
	background: #fafafa;
}
.card-type-toggle {
	margin-bottom: 20px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
	padding: 0 12px;
}
.type-btn {
	width: 100%;
	padding: 12px;
	border: 2px solid #ccc;
	background: #fff;
	cursor: pointer;
	border-radius: 8px;
	font-size: 16px;
}
.type-btn.active {
	background: #609966;
	color: white;
	border-color: #609966;
}
.benefit-grid {
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 16px;
	margin-top: 20px;
	margin-bottom: 20px;
	padding: 0 12px;
}
.benefit-button {
	padding: 12px;
	border: 2px solid #ccc;
	border-radius: 10px;
	background: #fff;
	cursor: pointer;
	font-weight: bold;
}
.benefit-button.selected {
	background: #609966;
	color: white;
	border-color: #609966;
}
.benefit-button .emoji {
	display: block;
	font-size: 20px;
	margin-bottom: 4px;
}
.search-button-wrap {
	margin-top: 20px;
	display: flex;
	justify-content: flex-end;
}
.search-button {
	padding: 12px 24px;
	font-size: 16px;
	background: #609966;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
}
.search-results-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 24px;
}
.product-card {
	background: #f5f7f9;
	border-radius: 20px;
	padding: 30px;
	cursor: pointer;
	transition: all 0.3s ease;
}
.product-card:hover {
	transform: translateY(-5px);
}
.product-header {
	display: flex;
	align-items: center;
	gap: 16px;
}
.product-info h4 {
	margin: 0;
	font-size: 18px;
	font-weight: bold;
}
.bank-name {
	font-size: 14px;
	color: #888;
}
.product-details {
	margin-top: 6px;
	font-size: 14px;
	color: #444;
}
.highlight {
	font-size: 30px;
	text-decoration: underline;
}
.filter-label {
	font-size: 18px;
	font-weight: 700;
	color: #40513b;
	margin-bottom: 12px;
	text-align: left;
}
</style>
