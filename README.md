# 🎫 EventSphere

> A comprehensive event management platform designed to simplify event creation, participant registration, digital ticketing, QR-based check-in, attendance tracking, and vendor management.

## 📌 Overview

**EventSphere** is a modern event management system that brings the complete event lifecycle into a single platform.

The system helps organizers manage events, venues, resources, participants, digital tickets, attendance, and vendors efficiently. It also provides a structured workflow for participant registration, ticket generation, QR-based verification, and event check-in.

The platform is designed to reduce manual event-management work while providing a smooth and organized experience for both event organizers and participants.

---

## ✨ Key Features

### 📅 Event Management
- Create and manage events
- Maintain event details and information
- Organize events with associated venues and resources
- View event-specific information in one place

### 🏢 Venue Management
- Manage event venues
- Associate venues with events
- Maintain venue-related information for better event planning

### 📦 Resource Management
- Manage resources required for events
- Associate resources with specific events
- Improve event preparation and resource organization

### 👥 Participant Registration
- Register participants for events
- Maintain participant registration information
- Generate unique registration records
- Track participants associated with individual events

### 🎟️ Digital Ticketing
- Generate digital tickets after successful registration
- Assign unique ticket IDs
- Maintain ticket status
- Generate QR codes for digital ticket verification

### 📱 QR-Based Check-In
- Use QR codes for participant verification
- Simplify event entry and check-in
- Track participant attendance
- Reduce manual verification at event entrances

### 📊 Attendance Management
- Maintain attendance records
- Track participant check-in status
- Connect registration, ticketing, and attendance into a single workflow

### 🤝 Vendor Management
- Add and manage event vendors
- Maintain vendor information
- Associate vendors with events
- Organize vendor-related services

### 🔗 Vendor Assignments
- Assign vendors to specific events
- Manage services provided by vendors
- Track vendor assignments for individual events

---

## 🔄 Event Management Workflow

```text
                    ┌─────────────────┐
                    │  Create Event   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Venue & Resource│
                    │    Management   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Participant   │
                    │   Registration  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Digital Ticket  │
                    │   Generation    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   QR Code       │
                    │   Verification  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Event Check-In  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Attendance    │
                    │    Tracking     │
                    └─────────────────┘
Vendor Workflow

Event
  │
  ▼
Vendor
  │
  ▼
Service
  │
  ▼
Vendor Assignment


🏗️ System Architecture

┌───────────────────────────────┐
│          Frontend             │
│                               │
│  Events • Venues • Resources  │
│  Registration • Tickets       │
│  Attendance • Vendors         │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│           Backend             │
│                               │
│  Event Management             │
│  Registration Management      │
│  Ticket Management             │
│  Attendance Management        │
│  Vendor Management            │
│  Vendor Assignments           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          Database             │
│                               │
│ Events • Participants         │
│ Tickets • Attendance          │
│ Vendors • Assignments         │
└───────────────────────────────┘

📂 Project Structure

EventSphere/
│
├── client/
│   └── src/
│       ├── App.jsx
│       └── ...
│
├── server/
│   ├── routes/
│   ├── models/
│   └── ...
│
├── package.json
├── README.md
└── ...


🎫 Ticket & Attendance Flow

Participant Registration
          │
          ▼
    Registration ID
          │
          ▼
     Ticket Creation
          │
          ▼
      Ticket ID
          │
          ▼
      QR Generation
          │
          ▼
     QR Verification
          │
          ▼
       Check-In
          │
          ▼
      Attendance


