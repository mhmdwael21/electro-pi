import { Request, Response } from "express";
import * as projectService from "./project.service";

export const createProject = async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.user!.id, req.body);

  res.status(201).json({
    status: "success",
    data: project,
  });
};

export const getProjects = async (req: Request, res: Response) => {
  const projects = await projectService.getProjects(req.user!.id);

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: projects,
  });
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const project = await projectService.getProjectById(req.user!.id, id);

  res.status(200).json({
    status: "success",
    data: project,
  });
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const project = await projectService.updateProject(
    req.user!.id,
    id,
    req.body
  );

  res.status(200).json({
    status: "success",
    data: project,
  });
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await projectService.deleteProject(req.user!.id, id);

  res.status(204).send();
};