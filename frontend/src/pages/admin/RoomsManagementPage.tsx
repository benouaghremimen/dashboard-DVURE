import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { roomsApi } from '@/services/domain.service';
import { Room } from '@/types';
import { Plus, Edit, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    available: true,
    description: '',
    disabledFrom: '',
    disabledTo: '',
  });

  const toLocalInputValue = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const isNowInDisabledPeriod = (room: Room) => {
    if (!room.disabledFrom || !room.disabledTo) return false;
    const now = new Date();
    const from = new Date(room.disabledFrom);
    const to = new Date(room.disabledTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;
    return now >= from && now <= to;
  };

  const loadRooms = async () => {
    const all = await roomsApi.list();
    setRooms(all);
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity.toString(),
        available: !!room.available,
        description: room.description || '',
        disabledFrom: toLocalInputValue(room.disabledFrom),
        disabledTo: toLocalInputValue(room.disabledTo),
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        capacity: '',
        available: true,
        description: '',
        disabledFrom: '',
        disabledTo: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasDisableDates = !!formData.disabledFrom || !!formData.disabledTo;
    if (hasDisableDates && (!formData.disabledFrom || !formData.disabledTo)) {
      toast.error("Veuillez renseigner la date de début et la date de fin d'indisponibilité.");
      return;
    }

    if (formData.disabledFrom && formData.disabledTo) {
      const from = new Date(formData.disabledFrom);
      const to = new Date(formData.disabledTo);
      if (to <= from) {
        toast.error('La date de fin doit être après la date de début.');
        return;
      }
    }

    const roomData = {
      name: formData.name,
      capacity: parseInt(formData.capacity, 10),
      isEnabled: formData.available,
      disabledFrom: formData.disabledFrom ? new Date(formData.disabledFrom).toISOString() : null,
      disabledTo: formData.disabledTo ? new Date(formData.disabledTo).toISOString() : null,
    };

    if (editingRoom) {
      await roomsApi.update(String(editingRoom.id), roomData);
      toast.success('Salle modifiée avec succès');
    } else {
      await roomsApi.create(roomData);
      toast.success('Salle créée avec succès');
    }

    await loadRooms();
    handleCloseModal();
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      await roomsApi.remove(String(id));
      await loadRooms();
      toast.success('Salle supprimée avec succès');
    }
  };

  const handleToggleAvailability = async (room: Room) => {
    await roomsApi.update(String(room.id), { isEnabled: !room.available });
    await loadRooms();
    toast.success(`Salle ${!room.available ? 'activée' : 'désactivée'}`);
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Salles</h1>
            <p className="text-gray-600 mt-2">Gérez les salles disponibles pour les réservations</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Ajouter une salle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total des salles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{rooms.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Salles disponibles</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {rooms.filter(r => r.available).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Salles indisponibles</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {rooms.filter(r => !r.available).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des salles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        room.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.available ? 'Disponible' : 'Indisponible'}
                      </span>
                      {room.available && isNowInDisabledPeriod(room) && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Indisponible (période)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Capacité : {room.capacity} personnes
                    </p>
                    {room.disabledFrom && room.disabledTo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Indisponible du {new Date(room.disabledFrom).toLocaleString('fr-FR')} au {new Date(room.disabledTo).toLocaleString('fr-FR')}
                      </p>
                    )}
                    {room.description && (
                      <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleAvailability(room)}
                    >
                      {room.available ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenModal(room)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingRoom ? 'Modifier la salle' : 'Ajouter une salle'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom de la salle"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Amphithéâtre A"
              required
            />

            <Input
              label="Capacité"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="200"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la salle et équipements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Salle disponible
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indisponible du
                </label>
                <input
                  type="datetime-local"
                  value={formData.disabledFrom}
                  onChange={(e) => setFormData({ ...formData, disabledFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indisponible au
                </label>
                <input
                  type="datetime-local"
                  value={formData.disabledTo}
                  onChange={(e) => setFormData({ ...formData, disabledTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Laissez vide pour ne pas définir d&apos;indisponibilité temporaire.
            </p>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingRoom ? 'Modifier' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
