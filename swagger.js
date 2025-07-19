const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FairFund API",
      version: "1.0.0",
      description: "API documentation for FairFund - Group Expense Sharing App",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },      
	  {
        url: `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`, // Or '/api' if all your endpoints are prefixed
        description: "Deployed Production Server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["member", "admin"] },
            balance: { type: "number" },
          },
        },
        BudgetPlan: {
          type: "object",
          properties: {
            category: { type: "string" },
            limit: { type: "number" },
          },
        },
        Group: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            budget: { type: "number" },
            createdBy: { $ref: "#/components/schemas/User" },
            members: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            budgetPlans: {
              type: "array",
              items: { $ref: "#/components/schemas/BudgetPlan" },
            },
          },
        },
        Split: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            amount: { type: "number" },
          },
        },
        Expense: {
          type: "object",
          properties: {
            _id: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            paidBy: { $ref: "#/components/schemas/User" },
            group: { $ref: "#/components/schemas/Group" },
            category: { type: "string" },
            date: { type: "string", format: "date" },
            isRecurring: { type: "boolean" },
            splitType: {
              type: "string",
              enum: ["equal", "percentage", "custom"],
            },
            splits: {
              type: "array",
              items: { $ref: "#/components/schemas/Split" },
            },
          },
        },
        Settlement: {
          type: "object",
          properties: {
            _id: { type: "string" },
            from: { $ref: "#/components/schemas/User" },
            to: { $ref: "#/components/schemas/User" },
            group: { $ref: "#/components/schemas/Group" },
            amount: { type: "number" },
            date: { type: "string", format: "date" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "The unique ID of the comment.",
              example: "60f5cbb24f1a2b001c8e4b21",
            },
            expense: {
              type: "string",
              description: "The ID of the associated expense.",
              example: "60f5cbb24f1a2b001c8e4b10",
            },
            user: {
              type: "object",
              properties: {
                _id: { type: "string", example: "60f5cbb24f1a2b001c8e4aaa" },
                name: { type: "string", example: "Jane Doe" },
                email: { type: "string", example: "jane@example.com" },
              },
              description: "The user who made the comment.",
            },
            message: {
              type: "string",
              description: "The content of the comment.",
              example: "This looks good to me.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-06-11T10:20:30.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-06-11T10:30:00.000Z",
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
