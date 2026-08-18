import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

// GET ALL RESOURCES
router.get("/", async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// CREATE RESOURCE
router.post("/", async (req, res) => {
    try {
        const resource = await Resource.create(req.body);

        res.status(201).json(resource);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// UPDATE RESOURCE
router.put("/:id", async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json(resource);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE RESOURCE
router.delete("/:id", async (req, res) => {
    try {
        const resource =
            await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;