import api from '@/api';

const BASE_URL = `/favorite`;

export default {
  async addFavorite(productId, productType) {
    const query = new URLSearchParams({ productType }).toString();
    await api.post(`${BASE_URL}/${productId}?${query}`);
  },
  async deleteFavorite(productId, productType) {
    const query = new URLSearchParams({ productType }).toString();
    await api.delete(`${BASE_URL}/${productId}?${query}`);
  },
};
