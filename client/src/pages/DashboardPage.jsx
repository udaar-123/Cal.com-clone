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

  const load = useCallback(async () => {
    if (!user) return;
    const payload = await api(`/api/bookings/dashboard?userId=${user.id}`);
    setData(payload);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id) {
    await api(`/api/bookings/${id}/cancel`, { method: "PATCH" });
    await load();
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bookings Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Track upcoming meetings and manage cancellations.</p>
      </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BookingList title="Upcoming Bookings" bookings={data.upcoming} onCancel={cancel} />
      <BookingList title="Past / Cancelled" bookings={data.past} onCancel={cancel} />
      </div>
    </div>
  );
}
