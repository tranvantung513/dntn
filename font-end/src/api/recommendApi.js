import axios from '../utils/axiosConfig';

export const recommendApi = {
  getRecommendations: async () => {
    return axios.get('/api/recommend');
  }
};
