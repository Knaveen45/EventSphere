import express from "express";

import VendorAssignment from "../models/VendorAssignment.js";
import Vendor from "../models/Vendor.js";
import Event from "../models/Event.js";

const router = express.Router();


// =====================================================
// ASSIGN VENDOR TO EVENT
// =====================================================
router.post("/", async (req, res) => {
    try {
        const {
            assignmentId,
            eventId,
            vendorId,
            service
        } = req.body;

        // Required fields
        if (
            !assignmentId ||
            !eventId ||
            !vendorId ||
            !service
        ) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        // Check event
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found."
            });
        }

        // Check vendor
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        // Check vendor availability
        if (vendor.availability === "Unavailable") {
            return res.status(400).json({
                message: "Vendor is currently unavailable."
            });
        }

        // Check duplicate assignment
        const existing = await VendorAssignment.findOne({
            event: eventId,
            vendor: vendorId
        });

        if (existing) {
            return res.status(400).json({
                message: "Vendor is already assigned to this event."
            });
        }

        // Create assignment
        const assignment = await VendorAssignment.create({
            assignmentId,
            event: eventId,
            vendor: vendorId,
            service,
            status: "Assigned"
        });

        // Return populated assignment
        const populatedAssignment =
            await VendorAssignment.findById(assignment._id)
                .populate("event", "name date time")
                .populate(
                    "vendor",
                    "vendorId vendorName serviceType phone email availability"
                );

        res.status(201).json({
            message: "Vendor assigned successfully.",
            assignment: populatedAssignment
        });

    } catch (error) {
        console.error("ASSIGN VENDOR ERROR:", error);

        res.status(500).json({
            message: "Unable to assign vendor.",
            error: error.message
        });
    }
});


// =====================================================
// GET ALL ASSIGNMENTS
// =====================================================
router.get("/", async (req, res) => {
    try {
        const assignments =
            await VendorAssignment.find()
                .populate("event", "name date time")
                .populate(
                    "vendor",
                    "vendorId vendorName serviceType phone email availability"
                )
                .sort({ createdAt: -1 });

        res.json(assignments);

    } catch (error) {
        console.error("GET ASSIGNMENTS ERROR:", error);

        res.status(500).json({
            message: "Unable to fetch vendor assignments."
        });
    }
});


// =====================================================
// GET ASSIGNMENTS FOR ONE EVENT
// =====================================================
router.get("/event/:eventId", async (req, res) => {
    try {
        const assignments =
            await VendorAssignment.find({
                event: req.params.eventId
            })
                .populate(
                    "vendor",
                    "vendorId vendorName serviceType phone email availability"
                )
                .populate(
                    "event",
                    "name date time"
                );

        res.json(assignments);

    } catch (error) {
        console.error(
            "GET EVENT ASSIGNMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Unable to fetch assignments."
        });
    }
});


// =====================================================
// UPDATE ASSIGNMENT STATUS
// =====================================================
router.put("/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (
            ![
                "Assigned",
                "Completed",
                "Cancelled"
            ].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid assignment status."
            });
        }

        const assignment =
            await VendorAssignment.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            )
                .populate("event", "name")
                .populate(
                    "vendor",
                    "vendorId vendorName serviceType"
                );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found."
            });
        }

        res.json({
            message: "Assignment updated successfully.",
            assignment
        });

    } catch (error) {
        console.error(
            "UPDATE ASSIGNMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Unable to update assignment."
        });
    }
});


// =====================================================
// DELETE ASSIGNMENT
// =====================================================
router.delete("/:id", async (req, res) => {
    try {
        const assignment =
            await VendorAssignment.findByIdAndDelete(
                req.params.id
            );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found."
            });
        }

        res.json({
            message: "Vendor assignment removed."
        });

    } catch (error) {
        console.error(
            "DELETE ASSIGNMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Unable to remove assignment."
        });
    }
});


export default router;