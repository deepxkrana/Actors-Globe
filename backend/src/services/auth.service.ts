import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { hashToken, generateNumericCode, generateSecureToken } from "../utils/crypto.js";
import type { RegisterInput, SafeUser } from "../types/auth.js";

const toSafeUser = (user: {
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
}): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const createVerificationChallenge = async (
  userId: string,
  type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET"
): Promise<{ plainCode: string; expiresAt: Date }> => {
  // 1. Invalidate previous unused challenges of this type for this user
  await prisma.verificationChallenge.updateMany({
    where: {
      userId,
      type,
      isUsed: false
    },
    data: {
      isUsed: true
    }
  });

  // 2. Generate code/token and expiration
  const isNumericCode = type === "EMAIL_VERIFICATION" || type === "PHONE_VERIFICATION";
  const plainCode = isNumericCode ? generateNumericCode(6) : generateSecureToken(32);
  const tokenHash = hashToken(plainCode);

  const durationMs = isNumericCode
    ? 10 * 60 * 1000 // 10 minutes for email / phone OTP
    : 60 * 60 * 1000; // 1 hour for password reset

  const expiresAt = new Date(Date.now() + durationMs);

  // 3. Store hashed challenge in database
  await prisma.verificationChallenge.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt,
      maxAttempts: 5
    }
  });

  return { plainCode, expiresAt };
};

export const registerUser = async (
  data: RegisterInput
): Promise<{ user: SafeUser; initialEmailCode?: string }> => {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedPhone = data.phone.trim();

  // Preliminary check for fast feedback
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { phone: normalizedPhone }
      ]
    }
  });

  if (existingUser) {
    const field = existingUser.email === normalizedEmail ? "email" : "phone";
    throw new Error(`User with this ${field} already exists`);
  }

  const passwordHash = await hashPassword(data.password);

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: data.role
      }
    });

    // Create initial email verification challenge
    const { plainCode } = await createVerificationChallenge(user.id, "EMAIL_VERIFICATION");

    return {
      user: toSafeUser(user),
      initialEmailCode: plainCode
    };
  } catch (error: any) {
    if (error && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : "email or phone";
      throw new Error(`User with this ${target} already exists`);
    }
    throw error;
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<SafeUser> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Please contact support.");
  }

  const isValidPassword = await verifyPassword(
    user.passwordHash,
    password
  );

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  return toSafeUser(user);
};

export const getUserById = async (id: string): Promise<SafeUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return null;
  }

  return toSafeUser(user);
};

export const verifyEmail = async (
  userId: string,
  code: string
): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User account not found");
  }

  if (user.emailVerified) {
    return toSafeUser(user);
  }

  const challenge = await prisma.verificationChallenge.findFirst({
    where: {
      userId,
      type: "EMAIL_VERIFICATION",
      isUsed: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!challenge) {
    throw new Error("No active verification challenge found. Please request a new code.");
  }

  if (new Date() > challenge.expiresAt) {
    throw new Error("Verification code has expired. Please request a new code.");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new Error("Maximum verification attempts exceeded. Please request a new code.");
  }

  // Increment attempts
  await prisma.verificationChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } }
  });

  const expectedHash = hashToken(code.trim());
  if (challenge.tokenHash !== expectedHash) {
    const remaining = challenge.maxAttempts - (challenge.attempts + 1);
    throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`);
  }

  // Mark challenge as used and verify user email
  const [_, updatedUser] = await prisma.$transaction([
    prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { isUsed: true }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    })
  ]);

  return toSafeUser(updatedUser);
};

export const verifyPhone = async (
  userId: string,
  code: string
): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User account not found");
  }

  if (user.phoneVerified) {
    return toSafeUser(user);
  }

  const challenge = await prisma.verificationChallenge.findFirst({
    where: {
      userId,
      type: "PHONE_VERIFICATION",
      isUsed: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!challenge) {
    throw new Error("No active verification challenge found. Please request a new code.");
  }

  if (new Date() > challenge.expiresAt) {
    throw new Error("Verification code has expired. Please request a new code.");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new Error("Maximum verification attempts exceeded. Please request a new code.");
  }

  // Increment attempts
  await prisma.verificationChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } }
  });

  const expectedHash = hashToken(code.trim());
  if (challenge.tokenHash !== expectedHash) {
    const remaining = challenge.maxAttempts - (challenge.attempts + 1);
    throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`);
  }

  // Mark challenge as used and verify user phone
  const [_, updatedUser] = await prisma.$transaction([
    prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { isUsed: true }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true }
    })
  ]);

  return toSafeUser(updatedUser);
};

export const resendVerification = async (
  userId: string,
  type: "EMAIL" | "PHONE"
): Promise<{ plainCode: string; expiresAt: Date }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User account not found");
  }

  if (type === "EMAIL" && user.emailVerified) {
    throw new Error("Email is already verified");
  }

  if (type === "PHONE" && user.phoneVerified) {
    throw new Error("Phone number is already verified");
  }

  const challengeType = type === "EMAIL" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";

  // Check rate limit throttle: minimum 60 seconds between resends
  const recentChallenge = await prisma.verificationChallenge.findFirst({
    where: {
      userId,
      type: challengeType,
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000)
      }
    }
  });

  if (recentChallenge) {
    const waitSeconds = Math.ceil(
      (60 * 1000 - (Date.now() - recentChallenge.createdAt.getTime())) / 1000
    );
    throw new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
  }

  return createVerificationChallenge(userId, challengeType);
};

export const forgotPassword = async (
  email: string
): Promise<{ plainToken?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  // Generic success to prevent user enumeration
  if (!user || !user.isActive) {
    return {};
  }

  // Throttle password reset requests to 1 per 60 seconds
  const recentChallenge = await prisma.verificationChallenge.findFirst({
    where: {
      userId: user.id,
      type: "PASSWORD_RESET",
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000)
      }
    }
  });

  if (recentChallenge) {
    return {};
  }

  const { plainCode } = await createVerificationChallenge(user.id, "PASSWORD_RESET");
  return { plainToken: plainCode };
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const expectedHash = hashToken(token.trim());

  const challenge = await prisma.verificationChallenge.findFirst({
    where: {
      tokenHash: expectedHash,
      type: "PASSWORD_RESET",
      isUsed: false
    }
  });

  if (!challenge) {
    throw new Error("Password reset token is invalid or has already been used");
  }

  if (new Date() > challenge.expiresAt) {
    throw new Error("Password reset token has expired. Please request a new one.");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new Error("Maximum reset attempts exceeded. Please request a new link.");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { isUsed: true }
    }),
    prisma.user.update({
      where: { id: challenge.userId },
      data: { passwordHash }
    })
  ]);
};

export const deactivateUser = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  // Invalidate any open verification challenges
  await prisma.verificationChallenge.updateMany({
    where: { userId, isUsed: false },
    data: { isUsed: true }
  });

  return toSafeUser(user);
};