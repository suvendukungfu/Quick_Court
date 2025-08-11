import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingPage() {
  const { facilityId, courtId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [facility, setFacility] = useState<any>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [date, setDate] = useState<string>('');
  const [start, setStart] = useState<string>('10:00');
  const [end, setEnd] = useState<string>('11:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      try {
        const [f, c] = await Promise.all([
          api.getFacility(facilityId as string),
          api.getFacilityCourts(facilityId as string),
        ]);
        setFacility(f);
        setCourts(c);
      } catch (e: any) {
        setError(e.message || 'Failed to load venue');
      }
    };
    if (facilityId) run();
  }, [facilityId]);

  const selectedCourt = courts.find((c) => c.id === courtId) || courts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date || !selectedCourt) return;
    setSubmitting(true);
    setError('');
    try {
      if (!facilityId) {
        setError('Facility ID is required');
        return;
      }
      
      await api.createBooking({
        userId: user.id,
        facilityId: facilityId,
        courtId: selectedCourt.id,
        date,
        timeSlot: { start, end },
        totalPrice: selectedCourt.pricePerHour,
      });
      navigate('/bookings');
    } catch (e: any) {
      setError(e.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!facility) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <Link to={`/venues/${facility.id}`} className="text-blue-600">← Back to venue</Link>
      <h1 className="text-2xl font-bold">Book {facility.name}</h1>

      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Court</label>
          <select
            value={selectedCourt?.id}
            onChange={(e) => {
              const newCourt = courts.find((c) => c.id === e.target.value);
              if (newCourt) {
                // trigger state update
                setCourts((prev) => [...prev]);
              }
            }}
            className="w-full border rounded px-3 py-2"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - ${c.pricePerHour}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <button type="submit" disabled={submitting || !date} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}


