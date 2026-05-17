import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { reservationsApi } from '@/services/domain.service';
import { Reservation } from '@/types';
import { Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ClubReservationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReservations = async () => {
    try {
      const all = await reservationsApi.list();
      setReservations(all);
    } catch {
      setReservations([]);
      toast.error('Impossible de charger les réservations');
    }
  };

  useEffect(() => {
    void loadReservations();
  }, [user?.id]);

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCancel = async (id: string | number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      await reservationsApi.cancel(String(id), 'Annulation par le club');
      await loadReservations();
      toast.success('Réservation annulée avec succès');
    }
  };

  const handleEdit = (reservation: Reservation) => {
    navigate(`/club/edit-request/${reservation.id}`);
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    partial: reservations.filter(r => r.status === 'partial').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Demandes de Réservation</h1>
            <p className="text-gray-600 mt-2">Gérez vos demandes de réservation de salles</p>
          </div>
          <Button onClick={() => navigate('/club/new-request')}>
            <Plus size={20} className="mr-2" />
            Nouvelle demande
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Partielles</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.partial}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Refusées</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Annulées</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes mes demandes</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de demande de réservation</p>
                <Button onClick={() => navigate('/club/new-request')}>
                  <Plus size={20} className="mr-2" />
                  Créer ma première demande
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{reservation.eventName}</h3>
                          <Badge status={reservation.status} />
                        </div>
                        {reservation.eventDescription && (
                          <p className="text-sm text-gray-600 mb-1">{reservation.eventDescription}</p>
                        )}
                        {reservation.status === 'cancelled' && reservation.cancellationReason && (
                          <p className="text-sm text-red-600 mb-1">
                            <strong>Raison d'annulation :</strong> {reservation.cancellationReason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Créée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')} •
                          Modifiée le {new Date(reservation.updatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          <Eye size={16} />
                        </Button>
                        {(reservation.status === 'pending' || reservation.status === 'partial') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(reservation)}
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {(reservation.status === 'pending' ||
                          reservation.status === 'approved' ||
                          reservation.status === 'partial') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Créneaux demandés :</p>
                      {reservation.roomSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{slot.roomName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(slot.startDate).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              })} - {new Date(slot.endDate).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {slot.rejectionReason && (
                              <p className="text-sm text-red-600 mt-1">
                                <strong>Raison :</strong> {slot.rejectionReason}
                              </p>
                            )}
                          </div>
                          <Badge status={slot.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Détails de la réservation"
          size="lg"
        >
          {selectedReservation && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Événement</p>
                    <p className="font-medium">{selectedReservation.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <Badge status={selectedReservation.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">
                      {new Date(selectedReservation.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {selectedReservation.eventDescription && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="mt-1">{selectedReservation.eventDescription}</p>
                  </div>
                )}
                {selectedReservation.status === 'cancelled' && selectedReservation.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded">
                    <p className="text-sm text-red-600">
                      <strong>Raison d'annulation :</strong> {selectedReservation.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Créneaux demandés</h3>
                <div className="space-y-3">
                  {selectedReservation.roomSlots.map((slot) => (
                    <div key={slot.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{slot.roomName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Du {new Date(slot.startDate).toLocaleString('fr-FR')}
                            <br />
                            Au {new Date(slot.endDate).toLocaleString('fr-FR')}
                          </p>
                          {slot.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded">
                              <p className="text-sm text-red-600">
                                <strong>Raison du refus :</strong> {slot.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <Badge status={slot.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
