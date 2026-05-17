export interface User {
  id: number | string;
  email: string;
  name?: string;
  clubName?: string;
  role: 'ADMIN' | 'CLUB';
  isActive: boolean;
  active?: boolean;
  createdAt: Date;
}

export interface Room {
  id: number | string;
  name: string;
  capacity: number;
  isEnabled: boolean;
  available?: boolean;
  description?: string;
  disabledFrom?: string | null;
  disabledTo?: string | null;
}

export interface RoomSlot {
  id: string;
  roomId: string;
  roomName?: string;
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'available' | 'booked' | 'unavailable';
  label?: string;
  rejectionReason?: string;
}

export interface Reservation {
  id: number | string;
  eventName: string;
  event_name?: string;
  description?: string;
  eventDescription?: string;
  roomName?: string;
  roomId?: string;
  room?: Room;
  roomSlots: RoomSlot[];
  status: 'pending' | 'approved' | 'rejected' | 'partial' | 'cancelled';
  createdBy: string;
  clubId?: string;
  clubName?: string;
  contactName?: string;
  startDate: Date;
  endDate: Date;
  updatedAt: Date;
  createdAt: Date;
  cancellationReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
