export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "ACTOR" | "CASTER";
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthTokenPayload = {
  userId: string;
  role: "ACTOR" | "CASTER";
  email: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ACTOR" | "CASTER";
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type VerifyEmailInput = {
  code: string;
};

export type VerifyPhoneInput = {
  code: string;
};

export type ResendVerificationInput = {
  type: "EMAIL" | "PHONE";
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};