import React, { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_BACKEND;

// ─── tiny fetch helper ────────────────────────────────────────────────────────
const authFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
            ...(opts.headers || {})
        }
    });

// ─── status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
    const map = {
        pending:   "bg-amber-100 text-amber-700 border-amber-200",
        confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
        completed: "bg-slate-100 text-slate-500 border-slate-200",
        cancelled: "bg-red-100 text-red-500 border-red-200"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// ─── Doctor card used in emergency picker ────────────────────────────────────
const DoctorCard = ({ doc, selected, onSelect }) => (
    <button
        onClick={() => onSelect(doc)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200
            ${selected
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
            }`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold text-slate-800">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.email}</p>
                {doc.distance_km !== null && (
                    <p className="text-xs text-blue-500 mt-1 font-medium">
                        ~{doc.distance_km.toFixed(1)} km away
                    </p>
                )}
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${doc.available ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className={`text-xs font-medium ${doc.available ? "text-emerald-600" : "text-amber-600"}`}>
                    {doc.available ? "Available" : "Busy soon"}
                </span>
            </div>
        </div>
    </button>
);

// ─── Appointment row ─────────────────────────────────────────────────────────
const ApptRow = ({ appt, isDoctor, onConfirm, onCancel, onComplete, onJoin }) => {
    const d = new Date(appt.scheduled_at);
    const isPast = d < new Date();
    const canJoin = appt.status === "confirmed" && appt.room_id;

    return (
        <div className={`p-4 rounded-xl border transition-all
            ${appt.type === "emergency" ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusPill status={appt.status} />
                        {appt.type === "emergency" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                                🚨 Emergency
                            </span>
                        )}
                        <span className="text-xs text-slate-400">
                            {appt.consultation_type === "video" ? "📹 Video" : "💬 Chat"}
                        </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                        {isDoctor
                            ? `Patient: ${appt.patient_id?.name}`
                            : `Dr. ${appt.doctor_id?.name}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {d.toLocaleDateString("en-IN", {
                            weekday: "short", year: "numeric",
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        })}
                    </p>
                    {appt.reason && (
                        <p className="text-xs text-slate-400 mt-1 italic">"{appt.reason}"</p>
                    )}
                    {appt.doctor_note && (
                        <p className="text-xs text-slate-500 mt-1">
                            <span className="font-medium">Note:</span> {appt.doctor_note}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                    {/* Doctor actions */}
                    {isDoctor && appt.status === "pending" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onConfirm(appt._id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => onCancel(appt._id, true)}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-lg transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    )}

                    {isDoctor && appt.status === "confirmed" && !isPast && (
                        <button
                            onClick={() => onComplete(appt._id)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Mark Complete
                        </button>
                    )}

                    {/* Patient cancel */}
                    {!isDoctor && appt.status === "pending" && (
                        <button
                            onClick={() => onCancel(appt._id, false)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {/* Join call */}
                    {canJoin && (
                        <button
                            onClick={() => onJoin(appt.room_id, appt.consultation_type)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all hover:shadow-md"
                        >
                            {appt.consultation_type === "video" ? "📹 Join Video" : "💬 Join Chat"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AppointmentPanel({ onJoinCall }) {
    const isDoctor = localStorage.getItem("role") === "Doctor";

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list"); // 'list' | 'book' | 'emergency'

    // Booking form state
    const [assignedDoctor, setAssignedDoctor] = useState(null);
    const [bookForm, setBookForm] = useState({
        scheduled_at: "",
        consultation_type: "video",
        reason: ""
    });

    // Emergency state
    const [emergencyDoctors, setEmergencyDoctors] = useState([]);
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [selectedEmDoc, setSelectedEmDoc] = useState(null);
    const [emScheduled, setEmScheduled] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ── Load appointments ──
    const loadAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch("/api/appointments/my");
            const data = await res.json();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (e) {
            setError("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAppointments(); }, [loadAppointments]);

    // ── Load assigned doctor when booking tab opens ──
    useEffect(() => {
        if (view === "book" && !isDoctor && !assignedDoctor) {
            authFetch("/api/appointments/doctors/assigned")
                .then(r => r.json())
                .then(d => { if (d._id) setAssignedDoctor(d); })
                .catch(() => setError("Could not load your assigned doctor"));
        }
    }, [view, isDoctor, assignedDoctor]);

    // ── Load emergency doctors ──
    const loadEmergencyDoctors = () => {
        setEmergencyLoading(true);
        setError("");
        // Try to get browser geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    const res = await authFetch(`/api/appointments/doctors/emergency?lat=${lat}&lng=${lng}`);
                    const data = await res.json();
                    setEmergencyDoctors(Array.isArray(data) ? data : []);
                    setEmergencyLoading(false);
                },
                async () => {
                    // No geolocation permission — load without coords
                    const res = await authFetch("/api/appointments/doctors/emergency");
                    const data = await res.json();
                    setEmergencyDoctors(Array.isArray(data) ? data : []);
                    setEmergencyLoading(false);
                }
            );
        } else {
            authFetch("/api/appointments/doctors/emergency")
                .then(r => r.json())
                .then(data => { setEmergencyDoctors(Array.isArray(data) ? data : []); setEmergencyLoading(false); });
        }
    };

    useEffect(() => {
        if (view === "emergency") loadEmergencyDoctors();
        // eslint-disable-next-line
    }, [view]);

    // ── Book normal appointment ──
    const handleBook = async (e) => {
        e.preventDefault();
        if (!assignedDoctor) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await authFetch("/api/appointments", {
                method: "POST",
                body: JSON.stringify({
                    doctor_id: assignedDoctor._id,
                    scheduled_at: bookForm.scheduled_at,
                    type: "normal",
                    consultation_type: bookForm.consultation_type,
                    reason: bookForm.reason
                })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to book"); return; }
            setView("list");
            loadAppointments();
        } catch (err) {
            setError("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Book emergency appointment ──
    const handleEmergencyBook = async () => {
        if (!selectedEmDoc || !emScheduled) {
            setError("Please select a doctor and a time slot");
            return;
        }
        setSubmitting(true);
        setError("");

        let patient_location = { lat: null, lng: null };
        try {
            await new Promise((resolve) => {
                navigator.geolocation?.getCurrentPosition(
                    pos => { patient_location = { lat: pos.coords.latitude, lng: pos.coords.longitude }; resolve(); },
                    () => resolve()
                );
            });
        } catch (_) {}

        try {
            const res = await authFetch("/api/appointments", {
                method: "POST",
                body: JSON.stringify({
                    doctor_id: selectedEmDoc._id,
                    scheduled_at: emScheduled,
                    type: "emergency",
                    consultation_type: "video",
                    reason: "Emergency consultation",
                    patient_location
                })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to book emergency"); return; }
            setView("list");
            loadAppointments();
        } catch (err) {
            setError("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Doctor: confirm appointment ──
    const handleConfirm = async (id) => {
        await authFetch(`/api/appointments/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "confirmed" })
        });
        loadAppointments();
    };

    // ── Cancel (doctor declines or patient cancels) ──
    const handleCancel = async (id, isDocDecline) => {
        if (isDocDecline) {
            await authFetch(`/api/appointments/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "cancelled", doctor_note: "Declined by doctor" })
            });
        } else {
            await authFetch(`/api/appointments/${id}`, { method: "DELETE" });
        }
        loadAppointments();
    };

    // ── Doctor: mark complete ──
    const handleComplete = async (id) => {
        await authFetch(`/api/appointments/${id}/complete`, { method: "PATCH" });
        loadAppointments();
    };

    // ── Min datetime for input (now + 10 min) ──
    const minDatetime = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);

    // ── Filter appointments by status for tabs ──
    const upcoming = appointments.filter(a => ["pending", "confirmed"].includes(a.status));
    const past = appointments.filter(a => ["completed", "cancelled"].includes(a.status));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Appointments</h2>
                    <p className="text-sm text-slate-500">
                        {isDoctor ? "Manage your patient consultations" : "Book and manage your consultations"}
                    </p>
                </div>

                {!isDoctor && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setView("book"); setError(""); }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            + Book Appointment
                        </button>
                        <button
                            onClick={() => { setView("emergency"); setError(""); setSelectedEmDoc(null); }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors animate-pulse"
                        >
                            🚨 Emergency
                        </button>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* ── LIST VIEW ── */}
            {view === "list" && (
                <div className="p-6 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
                            Loading appointments…
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center text-slate-400">
                            <span className="text-4xl mb-3">📅</span>
                            <p className="text-sm">No appointments yet.</p>
                            {!isDoctor && (
                                <p className="text-xs mt-1">Click "Book Appointment" to schedule a consultation.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            {upcoming.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                        Upcoming ({upcoming.length})
                                    </p>
                                    <div className="space-y-3">
                                        {upcoming.map(a => (
                                            <ApptRow
                                                key={a._id}
                                                appt={a}
                                                isDoctor={isDoctor}
                                                onConfirm={handleConfirm}
                                                onCancel={handleCancel}
                                                onComplete={handleComplete}
                                                onJoin={onJoinCall}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {past.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                        Past ({past.length})
                                    </p>
                                    <div className="space-y-3 opacity-70">
                                        {past.map(a => (
                                            <ApptRow
                                                key={a._id}
                                                appt={a}
                                                isDoctor={isDoctor}
                                                onConfirm={handleConfirm}
                                                onCancel={handleCancel}
                                                onComplete={handleComplete}
                                                onJoin={onJoinCall}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ── BOOK NORMAL APPOINTMENT ── */}
            {view === "book" && !isDoctor && (
                <div className="p-6 max-w-lg">
                    <button
                        onClick={() => setView("list")}
                        className="text-sm text-slate-400 hover:text-slate-600 mb-5 flex items-center gap-1"
                    >
                        ← Back
                    </button>

                    <h3 className="text-lg font-bold text-slate-800 mb-4">Book a Consultation</h3>

                    {assignedDoctor ? (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {assignedDoctor.name?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Dr. {assignedDoctor.name}</p>
                                <p className="text-xs text-slate-500">{assignedDoctor.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 mb-4">Loading your assigned doctor…</p>
                    )}

                    <form onSubmit={handleBook} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                min={minDatetime}
                                value={bookForm.scheduled_at}
                                onChange={e => setBookForm(p => ({ ...p, scheduled_at: e.target.value }))}
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Consultation Type
                            </label>
                            <div className="flex gap-3">
                                {["video", "chat"].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setBookForm(p => ({ ...p, consultation_type: type }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all
                                            ${bookForm.consultation_type === type
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                                    >
                                        {type === "video" ? "📹 Video Call" : "💬 Chat"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Reason (optional)
                            </label>
                            <textarea
                                rows={3}
                                value={bookForm.reason}
                                onChange={e => setBookForm(p => ({ ...p, reason: e.target.value }))}
                                placeholder="Brief reason for consultation…"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !assignedDoctor}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
                        >
                            {submitting ? "Booking…" : "Request Appointment"}
                        </button>
                    </form>
                </div>
            )}

            {/* ── EMERGENCY VIEW ── */}
            {view === "emergency" && !isDoctor && (
                <div className="p-6">
                    <button
                        onClick={() => setView("list")}
                        className="text-sm text-slate-400 hover:text-slate-600 mb-5 flex items-center gap-1"
                    >
                        ← Back
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-3xl">🚨</span>
                        <div>
                            <h3 className="text-lg font-bold text-red-700">Emergency Consultation</h3>
                            <p className="text-xs text-slate-500">
                                Select any available doctor. All emergency consultations are video calls.
                            </p>
                        </div>
                    </div>

                    {emergencyLoading ? (
                        <p className="text-sm text-slate-400 py-8 text-center">Finding available doctors…</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                                {emergencyDoctors.map(doc => (
                                    <DoctorCard
                                        key={doc._id}
                                        doc={doc}
                                        selected={selectedEmDoc?._id === doc._id}
                                        onSelect={setSelectedEmDoc}
                                    />
                                ))}
                            </div>

                            {selectedEmDoc && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                                    <p className="text-sm font-semibold text-red-700">
                                        Booking emergency with Dr. {selectedEmDoc.name}
                                    </p>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Requested Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            min={minDatetime}
                                            value={emScheduled}
                                            onChange={e => setEmScheduled(e.target.value)}
                                            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                                        />
                                    </div>
                                    <button
                                        onClick={handleEmergencyBook}
                                        disabled={submitting}
                                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                                    >
                                        {submitting ? "Booking…" : "🚨 Confirm Emergency Booking"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}