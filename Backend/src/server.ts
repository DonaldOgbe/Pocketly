import express from "express";
import dotenv from "dotenv";
import corsOptions from "./middleware/cors.middleware.js";


dotenv.config();

const app = express();
app.use(corsOptions);

const PORT = process.env.PORT || 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});