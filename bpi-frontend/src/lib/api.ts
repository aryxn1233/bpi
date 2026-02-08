const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: { name: string; email: string; password: string; bankCode: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async sendPayment(paymentData: { recipientHandle: string; amount: number; memo?: string }) {
    return this.request('/payment/send', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async getTransactions(params?: { page?: number; limit?: number; type?: string; status?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : ''
    return this.request(`/payment/transactions${query ? `?${query}` : ''}`)
  }

  async getBalance() {
    return this.request('/payment/balance')
  }

  async requestPayment(requestData: { fromHandle: string; amount: number; memo?: string; expirationHours?: number }) {
    return this.request('/payment/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async fulfillRequest(requestId: string) {
    return this.request(`/payment/request/${requestId}/fulfill`, {
      method: 'POST',
    })
  }

  async declineRequest(requestId: string) {
    return this.request(`/payment/request/${requestId}/decline`, {
      method: 'POST',
    })
  }

  async getProfile() {
    return this.request('/user/profile')
  }

  async updateProfile(profileData: { name: string }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
