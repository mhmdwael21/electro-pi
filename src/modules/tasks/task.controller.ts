import { Request, Response } from "express";
import * as taskService from "./task.service";

export const createTask = async (req: Request, res: Response) => {
  const { projectId } = req.params as { projectId: string };

  const task = await taskService.createTask(req.user!.id, projectId, req.body);

  res.status(201).json({
    status: "success",
    data: task,
  });
};

export const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params as { projectId: string };

  const filters = taskService.parseFilters(req.query);

  const tasks = await taskService.getTasks(req.user!.id, projectId, filters);

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: tasks,
  });
};

export const getTaskById = async (req: Request, res: Response) => {
  const { projectId, id } = req.params as { projectId: string; id: string };

  const task = await taskService.getTaskById(req.user!.id, projectId, id);

  res.status(200).json({
    status: "success",
    data: task,
  });
};

export const updateTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params as { projectId: string; id: string };

  const task = await taskService.updateTask(
    req.user!.id,
    projectId,
    id,
    req.body
  );

  res.status(200).json({
    status: "success",
    data: task,
  });
};

export const deleteTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params as { projectId: string; id: string };

  await taskService.deleteTask(req.user!.id, projectId, id);

  res.status(204).send();
};