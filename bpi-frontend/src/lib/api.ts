const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

type ApiResponse<T = JsonValue> = T

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T = ApiResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const errorData = (await response.json()) as { message?: string }
        message = errorData.message ?? message
      } catch {
        /* ignore */
      }
      throw new Error(message)
    }

    return (await response.json()) as T
  }

  async login(credentials: {
    email: string
    password: string
    rememberMe?: boolean
  }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    bankCode: string
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getMe() {
    return this.request("/auth/me")
  }

  async refreshToken() {
    if (typeof window === "undefined") return null

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return null

    return this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async sendPayment(paymentData: {
    recipientHandle: string
    amount: number
    memo?: string
  }) {
    return this.request("/payment/send", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getTransactions(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
  }) {
    const query = params
      ? new URLSearchParams(
          Object.entries(params).filter(
            ([, value]) => value !== undefined
          ) as [string, string][]
        ).toString()
      : ""

    return this.request(
      `/payment/transactions${query ? `?${query}` : ""}`
    )
  }

  async getBalance() {
    return this.request("/payment/balance")
  }

  async requestPayment(requestData: {
    fromHandle: string
    amount: number
    memo?: string
    expirationHours?: number
  }) {
    return this.request("/payment/request", {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  }

  async fulfillRequest(requestId: string) {
    return this.request(`/payment/request/${requestId}/fulfill`, {
      method: "POST",
    })
  }

  async declineRequest(requestId: string) {
    return this.request(`/payment/request/${requestId}/decline`, {
      method: "POST",
    })
  }

  async getProfile() {
    return this.request("/user/profile")
  }

  async updateProfile(profileData: { name: string }) {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }) {
    return this.request("/user/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
