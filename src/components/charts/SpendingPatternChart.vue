<template>
  <div class="spending-pattern-chart">
    <canvas ref="chartRef"></canvas>
    <div v-if="!topCategories.length" class="no-data">
      소비 내역 데이터가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Props: 거래내역 배열
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// Chart.js 참조용
const chartRef = ref(null);
let chartInstance = null;

// 카테고리별 합계 집계
const categorySums = computed(() => {
  const sums = {};
  for (const tx of props.transactions) {
    // 거래내역 필드명 매핑
    let category =
      tx.resMemberStoreType ||
      tx.merchantCategory ||
      tx.res_member_store_type ||
      tx.category;
    let amount = Math.abs(
      Number(tx.resUsedAmount || tx.amount || tx.res_used_amount || 0)
    );

    // 카테고리가 없거나 빈 값인 경우 가맹점명으로 분류
    if (!category || category.trim() === "") {
      const merchantName =
        tx.resMemberStoreName ||
        tx.merchantName ||
        tx.res_member_store_name ||
        "";
      if (merchantName) {
        // 간단한 카테고리 분류 로직
        category = getCategoryFromMerchant(merchantName);
      } else {
        category = "기타";
      }
    }

    if (!sums[category]) sums[category] = 0;
    sums[category] += amount;
  }
  return sums;
});

// 가맹점명으로부터 카테고리 추론
const getCategoryFromMerchant = (merchantName) => {
  const name = merchantName.toLowerCase();
  if (name.includes("마트") || name.includes("마켓") || name.includes("편의점"))
    return "생활/마트";
  if (
    name.includes("주유소") ||
    name.includes("gs칼텍스") ||
    name.includes("sk에너지")
  )
    return "주유/교통";
  if (
    name.includes("카페") ||
    name.includes("스타벅스") ||
    name.includes("맥도날드") ||
    name.includes("음식")
  )
    return "음식/카페";
  if (name.includes("병원") || name.includes("약국") || name.includes("의료"))
    return "의료/건강";
  if (
    name.includes("온라인") ||
    name.includes("쇼핑") ||
    name.includes("아마존") ||
    name.includes("쿠팡")
  )
    return "온라인쇼핑";
  return "기타";
};

// 상위 5개 카테고리 추출
const topCategories = computed(() => {
  const entries = Object.entries(categorySums.value)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 데이터가 없는 경우 빈 배열 반환
  return entries.filter((item) => item.amount > 0);
});

// 차트 렌더링 함수
function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const labels = topCategories.value.map((item) => item.category);
  const data = topCategories.value.map((item) => item.amount);

  if (!labels.length) return;

  Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
  );

  chartInstance = new Chart(chartRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "총 사용금액(원)",
          data,
          backgroundColor: [
            "#609966", // color-accent
            "#9dc08b", // color-secondary
            "#edf1d6", // color-primary
            "#f5f7f9", // color-info
            "#636363", // color-success
          ],
          borderRadius: 8,
          barThickness: 20,
        },
      ],
    },
    options: {
      indexAxis: "y", // 가로 차트로 변경
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(64, 81, 59, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#609966",
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label;
            },
            label: (ctx) => {
              const value = ctx.parsed.x.toLocaleString();
              const total = topCategories.value.reduce(
                (sum, item) => sum + item.amount,
                0
              );
              const percentage = ((ctx.parsed.x / total) * 100).toFixed(1);
              return `${value}원 (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "#e5e7eb", // border-light
            lineWidth: 0,
          },
          ticks: {
            color: "#6b7280", // text-secondary
            font: {
              size: 11,
            },
            callback: (value) => {
              if (value >= 1000000) {
                return Math.floor(value / 10000) + "만원";
              } else if (value >= 10000) {
                return Math.floor(value / 10000) + "만원";
              }
              return value.toLocaleString() + "원";
            },
          },
          title: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#1f2937", // text-primary
            font: {
              size: 12,
              weight: "600",
            },
            maxTicksLimit: 5,
          },
          title: { display: false },
        },
      },
    },
  });
}

// 차트 초기화 및 리렌더
onMounted(renderChart);
watch(topCategories, renderChart);

// 컴포넌트 언마운트 시 차트 정리
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.spending-pattern-chart {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
  min-height: 220px;
}
.no-data {
  text-align: center;
  color: var(--text-muted);
  padding: var(--spacing-xl) 0;
  font-size: var(--font-size-sm);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .spending-pattern-chart {
    min-height: 240px;
    height: 100%;
  }
}
</style>
