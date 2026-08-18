import express from "express";
import corsOptions from "./middleware/cors.middleware.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { PORT } from "./env.js";
import routes from "./routes.js";

const app = express();

app.use(corsOptions);
app.use(express.json());

app.use(routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
