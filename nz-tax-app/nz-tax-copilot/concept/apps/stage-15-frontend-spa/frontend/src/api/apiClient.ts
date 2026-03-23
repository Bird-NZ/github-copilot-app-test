import axios, { AxiosInstance } from 'axios'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8787',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
