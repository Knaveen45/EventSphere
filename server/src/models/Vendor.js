import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
    {
        vendorId: {
            type: String,
            required: true,
            unique: true
        },

        vendorName: {
            type: String,
            required: true,
            trim: true
        },

        serviceType: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true
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

export default mongoose.model("Vendor", vendorSchema);