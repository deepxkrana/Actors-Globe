export type NotificationType =
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "CASTING_REQUEST_RECEIVED"
  | "CASTING_REQUEST_ACCEPTED"
  | "CASTING_REQUEST_REJECTED"
  | "NEW_MESSAGE"
  | "APPLICATION_DEADLINE"
  | "GENERAL";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
};

export type NotificationQuery = {
  isRead?: boolean;
  page?: number;
  limit?: number;
};
