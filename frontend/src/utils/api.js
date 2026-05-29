// src/utils/api.js
import axios from 'axios';

// Base URL for the Laravel API – can be overridden via VITE_API_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Pre‑configured axios instance used throughout the frontend
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
