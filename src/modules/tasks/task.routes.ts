import { Router } from "express";
import * as taskController from "./task.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  taskIdSchema,
  taskQuerySchema,
} from "./task.validation";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(validateParams(taskParamsSchema));

router
  .route("/")
  .get(validateQuery(taskQuerySchema), taskController.getTasks)
  .post(validate(createTaskSchema), taskController.createTask);

router
  .route("/:id")
  .all(validateParams(taskIdSchema))
  .get(taskController.getTaskById)
  .patch(validate(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

export { router as taskRouter };