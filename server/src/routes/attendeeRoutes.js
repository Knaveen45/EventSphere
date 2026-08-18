import express from "express";
import QRCode from "qrcode";

import Attendee from "../models/Attendee.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

const router = express.Router();

// REGISTER ATTENDEE
router.post("/", async (req, res) => {
    try {
        const {
            registrationId,
            name,
            email,
            phone,
            college,
            department,
            event,
            eventId
        } = req.body;

        // Support both event and eventId
        const selectedEventId = event || eventId;

        console.log("Registration request:", {
            registrationId,
            name,
            email,
            phone,
            college,
            department,
            selectedEventId
        });

        // Check required fields
        if (
            !registrationId ||
            !name ||
            !email ||
            !phone ||
            !college ||
            !department ||
            !selectedEventId
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        // Check event
        const eventData = await Event.findById(selectedEventId);

        if (!eventData) {
            return res.status(404).json({
                message: "Event not found."
            });
        }

        // Check duplicate registration
        const existing = await Attendee.findOne({
            email: email.toLowerCase(),
            event: selectedEventId
        });

        if (existing) {
            return res.status(400).json({
                message: "This participant is already registered for this event."
            });
        }

        // Create attendee
        const attendee = await Attendee.create({
            registrationId,
            name,
            email: email.toLowerCase(),
            phone,
            college,
            department,
            event: selectedEventId,
            attendanceStatus: "Registered"
        });

        // Generate unique ticket ID
        const count = await Ticket.countDocuments();
        const ticketId = `TKT${1001 + count}`;

        // QR data
        const qrData = JSON.stringify({
            ticketId,
            registrationId,
            attendeeId: attendee._id.toString(),
            eventId: selectedEventId
        });

        // Generate QR
        const qrCode = await QRCode.toDataURL(qrData);

        // Create ticket
        const ticket = await Ticket.create({
            ticketId,
            event: selectedEventId,
            attendee: attendee._id,
            qrCode
        });

        // Connect ticket to attendee
        attendee.ticket = ticket._id;
        await attendee.save();

        // Return success
        const populatedAttendee = await Attendee.findById(attendee._id)
            .populate("event", "name date time venue")
            .populate("ticket");

        res.status(201).json({
            message: "Registration successful.",
            attendee: populatedAttendee,
            ticket
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed.",
            error: error.message
        });
    }
});

// GET ALL ATTENDEES
router.get("/", async (req, res) => {
    try {
        const attendees = await Attendee.find()
            .populate("event", "name date time venue")
            .populate("ticket");

        res.json(attendees);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch attendees."
        });
    }
});

// GET ATTENDEE BY ID
router.get("/:id", async (req, res) => {
    try {
        const attendee = await Attendee.findById(req.params.id)
            .populate("event")
            .populate("ticket");

        if (!attendee) {
            return res.status(404).json({
                message: "Attendee not found."
            });
        }

        res.json(attendee);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch attendee."
        });
    }
});

// DELETE REGISTRATION
router.delete("/:id", async (req, res) => {
    try {
        const attendee = await Attendee.findById(req.params.id);

        if (!attendee) {
            return res.status(404).json({
                message: "Attendee not found."
            });
        }

        if (attendee.ticket) {
            await Ticket.findByIdAndDelete(attendee.ticket);
        }

        await attendee.deleteOne();

        res.json({
            message: "Registration deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to delete registration."
        });
    }
});

export default router;