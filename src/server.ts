import { app } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./config/db";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  });