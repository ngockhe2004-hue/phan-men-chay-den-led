// ========================================================
// API CLIENT - KẾT NỐI FRONTEND VỚI NESTJS BACKEND
// ========================================================

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('led_cms_jwt_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('led_cms_jwt_token', token);
      } else {
        localStorage.removeItem('led_cms_jwt_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ----------------------------------------------------
  // Health check
  // ----------------------------------------------------
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/screens`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      return res.status === 200 || res.status === 401; // Backend responds
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------
  // Auth
  // ----------------------------------------------------
  async login(email: string, password: string):Promise<{ accessToken: string }> {
    const data = await this.request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // ----------------------------------------------------
  // Screens
  // ----------------------------------------------------
  async getScreens() {
    return this.request<any[]>('/screens');
  }

  async getScreen(id: string) {
    return this.request<any>(`/screens/${id}`);
  }

  async updateScreen(id: string, data: any) {
    return this.request<any>(`/screens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async sendCommand(id: string, command: string, payload?: any) {
    return this.request<any>(`/screens/${id}/command`, {
      method: 'POST',
      body: JSON.stringify({ command, payload }),
    });
  }

  async pairScreen(pairingCode: string, name?: string) {
    return this.request<any>('/screens/pair', {
      method: 'POST',
      body: JSON.stringify({ pairingCode, name }),
    });
  }

  // ----------------------------------------------------
  // Media
  // ----------------------------------------------------
  async getMedia(query?: { type?: string; search?: string }) {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.search) params.append('search', query.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/media${qs}`);
  }

  async uploadMedia(file: File, extraData?: { title?: string; duration?: number }) {
    const formData = new FormData();
    formData.append('file', file);
    if (extraData?.title) formData.append('title', extraData.title);
    if (extraData?.duration) formData.append('duration', extraData.duration.toString());

    return this.request<any>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteMedia(id: string) {
    return this.request<any>(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------------------------------------------
  // Layouts
  // ----------------------------------------------------
  async getLayouts() {
    return this.request<any[]>('/layouts');
  }

  async createLayout(layout: any) {
    return this.request<any>('/layouts', {
      method: 'POST',
      body: JSON.stringify(layout),
    });
  }

  async updateLayout(id: string, layout: any) {
    return this.request<any>(`/layouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(layout),
    });
  }

  async deleteLayout(id: string) {
    return this.request<any>(`/layouts/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------------------------------------------
  // Schedules
  // ----------------------------------------------------
  async getSchedules() {
    return this.request<any[]>('/schedules');
  }

  async createSchedule(schedule: any) {
    return this.request<any>('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async updateSchedule(id: string, schedule: any) {
    return this.request<any>(`/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    });
  }

  async deleteSchedule(id: string) {
    return this.request<any>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------------------------------------------
  // Logs & Proof of Play
  // ----------------------------------------------------
  async getLogs(query?: { screenId?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (query?.screenId) params.append('screenId', query.screenId);
    if (query?.limit) params.append('limit', query.limit.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/logs${qs}`);
  }

  async logProofOfPlay(data: {
    screenId: string;
    screenName: string;
    mediaId: string;
    mediaTitle: string;
    mediaType?: string;
    durationSeconds: number;
  }) {
    return this.request<any>('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStats() {
    return this.request<any>('/logs/stats');
  }
}

export const api = new ApiClient();
export default api;
