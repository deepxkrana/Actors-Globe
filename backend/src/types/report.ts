export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export type ReportTargetType =
  | "USER"
  | "PROFILE"
  | "PROJECT"
  | "CASTING_ROLE"
  | "MEDIA"
  | "MESSAGE";

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
  reportedUserId?: string;
}

export interface UpdateReportStatusInput {
  status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  resolutionNote?: string;
}

export interface ReportFilterQuery {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
}
