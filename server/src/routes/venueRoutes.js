import express from "express";
import Venue from "../models/Venue.js";

const router = express.Router();

// GET ALL VENUES
router.get("/", async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// CREATE VENUE
router.post("/", async (req, res) => {
    try {
        const venue = await Venue.create(req.body);

        res.status(201).json(venue);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// UPDATE VENUE
router.put("/:id", async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        res.json(venue);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE VENUE
router.delete("/:id", async (req, res) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id);

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        res.json({
            message: "Venue deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;