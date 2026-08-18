export const swaggerSpec = {
  openapi: "3.0.3",

  info: {
    title: "Project & Task Management API",
    version: "1.0.0",
    description:
      "RESTful API for managing projects and their tasks, with JWT authentication. " +
      "All endpoints except /auth/register and /auth/login require a Bearer token.",
  },

  servers: [
    { url: "http://localhost:3000/api/v1", description: "Local development" },
  ],

  tags: [
    { name: "Auth", description: "Registration and login" },
    { name: "Projects", description: "Project management" },
    { name: "Tasks", description: "Tasks scoped to a project" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Alice Johnson" },
          email: { type: "string", format: "email", example: "alice@example.com" },
        },
      },

      Project: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "API Redesign" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "completed", "archived"] },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Implement authentication" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          projectId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },

    responses: {
      Unauthorized: {
        description: "Missing, malformed, or expired token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource does not exist or does not belong to the caller",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      ValidationError: {
        description: "Request body, params, or query failed validation",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 100, example: "Alice Johnson" },
                  email: { type: "string", format: "email", example: "alice@example.com" },
                  password: { type: "string", minLength: 8, maxLength: 72, example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created; returns the user and a JWT",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "alice@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated; returns the user and a JWT",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List all projects owned by the authenticated user",
        responses: {
          "200": {
            description: "Array of projects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    results: { type: "integer", example: 2 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Project" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },

      post: {
        tags: ["Projects"],
        summary: "Create a project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 150, example: "API Redesign" },
                  description: { type: "string", nullable: true, maxLength: 2000 },
                  status: {
                    type: "string",
                    enum: ["active", "completed", "archived"],
                    default: "active",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/projects/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
      ],

      get: {
        tags: ["Projects"],
        summary: "Get a single project by ID",
        responses: {
          "200": {
            description: "The project",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      patch: {
        tags: ["Projects"],
        summary: "Update a project",
        description: "Partial update — send only the fields you want to change.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 150 },
                  description: { type: "string", nullable: true, maxLength: 2000 },
                  status: { type: "string", enum: ["active", "completed", "archived"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated project",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      delete: {
        tags: ["Projects"],
        summary: "Delete a project and all of its tasks",
        responses: {
          "204": { description: "Deleted; no content returned" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/projects/{projectId}/tasks": {
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID of the parent project",
        },
      ],

      get: {
        tags: ["Tasks"],
        summary: "List tasks for a project",
        description:
          "Returns all tasks under the given project. Optionally filter by status, priority, or both.",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["pending", "in_progress", "done"] },
            description: "Filter by task status",
          },
          {
            name: "priority",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["low", "medium", "high"] },
            description: "Filter by task priority",
          },
        ],
        responses: {
          "200": {
            description: "Array of tasks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    results: { type: "integer", example: 3 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      post: {
        tags: ["Tasks"],
        summary: "Create a task under a project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: {
                    type: "string",
                    minLength: 1,
                    maxLength: 150,
                    example: "Implement authentication",
                  },
                  description: { type: "string", nullable: true, maxLength: 2000 },
                  status: {
                    type: "string",
                    enum: ["pending", "in_progress", "done"],
                    default: "pending",
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    default: "medium",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                    example: "2026-09-10T17:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/projects/{projectId}/tasks/{id}": {
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID of the parent project",
        },
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Task ID",
        },
      ],

      get: {
        tags: ["Tasks"],
        summary: "Get a single task by ID",
        responses: {
          "200": {
            description: "The task",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        description:
          "Partial update — send only the fields you want to change, including status transitions.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 150 },
                  description: { type: "string", nullable: true, maxLength: 2000 },
                  status: { type: "string", enum: ["pending", "in_progress", "done"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dueDate: { type: "string", format: "date-time", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated task",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        responses: {
          "204": { description: "Deleted; no content returned" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
};