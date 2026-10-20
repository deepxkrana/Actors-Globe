import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import {
  createProject,
  addCastingRole,
  updateCastingRole,
  publishProject,
  closeProject,
  updateProject,
  getMyProjects,
  getPublicProjects,
  getProjectById
} from "../services/project.service.js";

export const createProjectHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const project = await createProject(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    const statusCode = message.includes("Upgrade required")
      ? 403
      : message.includes("not found")
      ? 404
      : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const addCastingRoleHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projectId = req.params.projectId as string;
    const role = await addCastingRole(req.user.userId, projectId, req.body);

    res.status(201).json({
      success: true,
      message: "Casting role added successfully",
      role
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add casting role";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const updateCastingRoleHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projectId = req.params.projectId as string;
    const roleId = req.params.roleId as string;
    const role = await updateCastingRole(req.user.userId, projectId, roleId, req.body);

    res.status(200).json({
      success: true,
      message: "Casting role updated successfully",
      role
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update casting role";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const publishProjectHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projectId = req.params.projectId as string;
    const project = await publishProject(req.user.userId, projectId);

    res.status(200).json({
      success: true,
      message: "Project published successfully",
      project
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish project";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const closeProjectHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projectId = req.params.projectId as string;
    const project = await closeProject(req.user.userId, projectId);

    res.status(200).json({
      success: true,
      message: "Project and casting roles closed successfully",
      project
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to close project";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const updateProjectHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projectId = req.params.projectId as string;
    const project = await updateProject(req.user.userId, projectId, req.body);

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update project";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getMyProjectsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const projects = await getMyProjects(req.user.userId);

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch projects";
    const statusCode = message.includes("not found") ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getPublicProjectsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getPublicProjects();

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch projects";
    res.status(500).json({
      success: false,
      message
    });
  }
};

export const getProjectByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const project = await getProjectById(projectId, req.user?.userId);

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found or is currently private"
      });
      return;
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch project";
    res.status(500).json({
      success: false,
      message
    });
  }
};

export const getRoleByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const role = await prisma.castingRole.findUnique({
      where: { id: roleId },
      include: {
        project: {
          include: {
            caster: {
              select: {
                id: true,
                displayName: true,
                bio: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      res.status(404).json({
        success: false,
        message: "Casting role not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch casting role";
    res.status(500).json({
      success: false,
      message
    });
  }
};

