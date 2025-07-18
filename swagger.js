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
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Make sure your Swagger comments live here
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
