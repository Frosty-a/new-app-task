import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const fetchTasks = (status) =>
  api.get('/tasks', { params: status ? { status } : {} });

export const createTask = (payload) => api.post('/tasks', payload);

export const updateTask = (id, payload) => api.put(`/tasks/${id}`, payload);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
