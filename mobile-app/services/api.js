import axios from 'axios';

const api = axios.create({
  baseURL: 'https://online-event-management-system-134k.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEvents = async () => {
  return api.get('/api/events');
};

export const createEvent = async (eventPayload) => {
  return api.post('/api/events', eventPayload);
};

export const loginUser = async (credentials) => {
  return api.post('/api/auth/login', credentials);
};

export default api;
