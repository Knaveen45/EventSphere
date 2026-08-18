import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            required: true,
            unique: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        attendee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attendee",
            required: true
        },

        qrCode: {
            type: String,
            required: true
        },

        issueDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Ticket", ticketSchema);