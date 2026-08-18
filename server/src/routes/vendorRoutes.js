import express from "express";

import Vendor from "../models/Vendor.js";

const router = express.Router();

// CREATE VENDOR
router.post("/", async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);

        res.status(201).json({
            message: "Vendor added successfully.",
            vendor
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to add vendor.",
            error: error.message
        });
    }
});

// GET ALL VENDORS
router.get("/", async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({
            createdAt: -1
        });

        res.json(vendors);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch vendors."
        });
    }
});

// UPDATE VENDOR
router.put("/:id", async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        res.json({
            message: "Vendor updated successfully.",
            vendor
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to update vendor."
        });
    }
});

// DELETE VENDOR
router.delete("/:id", async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        res.json({
            message: "Vendor deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to delete vendor."
        });
    }
});

export default router;