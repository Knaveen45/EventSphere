import express from "express";
import Attendee from "../models/Attendee.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

/* =========================
   CREATE / REGISTER ATTENDEE
========================= */
router.post("/", async (req, res) => {
    try {
        const {
            registrationId,
            name,
            email,
            phone,
            college,
            department,
            event
        } = req.body;

        // Check required fields
        if (
            !registrationId ||
            !name ||
            !email ||
            !phone ||
            !college ||
            !department ||
            !event
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        // Check duplicate registration ID
        const existingAttendee = await Attendee.findOne({
            registrationId
        });

        if (existingAttendee) {
            return res.status(400).json({
                message: "Registration ID already exists."
            });
        }

        // Create attendee
        const attendee = await Attendee.create({
            registrationId,
            name,
            email,
            phone,
            college,
            department,
            event,
            attendanceStatus: "Registered"
        });

        // Return created attendee
        const populatedAttendee = await Attendee.findById(
            attendee._id
        ).populate("event", "name");

        res.status(201).json({
            message: "Participant registered successfully.",
            attendee: populatedAttendee
        });

    } catch (error) {
        console.error("Registration error:", error);

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Registration ID already exists."
            });
        }

        res.status(500).json({
            message: "Unable to register participant.",
            error: error.message
        });
    }
});


/* =========================
   GET ALL ATTENDEES
========================= */
router.get("/", async (req, res) => {
    try {
        const attendees = await Attendee.find()
            .populate("event", "name")
            .populate("ticket", "ticketId")
            .sort({ createdAt: -1 });

        res.json(attendees);

    } catch (error) {
        console.error("Fetch attendees error:", error);

        res.status(500).json({
            message: "Unable to fetch attendees."
        });
    }
});


/* =========================
   GET SINGLE ATTENDEE
========================= */
router.get("/:id", async (req, res) => {
    try {
        const attendee = await Attendee.findById(req.params.id)
            .populate("event", "name")
            .populate("ticket", "ticketId");

        if (!attendee) {
            return res.status(404).json({
                message: "Attendee not found."
            });
        }

        res.json(attendee);

    } catch (error) {
        console.error("Fetch attendee error:", error);

        res.status(500).json({
            message: "Unable to fetch attendee."
        });
    }
});


/* =========================
   CHECK IN USING TICKET ID
========================= */
router.put("/check-in/:ticketId", async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Invalid ticket."
            });
        }

        const attendee = await Attendee.findById(ticket.attendee);

        if (!attendee) {
            return res.status(404).json({
                message: "Attendee not found."
            });
        }

        if (attendee.attendanceStatus === "Checked In") {
            return res.status(400).json({
                message: "Participant is already checked in."
            });
        }

        attendee.attendanceStatus = "Checked In";

        await attendee.save();

        res.json({
            message: "Attendance marked successfully.",
            attendee
        });

    } catch (error) {
        console.error("Check-in error:", error);

        res.status(500).json({
            message: "Unable to mark attendance.",
            error: error.message
        });
    }
});


export default router;