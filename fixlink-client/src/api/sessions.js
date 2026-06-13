import client from './client';

export const sessionsApi = {
  create: (data) => client.post('/sessions/create', data),
  getByToken: (token) => client.get(`/sessions/join/${token}`),
  join: (token, data) => client.post(`/sessions/join/${token}`, data),
  get: (id) => client.get(`/sessions/${id}`),
  end: (id) => client.post(`/sessions/${id}/end`),
  list: () => client.get('/sessions'),
};
