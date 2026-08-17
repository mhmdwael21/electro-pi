import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,

  synchronize: false,
  logging: env.nodeEnv === "development",

  entities: [__dirname + "/../entities/*.{ts,js}"],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
});