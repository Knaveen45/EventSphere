import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import {
  CalendarDays,
  MapPin,
  Package,
  LayoutDashboard,
  UserPlus,
  Ticket,
  ClipboardCheck,
  UserCog,
  Store,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  IndianRupee,
  Clock3,
  Sparkles,
  Camera
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [resources, setResources] = useState([]);
  const [attendees, setAttendees] = useState([]);
const [vendors, setVendors] = useState([]);
const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false);
const [selectedCheckInTicket, setSelectedCheckInTicket] = useState(null);

  const [assignmentForm, setAssignmentForm] = useState({
    eventId: "",
    vendorId: "",
    serviceType: ""
  });

const [showAttendeeForm, setShowAttendeeForm] = useState(false);
const [showVendorForm, setShowVendorForm] = useState(false);

const [attendeeForm, setAttendeeForm] = useState({
  registrationId: "",
  name: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  eventId: ""
});

const [vendorForm, setVendorForm] = useState({
  vendorId: "",
  vendorName: "",
  serviceType: "Catering",
  phone: "",
  email: "",
  availability: "Available"
});

const [generatedTicket, setGeneratedTicket] = useState(null);

  // QR SCANNER
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [scannerInstance, setScannerInstance] = useState(null);
  const [scannerBusy, setScannerBusy] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  const [message, setMessage] = useState("");

  const [eventForm, setEventForm] = useState({
    name: "",
    type: "Workshop",
    date: "",
    time: "",
    budget: "",
    status: "Planning",
    venue: ""
  });

  const [venueForm, setVenueForm] = useState({
    name: "",
    capacity: "",
    location: "",
    availability: "Available"
  });

  const [resourceForm, setResourceForm] = useState({
    name: "",
    quantity: "",
    status: "Available"
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get(`${API}/events`),
        axios.get(`${API}/venues`),
        axios.get(`${API}/resources`),
        axios.get(`${API}/attendees`),
        axios.get(`${API}/vendors`),
        axios.get(`${API}/attendance`),
        axios.get(`${API}/tickets`)
      ]);

      const getData = (result) => {
        if (result.status !== "fulfilled") return [];
        const data = result.value?.data;
        if (Array.isArray(data)) return data;
        return (
          data?.tickets ||
          data?.attendees ||
          data?.attendance ||
          data?.assignments ||
          []
        );
      };

      const loadedEvents = getData(results[0]);
      const loadedVenues = getData(results[1]);
      const loadedResources = getData(results[2]);
      const loadedAttendees = getData(results[3]);
      const loadedVendors = getData(results[4]);
      const loadedAttendance = getData(results[5]);
      const apiTickets = getData(results[6]);

      setEvents(loadedEvents);
      setVenues(loadedVenues);
      setResources(loadedResources);
      setAttendees(loadedAttendees);
      setVendors(loadedVendors);
      setAttendance(loadedAttendance);

      const ticketMap = new Map();

      const addTicket = (ticket, owner = {}) => {
        if (!ticket) return;

        const ticketId =
          ticket.ticketId ||
          ticket.id ||
          ticket._id;

        if (!ticketId) return;

        ticketMap.set(String(ticketId), {
          ...ticket,
          ticketId,
          registrationId:
            ticket.registrationId ||
            owner.registrationId ||
            "",
          name:
            ticket.name ||
            ticket.participantName ||
            owner.name ||
            "",
          email:
            ticket.email ||
            owner.email ||
            "",
          event:
            ticket.event ||
            owner.event ||
            null,
          eventName:
            ticket.eventName ||
            owner.event?.name ||
            owner.eventName ||
            ""
        });
      };

      apiTickets.forEach((ticket) => addTicket(ticket));
      loadedAttendees.forEach((attendee) =>
        addTicket(attendee.ticket, attendee)
      );
      loadedAttendance.forEach((record) =>
        addTicket(record.ticket, record)
      );

      setTickets(Array.from(ticketMap.values()));

      // The supplied backend exposes assignments per event.
      const assignmentResults = await Promise.allSettled(
        loadedEvents
          .filter((event) => event?._id)
          .map((event) =>
            axios.get(
              `${API}/vendor-assignments/event/${event._id}`
            )
          )
      );

      const assignmentMap = new Map();

      assignmentResults.forEach((result) => {
        if (result.status !== "fulfilled") return;

        const rows = Array.isArray(result.value?.data)
          ? result.value.data
          : result.value?.data?.assignments || [];

        rows.forEach((assignment) => {
          if (assignment?._id) {
            assignmentMap.set(
              String(assignment._id),
              assignment
            );
          }
        });
      });

      setAssignments(Array.from(assignmentMap.values()));
    } catch (error) {
      console.error("LOAD ALL ERROR:", error);
      notify("Unable to load data.");
    }
  };

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  // EVENT CRUD
  const saveEvent = async (e) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent._id}`, eventForm);
        notify("Event updated successfully.");
      } else {
        await axios.post(`${API}/events`, eventForm);
        notify("Event created successfully.");
      }

      closeForms();
      loadAll();
    } catch (error) {
      notify(error.response?.data?.message || "Unable to save event.");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await axios.delete(`${API}/events/${id}`);
      notify("Event deleted successfully.");
      loadAll();
    } catch {
      notify("Unable to delete event.");
    }
  };

  // VENUE CRUD
  const saveVenue = async (e) => {
    e.preventDefault();

    try {
      if (editingVenue) {
        await axios.put(`${API}/venues/${editingVenue._id}`, venueForm);
        notify("Venue updated successfully.");
      } else {
        await axios.post(`${API}/venues`, {
          ...venueForm,
          capacity: Number(venueForm.capacity)
        });
        notify("Venue added successfully.");
      }

      closeForms();
      loadAll();
    } catch (error) {
      notify(error.response?.data?.message || "Unable to save venue.");
    }
  };

  const deleteVenue = async (id) => {
    if (!window.confirm("Delete this venue?")) return;

    try {
      await axios.delete(`${API}/venues/${id}`);
      notify("Venue deleted successfully.");
      loadAll();
    } catch {
      notify("Unable to delete venue.");
    }
  };

  // RESOURCE CRUD
  const saveResource = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...resourceForm,
        quantity: Number(resourceForm.quantity)
      };

      if (editingResource) {
        await axios.put(`${API}/resources/${editingResource._id}`, data);
        notify("Resource updated successfully.");
      } else {
        await axios.post(`${API}/resources`, data);
        notify("Resource added successfully.");
      }

      closeForms();
      loadAll();
    } catch (error) {
      notify(error.response?.data?.message || "Unable to save resource.");
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await axios.delete(`${API}/resources/${id}`);
      notify("Resource deleted successfully.");
      loadAll();
    } catch {
      notify("Unable to delete resource.");
    }
  };
  // VENDOR CRUD
  const saveVendor = async (e) => {
    e.preventDefault();

    try {
      const data = {
        vendorId: vendorForm.vendorId.trim(),
        vendorName: vendorForm.vendorName.trim(),
        serviceType: vendorForm.serviceType,
        phone: vendorForm.phone.trim(),
        email: vendorForm.email.trim(),
        availability: vendorForm.availability
      };

      await axios.post(`${API}/vendors`, data);

      setShowVendorForm(false);

      setVendorForm({
        vendorId: "",
        vendorName: "",
        serviceType: "Catering",
        phone: "",
        email: "",
        availability: "Available"
      });

      await loadAll();
      notify("Vendor added successfully.");
    } catch (error) {
      console.error(
        "VENDOR ERROR:",
        error.response?.data || error
      );

      notify(
        error.response?.data?.message ||
        "Unable to add vendor."
      );
    }
  };

  const openAttendeeForm = () => {
  setAttendeeForm({
    registrationId: `REG${Date.now().toString().slice(-6)}`,
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    eventId: events.length > 0 ? events[0]._id : ""
  });

  setGeneratedTicket(null);
  setShowAttendeeForm(true);
};
  const registerAttendee = async (e) => {
  e.preventDefault();

  try {
    const data = {
      registrationId: attendeeForm.registrationId.trim(),
      name: attendeeForm.name.trim(),
      email: attendeeForm.email.trim(),
      phone: attendeeForm.phone.trim(),
      college: attendeeForm.college.trim(),
      department: attendeeForm.department.trim(),
      eventId: attendeeForm.eventId
    };

    console.log("REGISTRATION DATA:", data);

    const response = await axios.post(
      `${API}/attendees`,
      data
    );

    console.log("REGISTRATION SUCCESS:", response.data);

    setShowAttendeeForm(false);

    setAttendeeForm({
      registrationId: "",
      name: "",
      email: "",
      phone: "",
      college: "",
      department: "",
      eventId: ""
    });

    await loadAll();

    notify("Participant registered successfully!");

  } catch (error) {
    console.error(
      "REGISTRATION ERROR:",
      error.response?.data || error
    );

    notify(
      error.response?.data?.message ||
      "Unable to register participant."
    );
  }
};

  const checkInAttendee = async (item) => {
    const ticketId =
      typeof item === "string"
        ? item
        : item?.ticket?.ticketId ||
          item?.ticketId ||
          item?.ticket?.id;

    if (!ticketId) {
      notify("Ticket ID not found.");
      return;
    }

    const participantName =
      typeof item === "string"
        ? "this participant"
        : item?.name ||
          item?.ticket?.name ||
          "this participant";

    const confirmed = window.confirm(
      `Are you sure you want to check in ${participantName}?\n\nTicket ID: ${ticketId}`
    );

    if (!confirmed) return;

    try {
      const response = await axios.put(
        `${API}/attendance/check-in/${encodeURIComponent(ticketId)}`
      );

      notify(
        response.data?.message ||
        "Attendance marked successfully."
      );

      await loadAll();
    } catch (error) {
      console.error(
        "CHECK-IN ERROR:",
        error.response?.data || error
      );

      notify(
        error.response?.data?.message ||
        "Unable to mark attendance."
      );
    }
  };


  const stopQrScanner = async () => {
    try {
      if (scannerInstance) {
        await scannerInstance.stop();
        await scannerInstance.clear();
      }
    } catch (error) {
      console.error("QR SCANNER STOP ERROR:", error);
    }

    setScannerInstance(null);
    setScannerBusy(false);
    setShowQrScanner(false);
    setScannerMessage("");
  };

  const findAttendanceByTicketId = (ticketId) => {
    const normalizedId = String(ticketId || "").trim().toLowerCase();

    if (!normalizedId) return null;

    const attendanceRecord = attendance.find((item) => {
      const id =
        item?.ticket?.ticketId ||
        item?.ticketId ||
        item?.ticket?.id ||
        "";

      return String(id).trim().toLowerCase() === normalizedId;
    });

    if (attendanceRecord) return attendanceRecord;

    const ticket = tickets.find((item) => {
      const id = item?.ticketId || item?.ticketID || item?._id || "";
      return String(id).trim().toLowerCase() === normalizedId;
    });

    if (ticket) {
      return {
        ...ticket,
        ticketId: ticket.ticketId || ticket.ticketID || ticket._id,
        name: ticket.name || ticket.participantName || "Participant"
      };
    }

    return null;
  };

  const handleScannedQr = async (rawValue) => {
    if (scannerBusy) return;

    const scannedValue = String(rawValue || "").trim();
    if (!scannedValue) return;

    setScannerBusy(true);

    let ticketId = scannedValue;

    try {
      const parsed = JSON.parse(scannedValue);
      ticketId =
        parsed.ticketId ||
        parsed.ticketID ||
        parsed.ticket ||
        parsed.id ||
        scannedValue;
    } catch {
      // The QR contains a normal Ticket ID.
    }

    if (String(ticketId).includes("/")) {
      const parts = String(ticketId).split("/").filter(Boolean);
      ticketId = parts[parts.length - 1];
    }

    const record = findAttendanceByTicketId(ticketId);

    if (!record) {
      setScannerBusy(false);
      setScannerMessage(`Ticket "${ticketId}" was not found.`);
      return;
    }

    const currentStatus =
      record.attendanceStatus ||
      record.status ||
      record.ticket?.status ||
      "Registered";

    await stopQrScanner();

    if (currentStatus === "Checked In") {
      notify(`Ticket ${ticketId} is already checked in.`);
      return;
    }

    // Existing confirmation is shown BEFORE the attendance API is called.
    await checkInAttendee({
      ...record,
      ticketId:
        record?.ticket?.ticketId ||
        record?.ticketId ||
        record?.ticket?.id ||
        ticketId
    });
  };

  const startQrScanner = () => {
    setScannerMessage("");
    setScannerBusy(false);
    setShowQrScanner(true);
  };

  useEffect(() => {
    if (!showQrScanner) return;

    let cancelled = false;
    let reader = null;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setScannerMessage(
            "Camera access is not available. Please use localhost or HTTPS."
          );
          return;
        }

        reader = new Html5Qrcode("eventSphereQrReader");
        setScannerInstance(reader);

        await reader.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            if (cancelled || scannerBusy) return;
            await handleScannedQr(decodedText);
          },
          () => {
            // Ignore normal frame-by-frame QR detection failures.
          }
        );
      } catch (error) {
        console.error("QR SCANNER ERROR:", error);

        if (cancelled) return;

        if (error?.name === "NotAllowedError") {
          setScannerMessage(
            "Camera permission was denied. Allow camera access and try again."
          );
        } else if (error?.name === "NotFoundError") {
          setScannerMessage("No camera was found on this device.");
        } else {
          setScannerMessage(
            "Unable to start the QR scanner. Allow camera access and try again."
          );
        }

        try {
          if (reader) await reader.clear();
        } catch {
          // Scanner may already be stopped.
        }

        setScannerInstance(null);
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);

      if (reader) {
        reader
          .stop()
          .then(() => reader.clear())
          .catch(() => {});
      }
    };
  }, [showQrScanner]);

  const viewTicket = (ticket) => {
    if (!ticket) {
      notify("Ticket details not found.");
      return;
    }

    console.log("VIEWING TICKET:", ticket);
    setGeneratedTicket(ticket);
  };

  const findTicketForAttendee = (attendee) => {
    if (!attendee) return null;

    if (attendee.ticket) {
      return {
        ...attendee.ticket,
        registrationId:
          attendee.ticket.registrationId ||
          attendee.registrationId,
        name:
          attendee.ticket.name ||
          attendee.name,
        email:
          attendee.ticket.email ||
          attendee.email,
        event:
          attendee.ticket.event ||
          attendee.event
      };
    }

    return (
      tickets.find(
        (ticket) =>
          ticket.registrationId &&
          ticket.registrationId === attendee.registrationId
      ) || null
    );
  };


  // VENDOR ASSIGNMENT
  const openAssignmentForm = () => {
    setAssignmentForm({
      eventId: events.length > 0 ? events[0]._id : "",
      vendorId: "",
      serviceType:
        vendors.length > 0
          ? vendors[0].serviceType || ""
          : ""
    });

    setShowAssignmentForm(true);
  };

  const saveAssignment = async (e) => {
    e.preventDefault();

    if (
      !assignmentForm.eventId ||
      !assignmentForm.vendorId ||
      !assignmentForm.serviceType
    ) {
      notify("Please select event, vendor and service.");
      return;
    }

    try {
      const data = {
        assignmentId: `ASN${Date.now().toString().slice(-6)}`,
        eventId: assignmentForm.eventId,
        vendorId: assignmentForm.vendorId,
        service: assignmentForm.serviceType
      };

      console.log("ASSIGNMENT DATA:", data);

      const response = await axios.post(
        `${API}/vendor-assignments`,
        data
      );

      setShowAssignmentForm(false);
      setAssignmentForm({
        eventId: "",
        vendorId: "",
        serviceType: ""
      });

      await loadAll();

      notify(
        response.data?.message ||
        "Vendor assigned successfully."
      );
    } catch (error) {
      console.error(
        "VENDOR ASSIGNMENT ERROR:",
        error.response?.data || error
      );

      notify(
        error.response?.data?.message ||
        "Unable to assign vendor."
      );
    }
  };


  const editEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      budget: event.budget,
      status: event.status,
      venue: event.venue?._id || event.venue || ""
    });
    setShowEventForm(true);
  };

  const editVenue = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location,
      availability: venue.availability
    });
    setShowVenueForm(true);
  };

  const editResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      quantity: resource.quantity,
      status: resource.status
    });
    setShowResourceForm(true);
  };

  const closeForms = () => {
    setShowEventForm(false);
    setShowVenueForm(false);
    setShowResourceForm(false);
    setShowAttendeeForm(false);
    setShowVendorForm(false);
    setShowAssignmentForm(false);
    setGeneratedTicket(null);
    setEditingEvent(null);
    setEditingVenue(null);
    setEditingResource(null);

    setEventForm({
      name: "",
      type: "Workshop",
      date: "",
      time: "",
      budget: "",
      status: "Planning",
      venue: ""
    });

    setVenueForm({
      name: "",
      capacity: "",
      location: "",
      availability: "Available"
    });

    setResourceForm({
      name: "",
      quantity: "",
      status: "Available"
    });

    setVendorForm({
      vendorId: "",
      vendorName: "",
      serviceType: "Catering",
      phone: "",
      email: "",
      availability: "Available"
    });
  };

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>EventSphere</h1>
            <span>Event Intelligence</span>
          </div>
        </div>

        <nav>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={activeTab === "events" ? "active" : ""}
            onClick={() => setActiveTab("events")}
          >
            <CalendarDays size={19} />
            Events
          </button>

          <button
            className={activeTab === "venues" ? "active" : ""}
            onClick={() => setActiveTab("venues")}
          >
            <MapPin size={19} />
            Venues
          </button>

          <button
  className={activeTab === "resources" ? "active" : ""}
  onClick={() => setActiveTab("resources")}
>
  <Package size={19} />
  Resources
</button>

<button
  className={activeTab === "registrations" ? "active" : ""}
  onClick={() => setActiveTab("registrations")}
>
  <UserPlus size={19} />
  Registrations
</button>

<button
  className={activeTab === "attendance" ? "active" : ""}
  onClick={() => setActiveTab("attendance")}
>
  <ClipboardCheck size={19} />
  Attendance
</button>

<button
  className={activeTab === "vendors" ? "active" : ""}
  onClick={() => setActiveTab("vendors")}
>
  <Store size={19} />
  Vendors
</button>
<button
  className={activeTab === "assignments" ? "active" : ""}
  onClick={() => setActiveTab("assignments")}
>
  <UserCog size={19} />
  Vendor Assignments
</button>

<button
  className={activeTab === "tickets" ? "active" : ""}
  onClick={() => setActiveTab("tickets")}
>
  <Ticket size={19} />
  Tickets
</button>
        </nav>

        <div className="sidebar-bottom">
          <strong>Milestone 2</strong>
          <span>Event Management & Operations</span>
        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <p className="eyebrow">EVENT MANAGEMENT PLATFORM</p>
            <h2>
              {activeTab === "dashboard"
                ? "Operations Dashboard"
                : activeTab === "events"
                ? "Event Management"
                : activeTab === "venues"
                ? "Venue Management"
                : activeTab === "resources"
                ? "Resource Management"
                : activeTab === "registrations"
                ? "Participant Registration"
                : activeTab === "attendance"
                ? "Attendance Management"
                : activeTab === "vendors"
                ? "Vendor Management"
                : activeTab === "assignments"
                ? "Vendor Assignments"
                : activeTab === "tickets"
                ? "Ticket Management"
                : "EventSphere"}
            </h2>
          </div>

          <div className="top-status">
            <span className="status-dot"></span>
            System Online
          </div>
        </header>

        {message && (
          <div className="toast">
            {message}
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">EVENTSPHERE CONTROL CENTER</p>
                <h1>Plan smarter.<br />Deliver better events.</h1>
                <p>
                  Manage events, venues and resources from one
                  centralized platform.
                </p>
              </div>

              <div className="hero-shape">
                <CalendarDays size={90} />
              </div>
            </section>

            <section className="stats">
              <Stat
                icon={<CalendarDays />}
                label="Total Events"
                value={events.length}
              />

              <Stat
                icon={<MapPin />}
                label="Venues"
                value={venues.length}
              />

              <Stat
                icon={<Package />}
                label="Resources"
                value={resources.length}
              />

              <Stat
                icon={<IndianRupee />}
                label="Total Budget"
                value={`₹${events
                  .reduce((sum, e) => sum + Number(e.budget || 0), 0)
                  .toLocaleString("en-IN")}`}
              />
              <Stat
                icon={<Ticket />}
                label="Tickets"
                value={tickets.length}
              />
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p className="eyebrow">SCHEDULE</p>
                  <h3>Upcoming Events</h3>
                </div>

                <button
                  className="primary"
                  onClick={() => {
                    setActiveTab("events");
                    setShowEventForm(true);
                  }}
                >
                  <Plus size={18} />
                  Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <Empty text="No events created yet." />
              ) : (
                <div className="event-grid">
                  {events.slice(0, 6).map((event) => (
                    <div className="event-card" key={event._id}>
                      <div className="event-date">
                        <CalendarDays size={18} />
                        {event.date}
                      </div>

                      <h4>{event.name}</h4>

                      <p>{event.type}</p>

                      <div className="event-info">
                        <span>
                          <Clock3 size={15} />
                          {event.time}
                        </span>

                        <span>
                          <MapPin size={15} />
                          {event.venue?.name || "No venue"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <section className="content-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">CRUD MODULE</p>
                <h3>Events</h3>
              </div>

              <button
                className="primary"
                onClick={() => setShowEventForm(true)}
              >
                <Plus size={18} />
                New Event
              </button>
            </div>

            <DataTable
              headers={[
                "Event",
                "Type",
                "Date",
                "Time",
                "Venue",
                "Budget",
                "Status",
                "Actions"
              ]}
            >
              {events.map((event) => (
                <tr key={event._id}>
                  <td><strong>{event.name}</strong></td>
                  <td>{event.type}</td>
                  <td>{event.date}</td>
                  <td>{event.time}</td>
                  <td>{event.venue?.name || "—"}</td>
                  <td>₹{Number(event.budget).toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`badge ${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => editEvent(event)}>
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => deleteEvent(event._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        )}

        {/* VENUES */}
        {activeTab === "venues" && (
          <section className="content-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">CRUD MODULE</p>
                <h3>Venues</h3>
              </div>

              <button
                className="primary"
                onClick={() => setShowVenueForm(true)}
              >
                <Plus size={18} />
                Add Venue
              </button>
            </div>

            <DataTable
              headers={[
                "Venue",
                "Capacity",
                "Location",
                "Availability",
                "Actions"
              ]}
            >
              {venues.map((venue) => (
                <tr key={venue._id}>
                  <td><strong>{venue.name}</strong></td>
                  <td>
                    <span className="inline">
                      <Users size={15} />
                      {venue.capacity}
                    </span>
                  </td>
                  <td>{venue.location}</td>
                  <td>
                    <span className="badge available">
                      {venue.availability}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => editVenue(venue)}>
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => deleteVenue(venue._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        )}

        {/* RESOURCES */}
        {activeTab === "resources" && (
          <section className="content-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">CRUD MODULE</p>
                <h3>Resources</h3>
              </div>

              <button
                className="primary"
                onClick={() => setShowResourceForm(true)}
              >
                <Plus size={18} />
                Add Resource
              </button>
            </div>

            <DataTable
              headers={[
                "Resource",
                "Quantity",
                "Status",
                "Actions"
              ]}
            >
              {resources.map((resource) => (
                <tr key={resource._id}>
                  <td><strong>{resource.name}</strong></td>
                  <td>{resource.quantity}</td>
                  <td>
                    <span className="badge available">
                      {resource.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => editResource(resource)}>
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => deleteResource(resource._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        )}
        {activeTab === "registrations" && (
  <div className="content-card">

    <div className="section-title">
  <div>
    <p className="eyebrow">MILESTONE 2</p>
    <h3>Participant Registration</h3>
  </div>

  <button
    className="primary"
    onClick={openAttendeeForm}
  >
    <UserPlus size={17} />
    Register Participant
  </button>
</div>
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Registration ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>College</th>
            <th>Event</th>
            <th>Status</th>
            <th>Ticket</th>
          </tr>
        </thead>

        <tbody>
          {attendees.length === 0 ? (
            <tr>
              <td colSpan="7">
                <div className="empty">
                  No participants registered yet.
                </div>
              </td>
            </tr>
          ) : (
            attendees.map((attendee) => (
              <tr key={attendee._id}>
                <td>
                  <strong>{attendee.registrationId}</strong>
                </td>

                <td>{attendee.name}</td>
                <td>{attendee.email}</td>
                <td>{attendee.college}</td>

                <td>
                  {attendee.event?.name ||
                    attendee.event?.eventName ||
                    "Event"}
                </td>

                <td>
                  <span className="badge upcoming">
                    {attendee.attendanceStatus || "Registered"}
                  </span>
                </td>

                <td>
                  {findTicketForAttendee(attendee) ? (
                    <button
                      type="button"
                      className="primary"
                      onClick={() =>
                        viewTicket(findTicketForAttendee(attendee))
                      }
                    >
                      <Ticket size={17} />
                      View Ticket
                    </button>
                  ) : (
                    <span className="badge upcoming">
                      No Ticket
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

  </div>
)}

{/* ATTENDANCE */}
{activeTab === "attendance" && (
  <div className="content-card">

    <div className="section-title">
      <div>
        <p className="eyebrow">MILESTONE 2</p>
        <h3>Attendance Management</h3>
      </div>

      <button
        type="button"
        className="primary"
        onClick={startQrScanner}
      >
        <Camera size={17} />
        Scan QR Code
      </button>
    </div>

    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Participant</th>
            <th>Email</th>
            <th>Event</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {attendance.length === 0 ? (
            <tr>
              <td colSpan="6">
                <div className="empty">
                  No attendance records found.
                </div>
              </td>
            </tr>
          ) : (
            attendance.map((item) => (
              <tr key={item._id}>

                <td>
                  <strong>
                    {item.ticket?.ticketId || item.ticketId || item.ticket?.id || "N/A"}
                  </strong>
                </td>

                <td>{item.name || "N/A"}</td>

                <td>{item.email || "N/A"}</td>

                <td>{item.event?.name || "N/A"}</td>

                <td>
                  <span
                    className={`badge ${
                      item.attendanceStatus === "Checked In"
                        ? "completed"
                        : "upcoming"
                    }`}
                  >
                    {item.attendanceStatus || "Registered"}
                  </span>
                </td>

                <td>
                  {item.attendanceStatus === "Checked In" ? (
                    <span className="badge completed">
                      Checked In
                    </span>
                  ) : (
                    <button
                      className="primary"
                      onClick={() => checkInAttendee(item)}
                      disabled={
                        !(
                          item.ticket?.ticketId ||
                          item.ticketId ||
                          item.ticket?.id
                        )
                      }
                    >
                      Check In
                    </button>
                  )}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
)}

{/* VENDORS */}
{activeTab === "vendors" && (
  <div className="content-card">

    <div className="section-title">
      <div>
        <p className="eyebrow">MILESTONE 2</p>
        <h3>Vendor Management</h3>
      </div>

      <button
        className="primary"
        onClick={() => {
          setVendorForm({
            vendorId: `VEN${Date.now().toString().slice(-6)}`,
            vendorName: "",
            serviceType: "Catering",
            phone: "",
            email: "",
            availability: "Available"
          });

          setShowVendorForm(true);
        }}
      >
        <Store size={17} />
        Add Vendor
      </button>
    </div>

    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Vendor ID</th>
            <th>Vendor Name</th>
            <th>Service</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Availability</th>
          </tr>
        </thead>

        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td colSpan="6">
                <div className="empty">
                  No vendors added yet.
                </div>
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr key={vendor._id}>
                <td>
                  <strong>{vendor.vendorId}</strong>
                </td>

                <td>{vendor.vendorName}</td>
                <td>{vendor.serviceType}</td>
                <td>{vendor.phone}</td>
                <td>{vendor.email}</td>

                <td>
                  <span
                    className={`badge ${
                      vendor.availability === "Available"
                        ? "available"
                        : "cancelled"
                    }`}
                  >
                    {vendor.availability}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

  </div>
)}


        {/* VENDOR ASSIGNMENTS */}
        {activeTab === "assignments" && (
          <div className="content-card">

            <div className="section-title">
              <div>
                <p className="eyebrow">MILESTONE 2</p>
                <h3>Vendor Assignments</h3>
              </div>

              <button
                className="primary"
                onClick={openAssignmentForm}
                disabled={events.length === 0 || vendors.length === 0}
              >
                <UserCog size={17} />
                Assign Vendor
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Vendor</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="empty">
                          No vendor assignments yet.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment._id}>

                        <td>
                          {assignment.event?.name || "N/A"}
                        </td>

                        <td>
                          {assignment.vendor?.vendorName || "N/A"}
                        </td>

                        <td>
                          {assignment.serviceType || "N/A"}
                        </td>

                        <td>
                          <span className="badge available">
                            {assignment.status || "Assigned"}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TICKETS */}
        {activeTab === "tickets" && (
          <div className="content-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">MILESTONE 2</p>
                <h3>Digital Tickets</h3>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Registration ID</th>
                    <th>Participant</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Ticket</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="empty">
                          No tickets generated yet.
                          Register a participant to generate a ticket.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket._id || ticket.ticketId}>
                        <td>
                          <strong>{ticket.ticketId}</strong>
                        </td>
                        <td>{ticket.registrationId || "N/A"}</td>
                        <td>{ticket.name || "N/A"}</td>
                        <td>{ticket.email || "N/A"}</td>
                        <td>
                          {ticket.event?.name ||
                            ticket.eventName ||
                            "N/A"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              ticket.status === "Checked In"
                                ? "completed"
                                : "upcoming"
                            }`}
                          >
                            {ticket.status || "Registered"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => viewTicket(ticket)}
                          >
                            <Ticket size={17} />
                            View Ticket
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        </main>

      {/* EVENT MODAL */}
      {showEventForm && (
        <Modal
          title={editingEvent ? "Update Event" : "Create New Event"}
          onClose={closeForms}
        >
          <form onSubmit={saveEvent}>
            <Field
              label="Event Name"
              value={eventForm.name}
              onChange={(v) =>
                setEventForm({ ...eventForm, name: v })
              }
              placeholder="e.g. AI Innovation Summit"
            />

            <div className="form-grid">
              <Select
                label="Event Type"
                value={eventForm.type}
                onChange={(v) =>
                  setEventForm({ ...eventForm, type: v })
                }
                options={[
                  "Workshop",
                  "Conference",
                  "Hackathon",
                  "Seminar",
                  "Cultural",
                  "Sports"
                ]}
              />

              <Select
                label="Status"
                value={eventForm.status}
                onChange={(v) =>
                  setEventForm({ ...eventForm, status: v })
                }
                options={[
                  "Planning",
                  "Upcoming",
                  "Completed",
                  "Cancelled"
                ]}/>
                
            </div>

            <div className="form-grid">
              <Field
                label="Date"
                type="date"
                value={eventForm.date}
                onChange={(v) =>
                  setEventForm({ ...eventForm, date: v })
                }
              />

              <Field
                label="Time"
                type="time"
                value={eventForm.time}
                onChange={(v) =>
                  setEventForm({ ...eventForm, time: v })
                }
              />
            </div>

            <div className="form-grid">
              <Field
                label="Budget"
                type="number"
                value={eventForm.budget}
                onChange={(v) =>
                  setEventForm({ ...eventForm, budget: v })
                }
                placeholder="50000"
              />

              <Select
                label="Venue"
                value={eventForm.venue}
                onChange={(v) =>
                  setEventForm({ ...eventForm, venue: v })
                }
                options={venues.map((v) => ({
                  value: v._id,
                  label: `${v.name} (${v.capacity})`
                }))}
                empty="No Venue"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeForms}
              >
                Cancel
              </button>

              <button className="primary" type="submit">
                {editingEvent ? "Update Event" : "Create Event"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ATTENDEE REGISTRATION MODAL */}
{showAttendeeForm && (
  <Modal
    title="Register Participant"
    onClose={() => setShowAttendeeForm(false)}
  >
    <form onSubmit={registerAttendee}>

      <div className="form-grid">

        <Field
          label="Registration ID"
          value={attendeeForm.registrationId}
          onChange={() => {}}
          placeholder="Auto generated"
        />

        <Field
          label="Participant Name"
          value={attendeeForm.name}
          onChange={(v) =>
            setAttendeeForm({
              ...attendeeForm,
              name: v
            })
          }
          placeholder="Enter participant name"
        />

        <Field
          label="Email"
          value={attendeeForm.email}
          onChange={(v) =>
            setAttendeeForm({
              ...attendeeForm,
              email: v
            })
          }
          placeholder="example@gmail.com"
        />

        <Field
          label="Phone"
          value={attendeeForm.phone}
          onChange={(v) =>
            setAttendeeForm({
              ...attendeeForm,
              phone: v
            })
          }
          placeholder="9876543210"
        />

        <Field
          label="College"
          value={attendeeForm.college}
          onChange={(v) =>
            setAttendeeForm({
              ...attendeeForm,
              college: v
            })
          }
          placeholder="College name"
        />

        <Field
          label="Department"
          value={attendeeForm.department}
          onChange={(v) =>
            setAttendeeForm({
              ...attendeeForm,
              department: v
            })
          }
          placeholder="CSE-AI"
        />

      </div>

      <div className="field">
  <span>Select Event</span>

  <select
    value={attendeeForm.eventId}
    onChange={(e) =>
      setAttendeeForm({
        ...attendeeForm,
        eventId: e.target.value
      })
    }
    required
  >
    <option value="">Select Event</option>

    {events.map((event) => (
      <option
        key={event._id}
        value={event._id}
      >
        {event.name}
      </option>
    ))}
  </select>
</div>
      <div className="modal-actions">

        <button
          type="button"
          className="secondary"
          onClick={() => setShowAttendeeForm(false)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary"
        >
          <UserPlus size={17} />
          Register Participant
        </button>

      </div>

    </form>
  </Modal>
)}

      {/* VENUE MODAL */}
      {showVenueForm && (
        <Modal
          title={editingVenue ? "Update Venue" : "Add New Venue"}
          onClose={closeForms}
        >
          <form onSubmit={saveVenue}>
            <Field
              label="Venue Name"
              value={venueForm.name}
              onChange={(v) =>
                setVenueForm({ ...venueForm, name: v })
              }
              placeholder="Main Seminar Hall"
            />

            <div className="form-grid">
              <Field
                label="Capacity"
                type="number"
                value={venueForm.capacity}
                onChange={(v) =>
                  setVenueForm({ ...venueForm, capacity: v })
                }
                placeholder="300"
              />

              <Field
                label="Location"
                value={venueForm.location}
                onChange={(v) =>
                  setVenueForm({ ...venueForm, location: v })
                }
                placeholder="Block A"
              />
            </div>

            <Select
              label="Availability"
              value={venueForm.availability}
              onChange={(v) =>
                setVenueForm({
                  ...venueForm,
                  availability: v
                })
              }
              options={["Available", "Unavailable"]}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeForms}
              >
                Cancel
              </button>

              <button className="primary">
                {editingVenue ? "Update Venue" : "Add Venue"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RESOURCE MODAL */}
      {showResourceForm && (
        <Modal
          title={
            editingResource
              ? "Update Resource"
              : "Add New Resource"
          }
          onClose={closeForms}
        >
          <form onSubmit={saveResource}>
            <Field
              label="Resource Name"
              value={resourceForm.name}
              onChange={(v) =>
                setResourceForm({
                  ...resourceForm,
                  name: v
                })
              }
              placeholder="Projector"
            />

            <div className="form-grid">
              <Field
                label="Quantity"
                type="number"
                value={resourceForm.quantity}
                onChange={(v) =>
                  setResourceForm({
                    ...resourceForm,
                    quantity: v
                  })
                }
                placeholder="10"
              />

              <Select
                label="Status"
                value={resourceForm.status}
                onChange={(v) =>
                  setResourceForm({
                    ...resourceForm,
                    status: v
                  })
                }
                options={[
                  "Available",
                  "Low Stock",
                  "Unavailable"
                ]}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeForms}
              >
                Cancel
              </button>

              <button className="primary">
                {editingResource
                  ? "Update Resource"
                  : "Add Resource"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VENDOR MODAL */}
      {showVendorForm && (
        <Modal
          title="Add New Vendor"
          onClose={() => setShowVendorForm(false)}
        >
          <form onSubmit={saveVendor}>
            <Field
              label="Vendor ID"
              value={vendorForm.vendorId}
              onChange={() => {}}
              placeholder="Auto generated"
            />

            <Field
              label="Vendor Name"
              value={vendorForm.vendorName}
              onChange={(v) =>
                setVendorForm({
                  ...vendorForm,
                  vendorName: v
                })
              }
              placeholder="Enter vendor name"
            />

            <div className="form-grid">
              <Select
                label="Service Type"
                value={vendorForm.serviceType}
                onChange={(v) =>
                  setVendorForm({
                    ...vendorForm,
                    serviceType: v
                  })
                }
                options={[
                  "Catering",
                  "Decoration",
                  "Photography",
                  "Sound & Lighting",
                  "Security",
                  "Transportation",
                  "Other"
                ]}
              />

              <Select
                label="Availability"
                value={vendorForm.availability}
                onChange={(v) =>
                  setVendorForm({
                    ...vendorForm,
                    availability: v
                  })
                }
                options={[
                  "Available",
                  "Unavailable"
                ]}
              />
            </div>

            <div className="form-grid">
              <Field
                label="Phone"
                value={vendorForm.phone}
                onChange={(v) =>
                  setVendorForm({
                    ...vendorForm,
                    phone: v
                  })
                }
                placeholder="9876543210"
              />

              <Field
                label="Email"
                value={vendorForm.email}
                onChange={(v) =>
                  setVendorForm({
                    ...vendorForm,
                    email: v
                  })
                }
                placeholder="vendor@gmail.com"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowVendorForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
              >
                <Store size={17} />
                Add Vendor
              </button>
            </div>
          </form>
        </Modal>
      )}


      {/* QR SCANNER MODAL */}
      {showQrScanner && (
        <Modal
          title="Scan Attendance QR Code"
          onClose={stopQrScanner}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "520px",
                margin: "0 auto",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#0f172a"
              }}
            >
              <div
                id="eventSphereQrReader"
                style={{
                  width: "100%",
                  minHeight: "300px",
                  background: "#0f172a"
                }}
              />
            </div>

            <p style={{ marginTop: "15px", color: "#64748b" }}>
              Point the camera at the participant's QR code.
            </p>

            {scannerMessage && (
              <div
                className="empty"
                style={{
                  marginTop: "15px",
                  color: "#dc2626"
                }}
              >
                {scannerMessage}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={stopQrScanner}
              >
                Close Scanner
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VENDOR ASSIGNMENT MODAL */}
      {showAssignmentForm && (
        <Modal
          title="Assign Vendor"
          onClose={() => setShowAssignmentForm(false)}
        >
          <form onSubmit={saveAssignment}>

            <Select
              label="Event"
              value={assignmentForm.eventId}
              onChange={(v) =>
                setAssignmentForm({
                  ...assignmentForm,
                  eventId: v
                })
              }
              options={events.map((event) => ({
                value: event._id,
                label: event.name
              }))}
              empty="Select Event"
            />

            <Select
              label="Vendor"
              value={assignmentForm.vendorId}
              onChange={(v) => {
                const selectedVendor = vendors.find(
                  (vendor) => vendor._id === v
                );

                setAssignmentForm({
                  ...assignmentForm,
                  vendorId: v,
                  serviceType: selectedVendor?.serviceType || ""
                });
              }}
              options={vendors.map((vendor) => ({
                value: vendor._id,
                label: `${vendor.vendorName} (${vendor.serviceType})`
              }))}
              empty="Select Vendor"
            />

            <Select
              label="Service Type"
              value={assignmentForm.serviceType}
              onChange={(v) =>
                setAssignmentForm({
                  ...assignmentForm,
                  serviceType: v
                })
              }
              options={[
                "Catering",
                "Decoration",
                "Photography",
                "Sound & Lighting",
                "Security",
                "Transportation",
                "Other"
              ]}
              empty="Select Service"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowAssignmentForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
              >
                <UserCog size={17} />
                Assign Vendor
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* GENERATED TICKET MODAL */}
      {generatedTicket && (
        <Modal
          title="Ticket Details"
          onClose={() => setGeneratedTicket(null)}
        >
          <div
            className="content-card"
            style={{ margin: 0, boxShadow: "none" }}
          >
            <div className="section-title">
              <div>
                <p className="eyebrow">EVENTSPHERE TICKET</p>
                <h3>
                  {generatedTicket.ticketId || "Ticket"}
                </h3>
              </div>

              <span
                className={`badge ${
                  generatedTicket.status === "Checked In"
                    ? "completed"
                    : "upcoming"
                }`}
              >
                {generatedTicket.status || "Registered"}
              </span>
            </div>

            <div className="form-grid">
              <div className="field">
                <span>Ticket ID</span>
                <input
                  value={generatedTicket.ticketId || ""}
                  readOnly
                />
              </div>

              <div className="field">
                <span>Registration ID</span>
                <input
                  value={generatedTicket.registrationId || ""}
                  readOnly
                />
              </div>

              <div className="field">
                <span>Participant</span>
                <input
                  value={
                    generatedTicket.name ||
                    generatedTicket.participantName ||
                    ""
                  }
                  readOnly
                />
              </div>

              <div className="field">
                <span>Email</span>
                <input
                  value={generatedTicket.email || ""}
                  readOnly
                />
              </div>

              <div className="field">
                <span>Event</span>
                <input
                  value={
                    generatedTicket.event?.name ||
                    generatedTicket.eventName ||
                    ""
                  }
                  readOnly
                />
              </div>

              <div className="field">
                <span>Ticket Status</span>
                <input
                  value={generatedTicket.status || "Registered"}
                  readOnly
                />
              </div>
            </div>

            {/* AUTOMATIC ATTENDANCE QR CODE */}
            <div
              style={{
                textAlign: "center",
                marginTop: "30px",
                padding: "20px"
              }}
            >
              <h4 style={{ marginBottom: "20px" }}>
                Attendance QR Code
              </h4>

              <QRCodeSVG
                value={
                  generatedTicket.ticketId ||
                  generatedTicket.ticketID ||
                  generatedTicket._id ||
                  "UNKNOWN-TICKET"
                }
                size={180}
                level="H"
                includeMargin={true}
              />

              <p
                style={{
                  marginTop: "15px",
                  color: "#64748b"
                }}
              >
                Scan QR code for attendance check-in.
              </p>

              <strong>
                {generatedTicket.ticketId ||
                  generatedTicket.ticketID ||
                  generatedTicket._id ||
                  "UNKNOWN-TICKET"}
              </strong>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setGeneratedTicket(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      <CalendarDays size={35} />
      <p>{text}</p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = ""
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  empty
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {empty && <option value="">{empty}</option>}

        {options.map((option) => {
          const isObject = typeof option === "object";

          return (
            <option
              key={isObject ? option.value : option}
              value={isObject ? option.value : option}
            >
              {isObject ? option.label : option}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default App;