import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { RegisterInput } from "../types/auth.js";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { phone: data.phone }
      ]
    }
  });

  if (existingUser) {
    throw new Error("User with this email or phone already exists");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role
    }
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(
    user.passwordHash,
    password
  );

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  return user;
};