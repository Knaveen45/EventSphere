import express from "express";
import Event from "../models/Event.js";
import Venue from "../models/Venue.js";

const router = express.Router();

// GET ALL EVENTS
router.get("/", async (req, res) => {
    try {
        const events = await Event.find()
            .populate("venue")
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET ONE EVENT
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("venue")
            .populate("resources.resource");

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE EVENT
router.post("/", async (req, res) => {
    try {
        const {
            name,
            type,
            date,
            time,
            budget,
            status,
            venue
        } = req.body;

        if (venue) {
            const selectedVenue = await Venue.findById(venue);

            if (!selectedVenue) {
                return res.status(404).json({
                    message: "Venue not found"
                });
            }

            if (selectedVenue.availability !== "Available") {
                return res.status(400).json({
                    message: "Venue is unavailable"
                });
            }

            // Venue conflict detection
            const conflict = await Event.findOne({
                venue,
                date,
                time
            });

            if (conflict) {
                return res.status(409).json({
                    message:
                        "Scheduling Conflict! This venue is already booked at this date and time."
                });
            }
        }

        const event = await Event.create({
            name,
            type,
            date,
            time,
            budget,
            status,
            venue: venue || null
        });

        res.status(201).json(event);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// UPDATE EVENT
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            type,
            date,
            time,
            budget,
            status,
            venue
        } = req.body;

        if (venue) {
            const conflict = await Event.findOne({
                venue,
                date,
                time,
                _id: { $ne: req.params.id }
            });

            if (conflict) {
                return res.status(409).json({
                    message:
                        "Scheduling Conflict! This venue is already booked."
                });
            }
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            {
                name,
                type,
                date,
                time,
                budget,
                status,
                venue: venue || null
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(event);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE EVENT
router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;