import { Facility, Court, Booking, TimeSlot } from '../types';

export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Elite Sports Complex',
    description: 'Premium sports facility with state-of-the-art equipment and professional courts.',
    address: '123 Sports Avenue, Downtown City',
    ownerId: '2',
    sports: ['Badminton', 'Tennis', 'Basketball'],
    amenities: ['Parking', 'Locker Rooms', 'Cafeteria', 'Air Conditioning', 'Wi-Fi'],
    photos: [
      'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg',
      'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg',
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
    ],
    rating: 4.8,
    reviewCount: 124,
    status: 'approved',
    priceRange: { min: 25, max: 45 },
    location: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'City Badminton Center',
    description: 'Specialized badminton facility with 8 professional courts and expert coaching.',
    address: '456 Racket Road, Sports District',
    ownerId: '2',
    sports: ['Badminton'],
    amenities: ['Parking', 'Equipment Rental', 'Coaching', 'Air Conditioning'],
    photos: [
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg',
      'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg'
    ],
    rating: 4.6,
    reviewCount: 89,
    status: 'approved',
    priceRange: { min: 20, max: 35 },
    location: { lat: 40.7580, lng: -73.9855 },
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Green Turf Grounds',
    description: 'Large outdoor turf facility perfect for football and cricket matches.',
    address: '789 Field Lane, Green Valley',
    ownerId: '2',
    sports: ['Football', 'Cricket'],
    amenities: ['Parking', 'Flood Lights', 'Changing Rooms', 'Spectator Seating'],
    photos: [
      'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg',
      'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg'
    ],
    rating: 4.4,
    reviewCount: 67,
    status: 'approved',
    priceRange: { min: 50, max: 80 },
    location: { lat: 40.6892, lng: -74.0445 },
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Metro Tennis Club',
    description: 'Premium tennis facility with both indoor and outdoor courts.',
    address: '321 Tennis Court, Uptown',
    ownerId: '2',
    sports: ['Tennis'],
    amenities: ['Parking', 'Pro Shop', 'Coaching', 'Restaurant', 'Swimming Pool'],
    photos: [
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
    ],
    rating: 4.9,
    reviewCount: 156,
    status: 'approved',
    priceRange: { min: 30, max: 60 },
    location: { lat: 40.7831, lng: -73.9712 },
    createdAt: new Date('2024-02-10'),
  }
];

export const mockCourts: Court[] = [
  // Elite Sports Complex courts
  { id: '1', facilityId: '1', name: 'Badminton Court 1', sportType: 'Badminton', pricePerHour: 25, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  { id: '2', facilityId: '1', name: 'Badminton Court 2', sportType: 'Badminton', pricePerHour: 25, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  { id: '3', facilityId: '1', name: 'Tennis Court 1', sportType: 'Tennis', pricePerHour: 45, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  { id: '4', facilityId: '1', name: 'Basketball Court 1', sportType: 'Basketball', pricePerHour: 35, operatingHours: { start: '06:00', end: '23:00' }, isActive: true },
  
  // City Badminton Center courts
  { id: '5', facilityId: '2', name: 'Court A', sportType: 'Badminton', pricePerHour: 20, operatingHours: { start: '05:00', end: '23:00' }, isActive: true },
  { id: '6', facilityId: '2', name: 'Court B', sportType: 'Badminton', pricePerHour: 20, operatingHours: { start: '05:00', end: '23:00' }, isActive: true },
  { id: '7', facilityId: '2', name: 'Premium Court', sportType: 'Badminton', pricePerHour: 35, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  
  // Green Turf Grounds courts
  { id: '8', facilityId: '3', name: 'Main Field', sportType: 'Football', pricePerHour: 80, operatingHours: { start: '06:00', end: '21:00' }, isActive: true },
  { id: '9', facilityId: '3', name: 'Practice Ground', sportType: 'Cricket', pricePerHour: 50, operatingHours: { start: '06:00', end: '20:00' }, isActive: true },
  
  // Metro Tennis Club courts
  { id: '10', facilityId: '4', name: 'Center Court', sportType: 'Tennis', pricePerHour: 60, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  { id: '11', facilityId: '4', name: 'Court 2', sportType: 'Tennis', pricePerHour: 45, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
  { id: '12', facilityId: '4', name: 'Court 3', sportType: 'Tennis', pricePerHour: 30, operatingHours: { start: '06:00', end: '22:00' }, isActive: true },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '1',
    facilityId: '1',
    courtId: '1',
    date: '2024-12-20',
    timeSlot: { start: '10:00', end: '11:00' },
    status: 'confirmed',
    totalPrice: 25,
    paymentStatus: 'paid',
    createdAt: new Date('2024-12-15'),
  },
  {
    id: '2',
    userId: '1',
    facilityId: '2',
    courtId: '5',
    date: '2024-12-25',
    timeSlot: { start: '18:00', end: '19:00' },
    status: 'confirmed',
    totalPrice: 20,
    paymentStatus: 'paid',
    createdAt: new Date('2024-12-16'),
  },
  {
    id: '3',
    userId: '1',
    facilityId: '4',
    courtId: '10',
    date: '2024-12-18',
    timeSlot: { start: '16:00', end: '17:00' },
    status: 'completed',
    totalPrice: 60,
    paymentStatus: 'paid',
    createdAt: new Date('2024-12-10'),
  },
];