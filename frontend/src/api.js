// frontend/src/api.js
const API = 'http://localhost:5000/api';

export const apiFetch = (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem('pharmacare_user') || '{}');
  return fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': user.Role || 'staff',
      ...(options.headers || {}),
    },
  });
};