import { AppDataSource } from "../../config/db";
import { Task, TaskStatus, TaskPriority } from "../../entities/Task";
import { AppError } from "../../utils/AppError";
import { getProjectById } from "../projects/project.service";

const taskRepository = AppDataSource.getRepository(Task);

interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const parseFilters = (query: unknown): TaskFilters => {
  const { status, priority } = query as TaskFilters;

  return { status, priority };
};

export const createTask = async (
  userId: string,
  projectId: string,
  input: CreateTaskInput
) => {
  await getProjectById(userId, projectId);

  const task = taskRepository.create({
    ...input,
    projectId,
  });

  return taskRepository.save(task);
};

export const getTasks = async (
  userId: string,
  projectId: string,
  filters: TaskFilters
) => {
  await getProjectById(userId, projectId);

  return taskRepository.find({
    where: {
      projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
    },
    order: { createdAt: "DESC" },
  });
};

export const getTaskById = async (
  userId: string,
  projectId: string,
  taskId: string
) => {
  await getProjectById(userId, projectId);

  const task = await taskRepository.findOne({
    where: { id: taskId, projectId },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

export const updateTask = async (
  userId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
) => {
  const task = await getTaskById(userId, projectId, taskId);

  Object.assign(task, input);

  return taskRepository.save(task);
};

export const deleteTask = async (
  userId: string,
  projectId: string,
  taskId: string
) => {
  await getProjectById(userId, projectId);

  const result = await taskRepository.delete({ id: taskId, projectId });

  if (result.affected === 0) {
    throw new AppError("Task not found", 404);
  }
};