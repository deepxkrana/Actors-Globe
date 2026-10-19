export interface AdminTokenPayload {
  adminId: string;
  email: string;
  name: string;
  role: "ADMIN";
}

export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
  byTargetType: Record<string, number>;
  recentReports: any[];
}
