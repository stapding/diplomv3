// frontend/src/services/authService.js
const API_URL = 'http://localhost:3001/api'; // Your backend API base URL

// Function to handle user login and store data
const login = (userData, token) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  // Добавляем событие для обновления интерфейса
  window.dispatchEvent(new Event('auth-change'));
};

// Function to handle user logout
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Добавляем событие до перенаправления
  window.dispatchEvent(new Event('auth-change'));
};

// Function to get the current logged-in user data
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
      logout(); // Clear corrupted data
      return null;
    }
  }
  return null;
};

// Function to get the stored JWT token
const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  login,
  logout,
  getCurrentUser,
  getToken,
  API_URL
};