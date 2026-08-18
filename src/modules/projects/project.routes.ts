import { Router } from "express";
import * as projectController from "./project.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate, validateParams } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "./project.validation";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(projectController.getProjects)
  .post(validate(createProjectSchema), projectController.createProject);

router
  .route("/:id")
  .all(validateParams(projectIdSchema))
  .get(projectController.getProjectById)
  .patch(validate(updateProjectSchema), projectController.updateProject)
  .delete(projectController.deleteProject);

export { router as projectRouter };