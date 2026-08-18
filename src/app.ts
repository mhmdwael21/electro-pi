import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { authRouter } from "./modules/auth/auth.routes";
import { projectRouter } from "./modules/projects/project.routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";

export const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Feature routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

// Error handling 
app.use(notFoundHandler);
app.use(errorHandler);