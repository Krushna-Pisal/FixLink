import client from './client';

export const insightsApi = {
  generate: (sessionId) => client.post(`/insights/${sessionId}/generate`),
};
