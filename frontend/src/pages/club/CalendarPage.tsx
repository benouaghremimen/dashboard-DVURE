import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calendarApi, roomsApi } from '@/services/domain.service';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [rooms, setRooms] = useState<any[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<any[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await roomsApi.list();
        setRooms(roomsData);
      } catch {
        setRooms([]);
        toast.error("Impossible de charger les salles");
      }
    };
    void loadRooms();
  }, []);

  useEffect(() => {
    const loadCalendar = async () => {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      try {
        const slots = await calendarApi.list(dayStart.toISOString(), dayEnd.toISOString());
        setCalendarSlots(slots);
      } catch {
        setCalendarSlots([]);
        toast.error("Impossible de charger le calendrier");
      }
    };
    void loadCalendar();
  }, [currentDate, viewMode]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const filteredRooms = selectedRoom === 'all' ? rooms : rooms.filter(r => String(r.id) === selectedRoom);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isHourReserved = (roomId: string | number, hour: number) => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const hourStart = new Date(dayStart);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(dayStart);
    hourEnd.setHours(hour + 1, 0, 0, 0);

    return calendarSlots.some((slot: any) => {
      if (String(slot.roomId) !== String(roomId)) return false;
      if (!slot.start || !slot.end) return false;
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return start < hourEnd && end > hourStart;
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendrier des Salles</h1>
          <p className="text-gray-600 mt-2">Consultez les disponibilités et réservations</p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'day' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Jour
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Semaine
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Mois
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="font-medium text-gray-900 min-w-[200px] text-center">
                  {formatDate(currentDate)}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Aujourd'hui
                </Button>
              </div>

              {/* Room Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les salles</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Vue {viewMode === 'day' ? 'Journalière' : viewMode === 'week' ? 'Hebdomadaire' : 'Mensuelle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRooms.map(room => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600">Capacité: {room.capacity} personnes</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      room.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {/* Time slots simulation */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                    {hours.map((hour) => {
                      const hasReservation = isHourReserved(room.id, hour);

                      return (
                        <div
                          key={hour}
                          className={`text-center p-2 rounded text-sm ${
                            hasReservation
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer'
                          }`}
                        >
                          {String(hour).padStart(2, '0')}:00
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-gray-600">Réservé</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
