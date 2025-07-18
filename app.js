const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const setupSwagger = require("./swagger");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/settlements", require("./routes/settlementRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use(
  cors({
    origin: process.env.FRONT_END_URL || "http://localhost:3000",
    credentials: true,
  })
);

setupSwagger(app);

module.exports = app;
