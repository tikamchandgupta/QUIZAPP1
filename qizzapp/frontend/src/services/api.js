import axios from 'axios';

const API_BASE_URL = 'https://quizapp-imt6.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auction API
export const auctionAPI = {
  getStatus: () => apiClient.get('/auction/status'),
  getAllPlayers: () => apiClient.get('/auction/players'),
  getAvailablePlayers: () => apiClient.get('/auction/players/available'),
  getPlayerById: (id) => apiClient.get(`/auction/players/${id}`),
  getTeams: () => apiClient.get('/auction/teams'),
  getTeamPlayers: (teamId) => apiClient.get(`/auction/teams/${teamId}/players`),
  assignPlayer: (playerId, teamId, soldPrice) =>
    apiClient.post('/auction/assign', { playerId, teamId, soldPrice }),
  validateBid: (teamId, bidAmount) =>
    apiClient.post('/auction/validate-bid', { teamId, bidAmount }),
  undoAuction: () => apiClient.post('/auction/undo'),
  resetAuction: () => apiClient.post('/auction/reset')
};

// Quiz API
export const quizAPI = {
  getLeaderboard: () => apiClient.get('/quiz/leaderboard'),
  getQuestion: (playerId) => apiClient.get(`/quiz/questions/${playerId}`),
  getAllQuestions: () => apiClient.get('/quiz/questions'),
  updateScore: (teamId, score) =>
    apiClient.post('/quiz/score', { teamId, score }),
  incrementScore: (teamId, points) =>
    apiClient.post('/quiz/score/increment', { teamId, points })
};

// Export API
export const exportAPI = {
  exportAuctionResults: () => `${API_BASE_URL.replace('/api', '')}/api/export/auction`,
  exportQuizResults: () => `${API_BASE_URL.replace('/api', '')}/api/export/quiz`
};

export default apiClient;

