import api from '@/api';
const BASE_URL = '/webtoon';

export default {
  async getTop4() {
    const { data } = await api.get(`${BASE_URL}/top4`);
    return data;
  },
};
