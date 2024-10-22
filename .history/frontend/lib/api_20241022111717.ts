//lib/api.ts

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const registerUser = async (userData: { username: string; email: string; colboNumber: string; password: string; }) => {
  const response = await axios.post(`${API_URL}/auth/register/`, {
    username: userData.username,
    email: userData.email,
    number: Number(userData.colboNumber),
    password: userData.password,
  });
  return response.data;
};

export const loginUser = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
  return response.data;
};

export const fetchGuesses = async (token: string) => {
  const response = await axios.get(`${API_URL}/guesses/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const submitPredictions = async (token: string, predictions: any[]) => {
  const response = await axios.post(`${API_URL}/guesses/`, predictions, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};