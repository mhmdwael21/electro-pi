import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
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

// Feature routes
app.use("/api/v1/auth", authRouter);

// Error handling — must stay last
app.use(notFoundHandler);
app.use(errorHandler);