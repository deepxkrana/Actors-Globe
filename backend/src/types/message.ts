export type MessageType = "TEXT" | "SYSTEM";

export type CreateConversationInput = {
  actorId?: string;
  casterId?: string;
  recipientUserId?: string;
};

export type SendMessageInput = {
  content: string;
  type?: MessageType;
};

export type MessageQuery = {
  page?: number;
  limit?: number;
  before?: string; // Cursor timestamp or ISO date
};

export type ConversationQuery = {
  page?: number;
  limit?: number;
};

export type ParticipantDetail = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  role: "ACTOR" | "CASTER";
};

export type ConversationItem = {
  id: string;
  actor: ParticipantDetail;
  caster: ParticipantDetail;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string | null;
    type: MessageType;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};
