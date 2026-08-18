import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: [
                "Planning",
                "Upcoming",
                "Completed",
                "Cancelled"
            ],
            default: "Planning"
        },
        venue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Venue",
            default: null
        },
        resources: [
            {
                resource: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Resource"
                },
                quantity: Number
            }
        ]
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Event", eventSchema);