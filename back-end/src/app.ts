import express, { Application } from "express"
import cors from "cors"
import { errorHandler } from "./middlewares";
import routes from "./routes"

const app: Application = express();

// Global middleware
app.use(express.json());
app.use(cors());
app.use("/", routes);
app.use(errorHandler);

// Routes
app.get("/", (req, res) => {
    res.send("Server is running");
});

export default app;
