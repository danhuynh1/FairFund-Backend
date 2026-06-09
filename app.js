const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const setupSwagger = require("./swagger");
dotenv.config();
const app = express();

// CORS must be before everything else
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/settlements", require("./routes/settlementRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

app.get("/swagger", (req, res) => res.redirect("/swagger/"));
setupSwagger(app);

module.exports = app;
