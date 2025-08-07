import apiClient from './index';

const favorite = {
  /**
   * 즐겨찾기 추가 요청
   * @param {number|string} productId - 상품 ID (depositProductId를 사용)
   * @param {string} productType - 상품 유형 (DEPOSIT, SAVING, CARD 등)
   */
  async addFavorite(productId, productType) {
    console.log('즐겨찾기 추가 요청:', { productId, productType });

    try {
      // productId가 숫자가 아닌 경우 에러 처리
      const numericProductId = Number(productId);
      if (isNaN(numericProductId)) {
        throw new Error('유효하지 않은 상품 ID입니다.');
      }

      const response = await apiClient.post(
        `/favorite/${numericProductId}?productType=${productType}`
      );
      console.log('즐겨찾기 추가 성공:', response.data);
      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 409) {
        console.warn('이미 즐겨찾기에 추가된 상품입니다.');
        throw new Error('이미 즐겨찾기된 상품입니다.');
      }

      console.error('즐겨찾기 추가 실패:', status, error.message);
      throw new Error('즐겨찾기 추가에 실패했습니다.');
    }
  },

  /**
   * 즐겨찾기 삭제 요청
   * @param {number|string} productId - 상품 ID (depositProductId를 사용)
   * @param {string} productType - 상품 유형
   */
  async deleteFavorite(productId, productType) {
    console.log('즐겨찾기 제거 요청:', { productId, productType });

    try {
      // productId가 숫자가 아닌 경우 에러 처리
      const numericProductId = Number(productId);
      if (isNaN(numericProductId)) {
        throw new Error('유효하지 않은 상품 ID입니다.');
      }

      // DELETE 요청은 쿼리 파라미터 방식으로 처리
      const response = await apiClient.delete(
        `/favorite/${numericProductId}?productType=${productType}`
      );
      console.log('즐겨찾기 제거 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        '즐겨찾기 제거 실패:',
        error.response?.status,
        error.message
      );
      throw new Error('즐겨찾기 제거에 실패했습니다.');
    }
  },

  /**
   * 즐겨찾기 목록 조회
   * @returns {Promise<Array>} 즐겨찾기 리스트
   */
  async getFavorites() {
    console.log('즐겨찾기 목록 조회 시도');

    try {
      const response = await apiClient.get('/favorite');
      console.log('즐겨찾기 목록 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        '즐겨찾기 목록 조회 실패:',
        error.response?.status,
        error.message
      );
      throw new Error('즐겨찾기 목록 조회에 실패했습니다.');
    }
  },
};

export default favorite;
