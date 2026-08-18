import { z } from "zod";
import { TaskStatus, TaskPriority } from "../../entities/Task";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(TaskPriority).optional(),
    dueDate: z.coerce.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const taskParamsSchema = z.object({
  projectId: z.uuid(),
  id: z.uuid().optional(),
});

export const taskQuerySchema = z.object({
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
});