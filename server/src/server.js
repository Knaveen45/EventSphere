import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import attendeeRoutes from "./routes/attendeeRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import vendorAssignmentRoutes from "./routes/vendorAssignmentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "EventSphere API is running successfully"
    });
});

app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/vendor-assignments", vendorAssignmentRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(
                `EventSphere server running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });