import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        capacity: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        availability: {
            type: String,
            enum: ["Available", "Unavailable"],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Venue", venueSchema);