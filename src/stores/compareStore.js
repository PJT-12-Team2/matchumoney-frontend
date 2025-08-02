// src/stores/compareStore.js
import { defineStore } from 'pinia';

export const useCompareStore = defineStore('compare', {
  state: () => ({
    //시작할 때 로컬 스토리지 가지고 오기
    compareList: JSON.parse(localStorage.getItem('compareList') || '[]'),
  }),
  actions: {
    addProduct(product) {
      const exists = this.compareList.find(
        (p) => p.id === product.id && p.type === product.type
      );
      if (!exists) {
        this.compareList.push(product);
        this.saveToLocalStorage();
      }
    },
    removeProduct(product) {
      this.compareList = this.compareList.filter(
        (p) => !(p.id === product.id && p.type === product.type)
      );
      this.saveToLocalStorage();
    },
    clearCompareList() {
      this.compareList = [];
      localStorage.removeItem('compareList');
    },
    saveToLocalStorage() {
      //로컬 스토리지에 저장해놓기
      localStorage.setItem('compareList', JSON.stringify(this.compareList));
    },
    isCompared(productId, productType) {
      //추가 여부 확인
      return this.compareList.some(
        (p) => p.id === productId && p.type === productType
      );
    },
  },
});
