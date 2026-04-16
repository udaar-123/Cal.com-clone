import { useEffect, useState } from "react";
import { api } from "../api";
import { useDefaultUser } from "../hooks/useDefaultUser";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timezoneOptions = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export default function AvailabilityPage() {
  const { user, error: userError } = useDefaultUser();
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    api(`/api/availability?userId=${user.id}`)
      .then(setSlots)
      .catch((err) => setError(err.message));
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const normalized = slots
        .map((slot) => ({
          ...slot,
          dayOfWeek: Number(slot.dayOfWeek),
          startTime: slot.startTime.trim(),
          endTime: slot.endTime.trim(),
          timezone: slot.timezone.trim(),
        }))
        .filter((slot) => slot.startTime < slot.endTime);
      if (normalized.some((slot) => !slot.timezone)) {
        setError("Timezone cannot be empty. Set a valid timezone (example: Asia/Kolkata).");
        return;
      }
      const deduped = Array.from(
        new Map(normalized.map((slot) => [`${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}|${slot.timezone}`, slot])).values(),
      );
      const payload = { userId: user.id, slots: deduped };
      const data = await api("/api/availability", { method: "PUT", body: JSON.stringify(payload) });
      setSlots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addSlot() {
    setSlots((prev) => [...prev, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: user?.timezone || "UTC" }]);
  }

  function removeSlot(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTimezone(index, timezone) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, timezone } : slot)));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Availability</h1>
      <p className="mt-1 text-sm text-slate-500">Timezone: {user?.timezone || "Loading..."}</p>
      <div className="mt-6 space-y-3">
        {slots.map((slot, index) => (
          <div key={`${slot.dayOfWeek}-${index}`} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
            <select
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={slot.dayOfWeek}
              onChange={(e) => setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, dayOfWeek: Number(e.target.value) } : s)))}
            >
              {dayLabels.map((label, value) => (
                <option key={label} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={slot.startTime}
              onChange={(e) => setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, startTime: e.target.value } : s)))}
            />
            <input
              type="time"
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={slot.endTime}
              onChange={(e) => setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, endTime: e.target.value } : s)))}
            />
            <div className="space-y-2">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm"
                value={timezoneOptions.includes(slot.timezone) ? slot.timezone : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    updateTimezone(index, "");
                    return;
                  }
                  updateTimezone(index, e.target.value);
                }}
              >
                {timezoneOptions.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
                <option value="__custom__">Custom timezone...</option>
              </select>
              {!timezoneOptions.includes(slot.timezone) && (
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Type timezone e.g. Asia/Kathmandu"
                  value={slot.timezone}
                  onChange={(e) => updateTimezone(index, e.target.value)}
                />
              )}
            </div>
            <button
              type="button"
              className="rounded-lg bg-rose-50 px-3 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100"
              onClick={() => removeSlot(index)}
            >
              Remove
            </button>
          </div>
        ))}
        {slots.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No availability slots yet.</div>}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={addSlot}>
          Add Slot
        </button>
        <button
          type="button"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          onClick={save}
        >
          Save
        </button>
      </div>
      {(error || userError) && <p className="mt-3 text-sm text-rose-600">{error || userError}</p>}
    </section>
  );
}
