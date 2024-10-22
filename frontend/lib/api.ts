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

// lib/api.ts

export const submitPredictions = async (token: string, payload: any) => {
  const response = await fetch(`${API_URL}/guesses/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.message || 'Failed to submit predictions.');
    // @ts-ignore
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return data;
};

