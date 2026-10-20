import type {
  User,
  ActorProfile,
  CasterProfile,
  Project,
  Role,
  Application,
  CastingRequest,
  Conversation,
  Message,
  ModerationReport
} from "../types";

const API_BASE = "/api";

class ApiClient {
  private token: string | null = null;
  private adminToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem("actorsglobe_token");
    this.adminToken = localStorage.getItem("actorsglobe_admin_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("actorsglobe_token", token);
    } else {
      localStorage.removeItem("actorsglobe_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setAdminToken(token: string | null) {
    this.adminToken = token;
    if (token) {
      localStorage.setItem("actorsglobe_admin_token", token);
    } else {
      localStorage.removeItem("actorsglobe_admin_token");
    }
  }

  getAdminToken(): string | null {
    return this.adminToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAdmin = false
  ): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>)
    };

    const authToken = useAdmin ? this.adminToken : this.token;
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: json.message || json.error || `HTTP error ${response.status}`
        };
      }

      return {
        success: true,
        data: (json.data !== undefined ? json.data : json) as T,
        message: json.message
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error. Please ensure backend server is reachable."
      };
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const res = await this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(data: { email: string; password: string; name: string; role: "ACTOR" | "CASTER" }) {
    const res = await this.request<{ user: User; token?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getCurrentUser() {
    return this.request<User>("/auth/me");
  }

  async verifyEmail(token: string) {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token })
    });
  }

  logout() {
    this.setToken(null);
  }

  // --- Profile Endpoints ---
  async getMyProfile() {
    return this.request<{ profile: ActorProfile | CasterProfile; role: string }>("/profiles/me");
  }

  async getActorProfile(actorId: string) {
    return this.request<ActorProfile>(`/profiles/actor/${actorId}`);
  }

  async updateActorProfile(data: Partial<ActorProfile>) {
    return this.request<ActorProfile>("/profiles/actor", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async updateCasterProfile(data: Partial<CasterProfile>) {
    return this.request<CasterProfile>("/profiles/caster", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  // --- Projects & Roles ---
  async getProjects(params?: { type?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await this.request<any>(`/projects${query ? `?${query}` : ""}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.projects)
      ? res.data.projects
      : [];
    return { ...res, data: list as Project[] };
  }

  async getMyProjects() {
    const res = await this.request<any>("/projects/my");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.projects)
      ? res.data.projects
      : [];
    return { ...res, data: list as Project[] };
  }

  async getProjectById(id: string) {
    const res = await this.request<any>(`/projects/${id}`);
    const project = res.data?.project || res.data;
    return { ...res, data: project as Project };
  }

  async createProject(data: Omit<Partial<Project>, "roles"> & { roles?: Array<Partial<Role>> }) {
    return this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async searchRoles(params?: {
    keyword?: string;
    roleType?: string;
    projectType?: string;
    unionStatus?: string;
    ageMin?: number;
    ageMax?: number;
    location?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await this.request<any>(`/search/roles${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.roles)
      ? res.data.roles
      : [];
    return { ...res, data: list as Role[] };
  }

  async getRoleById(roleId: string) {
    const res = await this.request<any>(`/projects/roles/${roleId}`);
    const role = res.data?.role || res.data;
    return { ...res, data: role as Role };
  }

  // --- Applications ---
  async applyToRole(roleId: string, notes?: string, auditionTapeUrl?: string) {
    return this.request<Application>("/applications", {
      method: "POST",
      body: JSON.stringify({ roleId, notes, auditionTapeUrl })
    });
  }

  async getMyApplications() {
    const res = await this.request<any>("/applications/my");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.applications)
      ? res.data.applications
      : [];
    return { ...res, data: list as Application[] };
  }

  async getProjectApplications(projectId: string) {
    const res = await this.request<any>(`/applications/project/${projectId}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.applications)
      ? res.data.applications
      : [];
    return { ...res, data: list as Application[] };
  }

  async updateApplicationStatus(id: string, status: string, notes?: string) {
    return this.request<Application>(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes })
    });
  }

  // --- Casting Requests ---
  async sendCastingRequest(data: { roleId: string; actorId: string; message?: string }) {
    return this.request<CastingRequest>("/casting-requests", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async getMyCastingRequests() {
    const res = await this.request<any>("/casting-requests/my");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.requests)
      ? res.data.requests
      : Array.isArray(res.data?.castingRequests)
      ? res.data.castingRequests
      : [];
    return { ...res, data: list as CastingRequest[] };
  }

  async respondToCastingRequest(id: string, status: "ACCEPTED" | "DECLINED") {
    return this.request<CastingRequest>(`/casting-requests/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }

  // --- Conversations & Messages ---
  async getConversations() {
    const res = await this.request<any>("/conversations");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.conversations)
      ? res.data.conversations
      : [];
    return { ...res, data: list as Conversation[] };
  }

  async getOrCreateConversation(recipientId: string) {
    return this.request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId })
    });
  }

  async getMessages(conversationId: string) {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
  }

  // --- Subscriptions & Payments ---
  async getSubscriptionPlans() {
    return this.request<any>("/subscriptions/plans");
  }

  async createCheckoutSession(planId: string, billingCycle: "monthly" | "yearly") {
    return this.request<{ checkoutUrl?: string; sessionId?: string }>("/subscriptions/checkout-session", {
      method: "POST",
      body: JSON.stringify({ planId, billingCycle })
    });
  }

  // --- Reports & Moderation ---
  async submitReport(data: { targetType: string; targetId: string; reason: string; details?: string }) {
    return this.request<ModerationReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  // --- Admin Portal ---
  async adminLogin(secretKey: string, email?: string) {
    const res = await this.request<{ token: string; admin: any }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: email || "admin@actorsglobe.com",
        password: secretKey,
        secretKey
      })
    });
    if (res.success && res.data?.token) {
      this.setAdminToken(res.data.token);
    }
    return res;
  }

  async getAdminStats() {
    return this.request<any>("/admin/dashboard/stats", {}, true);
  }

  async getAdminReports(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.request<ModerationReport[]>(`/admin/reports${query}`, {}, true);
  }

  async resolveReport(id: string, resolution: "RESOLVED" | "DISMISSED", resolutionNotes?: string) {
    return this.request<ModerationReport>(`/admin/reports/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({ resolution, resolutionNotes })
    }, true);
  }

  async toggleUserSuspension(userId: string, isSuspended: boolean, reason?: string) {
    return this.request<{ user: User }>(`/admin/users/${userId}/suspend`, {
      method: "PATCH",
      body: JSON.stringify({ isSuspended, reason })
    }, true);
  }
}

export const api = new ApiClient();
