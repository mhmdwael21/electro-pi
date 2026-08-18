import { AppDataSource } from "../../config/db";
import { Project, ProjectStatus } from "../../entities/Project";
import { AppError } from "../../utils/AppError";

const projectRepository = AppDataSource.getRepository(Project);

interface CreateProjectInput {
  title: string;
  description?: string | null;
  status?: ProjectStatus;
}

interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
}

export const createProject = async (
  userId: string,
  input: CreateProjectInput
) => {
  const project = projectRepository.create({
    ...input,
    userId,
  });

  return projectRepository.save(project);
};

export const getProjects = async (userId: string) => {
  return projectRepository.find({
    where: { userId },
    order: { createdAt: "DESC" },
  });
};

export const getProjectById = async (userId: string, projectId: string) => {
  const project = await projectRepository.findOne({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};

export const updateProject = async (
  userId: string,
  projectId: string,
  input: UpdateProjectInput
) => {
  const project = await getProjectById(userId, projectId);

  Object.assign(project, input);

  return projectRepository.save(project);
};

export const deleteProject = async (userId: string, projectId: string) => {
  const result = await projectRepository.delete({ id: projectId, userId });

  if (result.affected === 0) {
    throw new AppError("Project not found", 404);
  }
};