import { Link, useParams } from "react-router-dom";

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-4xl">🎉</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Booking Confirmed</h1>
      <p className="mt-2 text-sm text-slate-600">Reference ID: {bookingId}</p>
      <Link to="/" className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
        Go to Dashboard
      </Link>
    </div>
  );
}
