import mongoose from "mongoose";

const vendorAssignmentSchema = new mongoose.Schema(
    {
        assignmentId: {
            type: String,
            required: true,
            unique: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        service: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Assigned", "Completed", "Cancelled"],
            default: "Assigned"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "VendorAssignment",
    vendorAssignmentSchema
);