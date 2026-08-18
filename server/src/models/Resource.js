import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: [
                "Available",
                "Low Stock",
                "Unavailable"
            ],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Resource", resourceSchema);