import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useDefaultUser } from "../hooks/useDefaultUser";

const defaultForm = {
  title: "",
  description: "",
  duration: 30,
  slug: "",
  bufferTime: 0,
};

export default function EventTypesPage() {
  const { user, error: userError } = useDefaultUser();
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await api(`/api/event-types?userId=${user.id}`);
    setEventTypes(data);
  }, [user]);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        bufferTime: Number(form.bufferTime),
      };
      if (editingId) {
        await api(`/api/event-types/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/api/event-types", {
          method: "POST",
          body: JSON.stringify({ ...payload, userId: user.id }),
        });
      }
      setForm(defaultForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await api(`/api/event-types/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Event Types</h1>
        <p className="mt-1 text-sm text-slate-500">Create and manage your booking links.</p>
        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            placeholder="Slug (example: intro-call)"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <input
            type="number"
            min="5"
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            placeholder="Duration (min)"
            value={form.duration}
            onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            placeholder="Buffer (min)"
            value={form.bufferTime}
            onChange={(e) => setForm((prev) => ({ ...prev, bufferTime: e.target.value }))}
          />
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
              {editingId ? "Update Event Type" : "Create Event Type"}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setForm(defaultForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {eventTypes.map((eventType) => (
          <article key={eventType.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{eventType.title}</h3>
            <p className="mt-1 min-h-10 text-sm text-slate-600">{eventType.description || "No description added."}</p>
            <p className="mt-3 text-sm text-slate-500">
              {eventType.duration} min • Buffer {eventType.bufferTime} min • /book/{eventType.slug}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setEditingId(eventType.id);
                  setForm({
                    title: eventType.title,
                    description: eventType.description || "",
                    duration: eventType.duration,
                    slug: eventType.slug,
                    bufferTime: eventType.bufferTime,
                  });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                onClick={() => remove(eventType.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {eventTypes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 md:col-span-2">
            No event types yet. Create your first one above.
          </div>
        )}
      </section>
      {(error || userError) && <p className="text-sm text-rose-600">{error || userError}</p>}
    </div>
  );
}
