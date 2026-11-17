import type { Request, Response } from "express";
import {
  searchActors,
  searchProjects,
  searchRoles,
  getSearchFilterMetadata
} from "../services/search.service.js";

export const searchActorsHandler = async (req: Request, res: Response) => {
  try {
    const filters = (req as any).validatedQuery || req.query;
    const result = await searchActors(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search actors"
    });
  }
};

export const searchProjectsHandler = async (req: Request, res: Response) => {
  try {
    const filters = (req as any).validatedQuery || req.query;
    const result = await searchProjects(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search projects"
    });
  }
};

export const searchRolesHandler = async (req: Request, res: Response) => {
  try {
    const filters = (req as any).validatedQuery || req.query;
    const result = await searchRoles(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search casting roles"
    });
  }
};

export const getSearchFilterMetadataHandler = async (_req: Request, res: Response) => {
  try {
    const metadata = getSearchFilterMetadata();

    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch filter metadata"
    });
  }
};
