import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "../api";
import { useDefaultUser } from "../hooks/useDefaultUser";

function BookingList({ title, bookings, onCancel }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-xl border border-slate-200 p-4">
            <p className="font-medium text-slate-900">{booking.eventType.title}</p>
            <p className="text-sm text-slate-600">
              {booking.attendeeName} • {booking.attendeeEmail}
            </p>
            <p className="text-sm text-slate-500">{format(new Date(booking.startTime), "PPpp")}</p>
            {booking.status === "CONFIRMED" && (
              <button
                type="button"
                onClick={() => onCancel(booking.id)}
                className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                Cancel
              </button>
            )}
          </article>
        ))}
        {!bookings.length && <p className="text-sm text-slate-500">No bookings yet.</p>}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useDefaultUser();
  const [data, setData] = useState({ upcoming: [], past: [] });
  const [eventTypes, setEventTypes] = useState([]);
  const [copiedSlug, setCopiedSlug] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const [dashboardPayload, eventTypePayload] = await Promise.all([
      api(`/api/bookings/dashboard?userId=${user.id}`),
      api(`/api/event-types?userId=${user.id}`),
    ]);
    setData(dashboardPayload);
    setEventTypes(eventTypePayload);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id) {
    await api(`/api/bookings/${id}/cancel`, { method: "PATCH" });
    await load();
  }

  async function copyLink(slug) {
    const url = `${window.location.origin}/book/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(""), 1500);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bookings Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Track upcoming meetings and manage cancellations.</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Share Booking Link</h2>
        <p className="mt-1 text-sm text-slate-500">Open or copy links directly from here.</p>
        <div className="mt-4 space-y-3">
          {eventTypes.map((eventType) => {
            const bookingUrl = `${window.location.origin}/book/${eventType.slug}`;
            return (
              <div key={eventType.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{eventType.title}</p>
                  <p className="text-sm text-slate-500">{bookingUrl}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(eventType.slug)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    {copiedSlug === eventType.slug ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            );
          })}
          {eventTypes.length === 0 && <p className="text-sm text-slate-500">Create an event type to get your public booking link.</p>}
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BookingList title="Upcoming Bookings" bookings={data.upcoming} onCancel={cancel} />
        <BookingList title="Past / Cancelled" bookings={data.past} onCancel={cancel} />
      </div>
    </div>
  );
}
