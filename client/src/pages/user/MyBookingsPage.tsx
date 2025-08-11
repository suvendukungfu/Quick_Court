import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const data = await api.listBookings(user.id);
        setBookings(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      {bookings.length === 0 ? (
        <div>No bookings yet.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="border rounded p-4">
              <div className="font-semibold">Booking #{b.id}</div>
              <div className="text-sm text-gray-600">Date: {b.date}</div>
              <div className="text-sm text-gray-600">Time: {b.timeSlot?.start} - {b.timeSlot?.end}</div>
              <div className="text-sm text-gray-600">Court: {b.courtId}</div>
              <div className="text-sm text-gray-600">Status: {b.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


