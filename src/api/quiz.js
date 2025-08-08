import api from '@/api';

const BASE_URL = `quiz`;

export default {
  // 오늘의 퀴즈 가져오기
  async getTodayQuiz() {
    try {
      // console.log('🔍 퀴즈 API 호출:', `${BASE_URL}/today`);
      const response = await api.get(`${BASE_URL}/today`);
      // console.log('📥 퀴즈 API 응답:', response);

      // 백엔드 SuccessResponse 구조에 맞춰 처리: { result: data }
      if (response.data && response.data.result !== undefined) {
        return response.data.result; // SuccessResponse 래핑된 경우
      } else if (response.data) {
        return response.data; // 직접 데이터인 경우
      } else {
        console.warn('퀴즈 API 응답 구조가 예상과 다릅니다:', response);
        return null;
      }
    } catch (error) {
      console.error('퀴즈 API 호출 실패:', error);
      throw error;
    }
  },

  // 퀴즈 답안 제출하기
  async submitAnswer(problemId, userAnswer) {
    try {
      console.log('🔍 답안 제출 API 호출:', `${BASE_URL}/submit`, {
        problemId,
        userAnswer,
      });
      const response = await api.post(`${BASE_URL}/submit`, {
        problemId,
        userAnswer,
      });
      console.log('📥 답안 제출 API 응답:', response);

      if (response.data && response.data.result !== undefined) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      } else {
        console.warn('답안 제출 API 응답 구조가 예상과 다릅니다:', response);
        return null;
      }
    } catch (error) {
      console.error('답안 제출 API 호출 실패:', error);
      throw error;
    }
  },

  // 사용자 퀴즈 통계 가져오기
  async getUserQuizStats() {
    try {
      console.log('🔍 통계 API 호출:', `${BASE_URL}/stats`);
      const response = await api.get(`${BASE_URL}/stats`);
      console.log('📥 통계 API 응답:', response);

      if (response.data && response.data.result !== undefined) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      } else {
        console.warn('통계 API 응답 구조가 예상과 다릅니다:', response);
        return null;
      }
    } catch (error) {
      console.error('통계 API 호출 실패:', error);
      throw error;
    }
  },

  // 오늘의 퀴즈 완료 여부 확인
  async getTodayQuizCompleted() {
    try {
      console.log('🔍 완료 상태 API 호출:', `${BASE_URL}/today/completed`);
      const response = await api.get(`${BASE_URL}/today/completed`);
      console.log('📥 완료 상태 API 응답:', response);

      if (response.data && typeof response.data.result !== 'undefined') {
        return response.data.result;
      } else if (typeof response.data !== 'undefined') {
        return response.data;
      } else {
        console.warn('완료 상태 API 응답 구조가 예상과 다릅니다:', response);
        return false;
      }
    } catch (error) {
      console.error('완료 상태 API 호출 실패:', error);
      throw error;
    }
  },
};
