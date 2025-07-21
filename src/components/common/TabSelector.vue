<template>
  <div class="tab-container">
    <div
      v-for="tab in tabs"
      :key="tab"
      :class="['tab-item', { active: selectedTab === tab }]"
      @click="selectTab(tab)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabSelector',
  data() {
    return {
      tabs: ['예금', '적금', '카드'],
      selectedTab: tabs[0],
    };
  },
  methods: {
    selectTab(tab) {
      this.selectedTab = tab;
      this.$emit('change-tab', tab); // 부모에 알릴 수 있음
    },
  },
};
</script>

<style scoped>
.tab-container {
  display: flex;
  background-color: var(--color-accent); /* 전체 배경 */
  border-radius: 2rem;
  padding: clamp(4px, 1%, 6px);
}

.tab-item {
  transition: 0.3s ease-in-out;
  flex: 1;
  text-align: center;
  padding: 2% 0;
  padding: clamp(4px, 2%, 12px) 0;
  border-radius: 2rem;
  color: var(--color-white);
  cursor: pointer;
  transition: 0.2s;
  font-size: 1.2rem;
  font-weight: 900;
}

.tab-item.active {
  background-color: var(--color-white);
  color: var(--color-accent); /* 전체 배경 */
}

.tab-item:hover {
  background-color: var(--color-dark);
}

.tab-item.active:hover {
  background-color: var(--color-white);
  color: var(--color-accent);
}
</style>
