import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mockFacilities, mockCourts, mockBookings } from "../client/src/data/mockData";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Facilities
  app.get('/api/facilities', (_req: Request, res: Response) => {
    res.json(mockFacilities);
  });

  app.get('/api/facilities/:id', (req: Request, res: Response) => {
    const facility = mockFacilities.find(f => f.id === req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  });

  app.get('/api/facilities/:id/courts', (req: Request, res: Response) => {
    const courts = mockCourts.filter(c => c.facilityId === req.params.id);
    res.json(courts);
  });

  // Bookings (in-memory list extended from mocks)
  const bookings = [...mockBookings];

  app.get('/api/bookings', (req: Request, res: Response) => {
    const { userId } = req.query as { userId?: string };
    const result = userId ? bookings.filter(b => b.userId === userId) : bookings;
    res.json(result);
  });

  app.post('/api/bookings', (req: Request, res: Response) => {
    const { userId, facilityId, courtId, date, timeSlot, totalPrice } = req.body || {};
    if (!userId || !facilityId || !courtId || !date || !timeSlot?.start || !timeSlot?.end) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = String(bookings.length + 1);
    const booking = {
      id,
      userId,
      facilityId,
      courtId,
      date,
      timeSlot,
      status: 'confirmed',
      totalPrice: totalPrice ?? 0,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    } as any;
    bookings.push(booking);
    res.status(201).json(booking);
  });

  const httpServer = createServer(app);

  return httpServer;
}
