import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add wallet address
api.interceptors.request.use((config) => {
  const walletAddress = localStorage.getItem('walletAddress')
  if (walletAddress) {
    config.headers['wallet-address'] = walletAddress
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      throw {
        status: error.response.status,
        message: error.response.data.error,
        details: error.response.data.details,
      }
    } else if (error.request) {
      // Request made but no response
      throw {
        status: 503,
        message: 'Service unavailable',
      }
    } else {
      // Error setting up request
      throw {
        status: 500,
        message: error.message,
      }
    }
  }
)

// API endpoints
export const orderApi = {
  create: (items: any[]) => api.post('/orders', { items }),
  getAll: () => api.get('/orders/user'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
}

export const paymentApi = {
  create: (orderId: string) => api.post(`/payments/orders/${orderId}`),
  confirm: (orderId: string, signature: string) => 
    api.post(`/payments/orders/${orderId}/confirm`, { signature }),
  getBalance: () => api.get('/payments/balance'),
}

export default api
