const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const summaryRoute = require("./routes/summary");
const flashcardsRoute = require('./routes/flashcards');
const app = express();
const quizRoute = require('./routes/quiz');

app.use(cors());
app.use(express.json());
app.use('/api/flashcards', flashcardsRoute);
app.use('/api/quiz', quizRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/summary", summaryRoute);

app.get("/", (req, res) => {
  res.send("AI Study Assistant API running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});