import mongoose from "mongoose";
import 'dotenv/config'
import http from "http"
import app from "./app";

/* -------------------------------------
 * Database Connection
 * ------------------------------------- */
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if(!mongoURI) 
    {
        console.error("MONGO_URI is not defined in .env");
        process.exit(1);
    }

    try 
    {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected");
    } 
    catch(error) 
    {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

/* -------------------------------------
 * Start Server
 * ------------------------------------- */
let server: http.Server; // Will hold the server instance returned by app.listen()
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT;

    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
};

startServer();

/* -------------------------------------
 * Graceful Shutdown
 * ------------------------------------- */
const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);

    try {
        if(server)
        {
        console.log("Closing HTTP server...");
        await new Promise<void>((resolve) => server.close(() => resolve()));
        }

        console.log("Closing MongoDB connection...");
        await mongoose.connection.close();

        console.log("Shutdown complete.");
        process.exit(0);
    } 
    catch(err) 
    {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
};

/* -------------------------------------
 * Exit Handlers
 * ------------------------------------- */

// Unexpected errors
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
});

// OS signals (Ctrl+C, kill, docker stop)
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
