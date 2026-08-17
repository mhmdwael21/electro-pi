import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "src/config/.env") });

const required = (key: string): string => {
  const value = process.env[key];
  if(!value){
    throw new Error(`Missing required environment variable ${key}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  db: {
    host: required("DB_HOST"),
    port: Number(required("DB_PORT")),
    username: required("DB_USERNAME"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
}