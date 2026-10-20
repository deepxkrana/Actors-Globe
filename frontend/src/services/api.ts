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

  async register(data: { email: string; password: string; name: string; phone?: string; role: "ACTOR" | "CASTER" }) {
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

  async verifyEmail(code: string) {
    return this.request<{ user: User }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ code })
    });
  }

  async verifyPhone(code: string) {
    return this.request<{ user: User }>("/auth/verify-phone", {
      method: "POST",
      body: JSON.stringify({ code })
    });
  }

  async resendVerification(type: "EMAIL" | "PHONE") {
    return this.request<{ message: string; devVerificationCode?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ type })
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string; devResetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword })
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
    const res = await this.request<any>(`/profiles/actor/${actorId}`);
    const profile = res.data?.profile || res.data;
    return { ...res, data: profile as ActorProfile };
  }

  async getCasterProfile(casterId: string) {
    const res = await this.request<any>(`/profiles/caster/${casterId}`);
    const profile = res.data?.profile || res.data;
    return { ...res, data: profile as CasterProfile };
  }

  async updateActorProfile(data: Partial<ActorProfile>) {
    return this.request<ActorProfile>("/profiles/actor/me", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async getMyExperiences() {
    const res = await this.request<any>("/profiles/actor/me/experiences");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.experiences)
      ? res.data.experiences
      : [];
    return { ...res, data: list };
  }

  async addExperience(data: {
    roleTitle: string;
    organization?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }) {
    return this.request<any>("/profiles/actor/me/experiences", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async deleteExperience(experienceId: string) {
    return this.request(`/profiles/actor/me/experiences/${experienceId}`, {
      method: "DELETE"
    });
  }

  async updateCasterProfile(data: Partial<CasterProfile>) {
    return this.request<CasterProfile>("/profiles/caster/me", {
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

  async createProject(data: {
    title: string;
    description: string;
    projectType: string;
    location: string;
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    roles?: Array<{
      title: string;
      description: string;
      genderRequirement?: string;
      minAge?: number;
      maxAge?: number;
    }>;
  }) {
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

  async publishProject(id: string) {
    return this.request<{ project: Project; message?: string }>(`/projects/${id}/publish`, {
      method: "POST"
    });
  }

  async closeProject(id: string) {
    return this.request<{ project: Project; message?: string }>(`/projects/${id}/close`, {
      method: "POST"
    });
  }

  async addCastingRole(projectId: string, data: {
    title: string;
    description: string;
    genderRequirement?: string;
    minAge?: number;
    maxAge?: number;
  }) {
    return this.request<Role>(`/projects/${projectId}/roles`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async updateCastingRole(projectId: string, roleId: string, data: Partial<Role> & { status?: string }) {
    return this.request<Role>(`/projects/${projectId}/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async searchRoles(params?: {
    q?: string;
    keyword?: string;
    roleType?: string;
    projectType?: string;
    unionStatus?: string;
    genderRequirement?: string;
    age?: number;
    ageMin?: number;
    ageMax?: number;
    location?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      const qVal = params.q || params.keyword;
      if (qVal) searchParams.append("q", qVal);
      if (params.projectType) searchParams.append("projectType", params.projectType);
      if (params.roleType) searchParams.append("roleType", params.roleType);
      if (params.unionStatus) searchParams.append("unionStatus", params.unionStatus);
      if (params.genderRequirement) searchParams.append("genderRequirement", params.genderRequirement);
      if (params.age !== undefined) searchParams.append("age", String(params.age));
      if (params.ageMin !== undefined) searchParams.append("minAge", String(params.ageMin));
      if (params.ageMax !== undefined) searchParams.append("maxAge", String(params.ageMax));
      if (params.location) searchParams.append("location", params.location);
    }
    const res = await this.request<any>(`/search/roles${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.roles)
      ? res.data.roles
      : [];
    return { ...res, data: list as Role[] };
  }

  async searchActors(params?: {
    q?: string;
    skills?: string[];
    gender?: string;
    minAge?: number;
    maxAge?: number;
    hasExperience?: boolean;
    experienceKeyword?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.q) searchParams.append("q", params.q);
      if (params.skills && params.skills.length > 0) searchParams.append("skills", params.skills.join(","));
      if (params.gender) searchParams.append("gender", params.gender);
      if (params.minAge !== undefined) searchParams.append("minAge", String(params.minAge));
      if (params.maxAge !== undefined) searchParams.append("maxAge", String(params.maxAge));
      if (params.hasExperience !== undefined) searchParams.append("hasExperience", String(params.hasExperience));
      if (params.experienceKeyword) searchParams.append("experienceKeyword", params.experienceKeyword);
    }
    const res = await this.request<any>(`/search/actors${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.actors)
      ? res.data.actors
      : [];
    return { ...res, data: list as ActorProfile[] };
  }

  async searchProjects(params?: {
    q?: string;
    projectType?: string;
    location?: string;
    hasOpenRoles?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.q) searchParams.append("q", params.q);
      if (params.projectType) searchParams.append("projectType", params.projectType);
      if (params.location) searchParams.append("location", params.location);
      if (params.hasOpenRoles !== undefined) searchParams.append("hasOpenRoles", String(params.hasOpenRoles));
    }
    const res = await this.request<any>(`/search/projects${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.projects)
      ? res.data.projects
      : [];
    return { ...res, data: list as Project[] };
  }

  async getSearchFilters() {
    return this.request<{ skills: string[]; genders: string[]; projectTypes: string[] }>("/search/filters");
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
      body: JSON.stringify({
        castingRoleId: roleId,
        roleId,
        notes,
        auditionTapeUrl
      })
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

  async getCasterRoleApplications(roleId: string, params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await this.request<any>(`/applications/role/${roleId}${qs}`);
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
  async sendCastingRequest(data: { roleId?: string; castingRoleId?: string; actorId: string; message?: string }) {
    return this.request<CastingRequest>("/casting-requests", {
      method: "POST",
      body: JSON.stringify({
        actorId: data.actorId,
        castingRoleId: data.castingRoleId || data.roleId
      })
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

  async respondToCastingRequest(id: string, status: "ACCEPTED" | "DECLINED" | "REJECTED") {
    const normalizedStatus = status === "DECLINED" ? "REJECTED" : status;
    return this.request<CastingRequest>(`/casting-requests/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status: normalizedStatus })
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

  // --- Notifications ---
  async getNotifications(page = 1, limit = 20) {
    const res = await this.request<any>(`/notifications?page=${page}&limit=${limit}`);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.notifications)
      ? res.data.notifications
      : [];
    return { ...res, data: list };
  }

  async getUnreadNotificationCount() {
    return this.request<{ unreadCount: number }>("/notifications/unread-count");
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, {
      method: "PATCH"
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>("/notifications/mark-all-read", {
      method: "PATCH"
    });
  }

  // --- Subscriptions & Payments ---
  async getSubscriptionPlans() {
    return this.request<any>("/subscriptions/plans");
  }

  async getCurrentSubscription() {
    return this.request<{
      isPremium: boolean;
      role: string;
      planType: string | null;
      status: string;
      startDate: string | null;
      endDate: string | null;
      autoRenew: boolean;
      daysRemaining: number;
    }>("/subscriptions/current");
  }

  async createCheckout(planType: "ACTOR_PREMIUM" | "CASTER_PREMIUM") {
    return this.request<{
      orderId: string;
      amount: number;
      currency: string;
      planType: string;
      planName: string;
      durationDays: number;
      keyId: string;
    }>("/subscriptions/checkout", {
      method: "POST",
      body: JSON.stringify({ planType })
    });
  }

  async verifyPayment(data: { orderId: string; paymentId: string; signature: string }) {
    return this.request<any>("/subscriptions/verify", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async cancelSubscription() {
    return this.request<{ message: string; cancelledSubscription: any }>("/subscriptions/cancel", {
      method: "POST"
    });
  }

  async getBillingHistory(page = 1, limit = 20) {
    return this.request<any>(`/subscriptions/history?page=${page}&limit=${limit}`);
  }

  async createCheckoutSession(planId: string) {
    const planType = planId.toLowerCase().includes("caster") ? "CASTER_PREMIUM" : "ACTOR_PREMIUM";
    return this.createCheckout(planType);
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

  async getAdminReports(params?: { status?: string; targetType?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.targetType) query.append("targetType", params.targetType);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await this.request<any>(`/admin/reports${qs}`, {}, true);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.reports)
      ? res.data.reports
      : [];
    return { ...res, data: list as ModerationReport[] };
  }

  async getAdminReportById(id: string) {
    return this.request<any>(`/admin/reports/${id}`, {}, true);
  }

  async updateReportStatus(id: string, status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED", resolutionNote?: string) {
    return this.request<any>(`/admin/reports/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, resolutionNote })
    }, true);
  }

  async moderateUser(userId: string, isActive: boolean, reason: string) {
    return this.request<any>(`/admin/users/${userId}/moderation`, {
      method: "PATCH",
      body: JSON.stringify({ isActive, reason })
    }, true);
  }

  // Backwards compatibility aliases
  async resolveReport(id: string, resolution: "RESOLVED" | "DISMISSED", resolutionNotes?: string) {
    return this.updateReportStatus(id, resolution, resolutionNotes);
  }

  async toggleUserSuspension(userId: string, isSuspended: boolean, reason?: string) {
    return this.moderateUser(userId, !isSuspended, reason || "Administrative conduct policy enforcement");
  }
}

export const api = new ApiClient();
