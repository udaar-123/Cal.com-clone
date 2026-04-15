import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({ attendeeName: "", attendeeEmail: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setLoadingEvent(true);
    setError("");
    console.log("[booking-page] slug=", slug);
    api(`/api/bookings/public/${slug}`)
      .then((payload) => {
        console.log("[booking-page] eventType response=", payload);
        setEventType(payload);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingEvent(false));
  }, [slug]);

  useEffect(() => {
    if (!eventType) return;
    setLoadingSlots(true);
    setError("");
    setSelectedSlot("");
    api(`/api/bookings/public/${slug}/slots?date=${selectedDate}`)
      .then((payload) => {
        console.log("[booking-page] slots response=", payload);
        setSlots(payload);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [slug, selectedDate, eventType]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const booking = await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          eventTypeId: eventType.id,
          startTime: selectedSlot,
          attendeeName: form.attendeeName,
          attendeeEmail: form.attendeeEmail,
        }),
      });
      navigate(`/confirmation/${booking.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), "yyyy-MM-dd"));

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {loadingEvent ? "Loading event..." : eventType?.title || "Event unavailable"}
      </h1>
      <p className="mt-1 text-sm text-slate-600">{eventType?.description || "Select a date and time to continue."}</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Select Date</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dates.map((date) => (
              <button
                type="button"
                key={date}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  selectedDate === date ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                onClick={() => setSelectedDate(date)}
              >
                {format(new Date(date), "EEE, dd MMM")}
              </button>
            ))}
          </div>
          <h2 className="mt-5 text-sm font-semibold text-slate-900">Available Slots</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {loadingSlots ? (
              <p className="col-span-full rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">Loading slots...</p>
            ) : slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  type="button"
                  key={slot.startTime}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    slot.unavailable
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : selectedSlot === slot.startTime
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-pressed={selectedSlot === slot.startTime}
                  disabled={Boolean(slot.unavailable)}
                  onClick={() => setSelectedSlot(slot.startTime)}
                >
                  {slot.label}
                </button>
              ))
            ) : (
              <p className="col-span-full rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                No slots available for this day.
              </p>
            )}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Your Details</h2>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Name"
            value={form.attendeeName}
            onChange={(e) => setForm((prev) => ({ ...prev, attendeeName: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Email"
            type="email"
            value={form.attendeeEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, attendeeEmail: e.target.value }))}
          />
          <button
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            disabled={!eventType || !selectedSlot || loadingSlots || loadingEvent || submitting}
          >
            Confirm Booking
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
