import api from './api';
import { Reservation, Room, User, Notification } from '@/types';

type RawReservationRoom = {
  id: number;
  status: string;
  start_datetime: string;
  end_datetime: string;
  admin_comment?: string | null;
  room?: {
    id: number;
    name: string;
    capacity: number;
    isEnabled: boolean;
    disabledFrom?: string | null;
    disabledTo?: string | null;
  };
};

type RawReservation = {
  id: number;
  event_name: string;
  description: string;
  global_status: string;
  created_at: string;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  club?: {
    id: number;
    email: string;
    name?: string;
    clubName?: string;
    role: 'ADMIN' | 'CLUB';
    isActive: boolean;
  };
  reservationRooms?: RawReservationRoom[];
};

const mapStatus = (value?: string): Reservation['status'] => {
  switch ((value || '').toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'PARTIAL':
      return 'partial';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const mapRoomStatus = (value?: string): 'pending' | 'approved' | 'rejected' => {
  switch ((value || '').toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
};

export const normalizeReservation = (raw: RawReservation): Reservation => {
  const slots = (raw.reservationRooms || []).map((slot) => ({
    id: String(slot.id),
    roomId: String(slot.room?.id || ''),
    roomName: slot.room?.name || 'Salle',
    startDate: slot.start_datetime,
    endDate: slot.end_datetime,
    status: mapRoomStatus(slot.status),
    rejectionReason: slot.admin_comment || '',
  }));

  return {
    id: String(raw.id),
    eventName: raw.event_name,
    event_name: raw.event_name,
    description: raw.description,
    eventDescription: raw.description,
    status: mapStatus(raw.global_status),
    createdBy: raw.club?.name || raw.club?.email || '',
    clubId: raw.club?.id ? String(raw.club.id) : '',
    clubName: raw.club?.clubName || raw.club?.email || '',
    contactName: raw.club?.name || '',
    createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
    updatedAt: raw.created_at ? new Date(raw.created_at) : new Date(),
    cancellationReason: raw.cancellation_reason || undefined,
    roomSlots: slots,
    roomName: slots[0]?.roomName || '',
    roomId: slots[0]?.roomId || '',
    startDate: slots[0]?.startDate ? new Date(slots[0].startDate) : new Date(),
    endDate: slots[0]?.endDate ? new Date(slots[0].endDate) : new Date(),
  };
};

export const roomsApi = {
  async list(): Promise<Room[]> {
    const { data } = await api.get('/rooms');
    return (data || []).map((room: any) => ({
      id: String(room.id),
      name: room.name,
      capacity: room.capacity,
      isEnabled: !!room.isEnabled,
      available: !!room.isEnabled,
      description: room.description || '',
      disabledFrom: room.disabledFrom || null,
      disabledTo: room.disabledTo || null,
    }));
  },
  async create(payload: {
    name: string;
    capacity: number;
    isEnabled?: boolean;
    disabledFrom?: string | null;
    disabledTo?: string | null;
  }) {
    const { data } = await api.post('/rooms', payload);
    return data;
  },
  async update(
    id: string,
    payload: {
      name?: string;
      capacity?: number;
      isEnabled?: boolean;
      disabledFrom?: string | null;
      disabledTo?: string | null;
    },
  ) {
    const { data } = await api.put(`/rooms/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/rooms/${id}`);
    return data;
  },
  async availability(startIso: string, endIso: string): Promise<Room[]> {
    const { data } = await api.get('/rooms/availability', {
      params: { start: startIso, end: endIso },
    });
    return (data || []).map((room: any) => ({
      id: String(room.id),
      name: room.name,
      capacity: room.capacity,
      isEnabled: !!room.isEnabled,
      available: true,
      disabledFrom: room.disabledFrom || null,
      disabledTo: room.disabledTo || null,
    }));
  },
};

export type CalendarSlot = {
  roomId: string;
  roomName?: string;
  start: string;
  end: string;
  available?: boolean;
  title?: string;
};

export const calendarApi = {
  async list(startIso: string, endIso: string): Promise<CalendarSlot[]> {
    const { data } = await api.get('/calendar', {
      params: { start: startIso, end: endIso },
    });
    return (data || []).map((slot: any) => ({
      roomId: String(slot.roomId ?? slot.room?.id ?? ''),
      roomName: slot.roomName || slot.room?.name || '',
      start: slot.start || slot.startDate || slot.start_datetime,
      end: slot.end || slot.endDate || slot.end_datetime,
      available: slot.available ?? false,
      title: slot.title || '',
    }));
  },
};

export const reservationsApi = {
  async list(): Promise<Reservation[]> {
    const { data } = await api.get('/reservations');
    return (data || []).map((r: RawReservation) => normalizeReservation(r));
  },
  async listAdmin(): Promise<Reservation[]> {
    const { data } = await api.get('/admin/reservations');
    return (data || []).map((r: RawReservation) => normalizeReservation(r));
  },
  async create(payload: {
    event_name: string;
    description: string;
    type: 'ANNUELLE' | 'HEBDO' | 'UNIQUE';
    rooms: { roomId: number; startTime: string; endTime: string }[];
  }) {
    const { data } = await api.post('/reservations', payload);
    return normalizeReservation(data);
  },
  async update(
    id: string,
    payload: {
      event_name: string;
      description: string;
      type: 'ANNUELLE' | 'HEBDO' | 'UNIQUE';
      rooms: { roomId: number; startTime: string; endTime: string }[];
    },
  ) {
    const { data } = await api.put(`/reservations/${id}`, payload);
    return normalizeReservation(data);
  },
  async remove(id: string) {
    const { data } = await api.delete(`/reservations/${id}`);
    return data;
  },
  async cancel(id: string | number, reason?: string) {
    const { data } = await api.patch(`/reservations/${id}/cancel`, { reason });
    return data;
  },
  async updateRoomStatus(
    roomReservationId: number,
    status: 'APPROVED' | 'REJECTED',
    adminComment?: string,
  ) {
    const { data } = await api.patch('/admin/reservations/room-status', {
      roomReservationId,
      status,
      adminComment,
    });
    return data;
  },
  async cancelReservation(id: string | number, reason: string) {
    const { data } = await api.patch(`/admin/reservations/${id}/cancel`, {
      reason,
    });
    return data;
  },
};

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get('/users');
    return (data || []).map((u: any) => ({
      id: String(u.id),
      email: u.email,
      role: u.role,
      isActive: !!u.isActive,
      active: !!u.isActive,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      name: u.name || '',
      clubName: u.clubName || u.email,
    }));
  },
  async create(payload: {
    email: string;
    password: string;
    role: 'ADMIN' | 'CLUB';
    name?: string;
    clubName?: string;
  }) {
    const { data } = await api.post('/users', payload);
    return data;
  },
  async update(
    id: string,
    payload: {
      email?: string;
      password?: string;
      role?: 'ADMIN' | 'CLUB';
      isActive?: boolean;
      name?: string;
      clubName?: string;
    },
  ) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

export const notificationsApi = {
  async list(): Promise<{ items: Notification[]; unread: number }> {
    const { data } = await api.get('/notifications');
    return {
      items: (data?.items || []).map((n: any) => ({
        id: String(n.id),
        userId: String(n.user?.id || ''),
        title: n.title,
        message: n.message,
        read: !!n.isRead,
        createdAt: n.createdAt || n.created_at || new Date().toISOString(),
      })),
      unread: data?.unread || 0,
    };
  },
  async markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },
  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },
};
