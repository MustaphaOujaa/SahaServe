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

export const downloadInvoice = async (type, id) => {
  const token = localStorage.getItem('auth_token');
  const endpoint = type === 'reservation'
    ? `/reservations/${id}/invoice`
    : `/orders/${id}/invoice`;

  const response = await api.get(endpoint, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${type}-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadAdminReport = async (type, date) => {
  const token = localStorage.getItem('auth_token');

  const response = await api.get('/admin/reports/pdf', {
    params: { type, date },
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}-${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
