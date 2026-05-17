import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { reservationsApi, roomsApi } from '@/services/domain.service';
import { RoomSlot } from '@/types';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function NewReservationPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const totalMins = i * 15;
    const hours = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const mins = String(totalMins % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  });

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const allRooms = await roomsApi.list();
        setRooms(allRooms);
      } catch {
        setRooms([]);
        toast.error("Impossible de charger les salles");
      }
    };
    void loadRooms();
  }, []);

  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
  });

  const [roomSlots, setRoomSlots] = useState<Omit<RoomSlot, 'id' | 'roomName' | 'status'>[]>([
    {
      roomId: '',
      startDate: '',
      endDate: '',
    },
  ]);

  const handleAddSlot = () => {
    setRoomSlots([
      ...roomSlots,
      {
        roomId: '',
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (roomSlots.length > 1) {
      setRoomSlots(roomSlots.filter((_, i) => i !== index));
    }
  };

  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...roomSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setRoomSlots(newSlots);
  };
  const updateDatePart = (index: number, field: 'startDate' | 'endDate', dateValue: string) => {
    const existing = roomSlots[index][field] || '';
    const timePart = existing.slice(11, 16) || '00:00';
    handleSlotChange(index, field, dateValue ? `${dateValue}T${timePart}` : '');
  };
  const updateTimePart = (index: number, field: 'startDate' | 'endDate', timeValue: string) => {
    const existing = roomSlots[index][field] || '';
    const datePart = existing.slice(0, 10);
    handleSlotChange(index, field, datePart ? `${datePart}T${timeValue}` : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (roomSlots.some(slot => !slot.roomId || !slot.startDate || !slot.endDate)) {
      toast.error('Veuillez remplir tous les créneaux');
      return;
    }

    const invalidDates = roomSlots.some(slot => new Date(slot.endDate) <= new Date(slot.startDate));
    if (invalidDates) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }

    try {
      await reservationsApi.create({
        event_name: formData.eventName,
        description: formData.eventDescription,
        type: 'UNIQUE',
        rooms: roomSlots.map(slot => ({
          roomId: Number(slot.roomId),
          startTime: new Date(slot.startDate as string).toISOString(),
          endTime: new Date(slot.endDate as string).toISOString(),
        })),
      });

      toast.success('Demande de réservation créée avec succès');
      navigate('/club/requests');
    } catch (error) {
      if (isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        const message = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;

        if (error.response?.status === 409) {
          toast.error(message || 'Conflit de réservation: la salle est déjà occupée sur ce créneau.');
          return;
        }

        if (error.response?.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }

        toast.error(message || 'Impossible de créer la réservation.');
        return;
      }

      toast.error('Une erreur inattendue est survenue.');
    }
  };
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Demande de Réservation</h1>
          <p className="text-gray-600 mt-2">Réservez une ou plusieurs salles pour votre événement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nom de l'événement"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="Workshop Arduino, Conférence IA, etc."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description de l'événement
                </label>
                <textarea
                  value={formData.eventDescription}
                  onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                  placeholder="Décrivez votre événement, son objectif, le nombre de participants attendus..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Room Slots */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salles et créneaux horaires</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddSlot}>
                <Plus size={16} className="mr-1" />
                Ajouter un créneau
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomSlots.map((slot, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Créneau {index + 1}</h4>
                    {roomSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salle <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={slot.roomId}
                      onChange={(e) => handleSlotChange(index, 'roomId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner une salle</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} (Capacité: {room.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date et heure de début <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={slot.startDate ? slot.startDate.slice(0, 10) : ''}
                          onChange={(e) => updateDatePart(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <select
                          value={slot.startDate ? slot.startDate.slice(11, 16) : ''}
                          onChange={(e) => updateTimePart(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Heure</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date et heure de fin <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={slot.endDate ? slot.endDate.slice(0, 10) : ''}
                          onChange={(e) => updateDatePart(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <select
                          value={slot.endDate ? slot.endDate.slice(11, 16) : ''}
                          onChange={(e) => updateTimePart(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Heure</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Astuce :</strong> Vous pouvez demander plusieurs salles pour un même événement, 
                  chacune avec des horaires différents. L'administration pourra approuver ou refuser chaque créneau individuellement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              <Calendar size={20} className="mr-2" />
              Soumettre la demande
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/club/requests')}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
