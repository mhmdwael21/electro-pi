import { z } from "zod";
import { ProjectStatus } from "../../entities/Project";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const projectIdSchema = z.object({
  id: z.string().uuid(),
});