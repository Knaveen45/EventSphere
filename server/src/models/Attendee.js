import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
    {
        registrationId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true
        },

        college: {
            type: String,
            required: true
        },

        department: {
            type: String,
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket"
        },

        attendanceStatus: {
            type: String,
            enum: ["Registered", "Checked In", "Absent", "Cancelled"],
            default: "Registered"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Attendee", attendeeSchema);