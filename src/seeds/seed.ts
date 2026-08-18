import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { Project, ProjectStatus } from "../entities/Project";
import { Task, TaskStatus, TaskPriority } from "../entities/Task";
import { hashPassword } from "../utils/password";

const seed = async () => {
  await AppDataSource.initialize();
  console.log("Database connected");

  const userRepository = AppDataSource.getRepository(User);
  const projectRepository = AppDataSource.getRepository(Project);
  const taskRepository = AppDataSource.getRepository(Task);

  // Clear existing data — tasks and projects cascade from users
  await userRepository.deleteAll();
  console.log("Cleared existing data");

  const [alice, bob] = await userRepository.save([
    userRepository.create({
      name: "Alice Johnson",
      email: "alice@example.com",
      password: await hashPassword("password123"),
    }),
    userRepository.create({
      name: "Bob Smith",
      email: "bob@example.com",
      password: await hashPassword("password123"),
    }),
  ]);

  console.log("Created 2 users");

  const aliceProjects = await projectRepository.save([
    projectRepository.create({
      title: "API Redesign",
      description: "Rebuild the public API with versioning support",
      status: ProjectStatus.ACTIVE,
      userId: alice!.id,
    }),
    projectRepository.create({
      title: "Q3 Documentation",
      description: "Bring all service docs up to date",
      status: ProjectStatus.COMPLETED,
      userId: alice!.id,
    }),
  ]);

  await projectRepository.save(
    projectRepository.create({
      title: "Mobile App Launch",
      description: "Ship the iOS and Android clients",
      status: ProjectStatus.ACTIVE,
      userId: bob!.id,
    })
  );

  console.log("Created 3 projects");

  await taskRepository.save([
    taskRepository.create({
      title: "Design the resource schema",
      description: "Define entities and their relationships",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date("2026-09-01"),
      projectId: aliceProjects[0]!.id,
    }),
    taskRepository.create({
      title: "Implement authentication",
      description: "JWT-based auth with refresh tokens",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date("2026-09-10"),
      projectId: aliceProjects[0]!.id,
    }),
    taskRepository.create({
      title: "Write integration tests",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      projectId: aliceProjects[0]!.id,
    }),
    taskRepository.create({
      title: "Update the getting-started guide",
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      projectId: aliceProjects[1]!.id,
    }),
  ]);

  console.log("Created 4 tasks");

  await AppDataSource.destroy();
  console.log("Seeding complete");
};

seed().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});