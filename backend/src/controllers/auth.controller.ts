import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import type { LoginInput } from "../types/auth.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    res.status(401).json({
      success: false,
      message
    });
  }
};