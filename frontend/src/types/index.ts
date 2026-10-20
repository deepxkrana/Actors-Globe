export type UserRole = "ACTOR" | "CASTER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: UserRole;
  isVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface ActorProfile {
  id: string;
  userId: string;
  displayName?: string;
  stageName?: string;
  age?: number;
  gender?: string;
  bio?: string;
  headshotUrl?: string;
  additionalPhotos?: string[];
  reelUrl?: string;
  audioClips?: string[];
  heightCm?: number;
  eyeColor?: string;
  hairColor?: string;
  unionStatus?: string;
  agentName?: string;
  agentEmail?: string;
  credits?: Array<{
    title: string;
    role: string;
    production: string;
    year: number;
  }>;
  skills?: string[];
  experiences?: Array<{
    id: string;
    roleTitle: string;
    organization: string;
    description?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    isCurrent?: boolean;
  }>;
  user?: {
    id?: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CasterProfile {
  id: string;
  userId: string;
  displayName?: string;
  companyName?: string;
  bio?: string;
  website?: string;
  isVerified: boolean;
  phone?: string;
  user?: {
    id?: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export type ProjectType = "FEATURE_FILM" | "SHORT_FILM" | "COMMERCIAL" | "THEATRE" | "VOICEOVER" | "SERIES";
export type ProjectStatus = "DRAFT" | "ACTIVE" | "CASTING_CLOSED" | "ARCHIVED";
export type RoleType = "LEAD" | "SUPPORTING" | "FEATURED" | "EXTRA" | "VOICE";
export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "SHORTLISTED" | "AUDITION_REQUESTED" | "ACCEPTED" | "REJECTED";

export interface Role {
  id: string;
  projectId: string;
  name: string;
  characterName?: string;
  roleType: RoleType;
  description: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  ethnicity?: string;
  payRate?: string;
  isUnion: boolean;
  sidesUrl?: string;
  deadline?: string;
  createdAt: string;
  project?: Project;
}

export interface Project {
  id: string;
  casterId: string;
  title: string;
  synopsis: string;
  projectType: ProjectType;
  status: ProjectStatus;
  unionStatus: string;
  location?: string;
  productionDates?: string;
  createdAt: string;
  roles?: Role[];
  caster?: {
    id: string;
    user: {
      name: string;
      email: string;
      avatarUrl?: string;
    };
    companyName?: string;
    isVerified: boolean;
  };
}

export interface Application {
  id: string;
  roleId: string;
  actorId: string;
  status: ApplicationStatus;
  notes?: string;
  auditionTapeUrl?: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  actor?: {
    id: string;
    user: {
      name: string;
      email: string;
      avatarUrl?: string;
    };
    headshotUrl?: string;
    reelUrl?: string;
    stageName?: string;
    unionStatus?: string;
    skills?: string[];
  };
}

export interface CastingRequest {
  id: string;
  roleId: string;
  casterId: string;
  actorId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message?: string;
  createdAt: string;
  role?: Role;
  caster?: {
    companyName?: string;
    user: { name: string; avatarUrl?: string };
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  lastMessageAt: string;
  createdAt: string;
  otherUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  };
  lastMessage?: Message;
  unreadCount?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "FREE" | "ACTOR_PRO" | "CASTER_PRO" | "STUDIO_ELITE";
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isPopular?: boolean;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: "USER" | "PROFILE" | "PROJECT" | "CASTING_ROLE" | "MEDIA" | "MESSAGE" | string;
  targetId: string;
  reportedUserId?: string;
  reason: string;
  details?: string;
  status: "PENDING" | "UNDER_REVIEW" | "INVESTIGATING" | "RESOLVED" | "DISMISSED" | string;
  resolutionNote?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id?: string;
    name: string;
    email: string;
    role?: string;
  };
  reportedUser?: {
    id?: string;
    name: string;
    email: string;
    role?: string;
    isActive?: boolean;
  };
  targetDetails?: any;
}
