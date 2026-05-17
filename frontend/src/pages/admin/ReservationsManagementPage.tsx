import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { reservationsApi } from '@/services/domain.service';
import { Reservation, RoomSlot } from '@/types';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReservationsManagementPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'partial'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<RoomSlot | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadReservations = async () => {
    const all = await reservationsApi.listAdmin();
    setReservations(all);
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleApproveSlot = async (_reservationId: string | number, slotId: string | number) => {
    await reservationsApi.updateRoomStatus(Number(slotId), 'APPROVED');
    await loadReservations();
    toast.success('Créneau approuvé');
  };

  const handleOpenRejectModal = (reservation: Reservation, slot: RoomSlot) => {
    setSelectedReservation(reservation);
    setSelectedSlot(slot);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleOpenCancelModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleRejectSlot = async () => {
    if (!selectedReservation || !selectedSlot) return;

    await reservationsApi.updateRoomStatus(
      Number(selectedSlot.id),
      'REJECTED',
      rejectionReason.trim(),
    );
    await loadReservations();
    setIsRejectModalOpen(false);
    setSelectedSlot(null);
    toast.success('Créneau refusé');
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    if (!cancelReason.trim()) return;

    await reservationsApi.cancelReservation(selectedReservation.id, cancelReason.trim());
    await loadReservations();
    setIsCancelModalOpen(false);
    toast.success('Réservation annulée');
  };

  const filteredReservations = filterStatus === 'all'
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
    partial: reservations.filter(r => r.status === 'partial').length,
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600 mt-2">Approuvez ou refusez les demandes de réservation</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('all')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Calendar className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('pending')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('approved')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approuvées</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('partial')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Partielles</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.partial}</p>
                </div>
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('rejected')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refusées</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
                <XCircle className="text-red-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {filterStatus === 'all' ? 'Toutes les réservations' : `Réservations ${filterStatus}`}
            </CardTitle>
            {filterStatus !== 'all' && (
              <Button variant="secondary" size="sm" onClick={() => setFilterStatus('all')}>
                Réinitialiser le filtre
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune réservation trouvée</p>
              ) : (
                filteredReservations.map((reservation) => (
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
                        <p className="text-sm text-gray-600">{reservation.clubName}</p>
                        {reservation.contactName && (
                          <p className="text-sm text-gray-500">Contact: {reservation.contactName}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{reservation.eventDescription}</p>
                        {reservation.status === 'cancelled' && reservation.cancellationReason && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Raison d&apos;annulation :</strong> {reservation.cancellationReason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(reservation)}
                      >
                        Détails
                      </Button>
                    </div>

                    <div className="space-y-2">
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
                                minute: '2-digit'
                              })} - {new Date(slot.endDate).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {slot.rejectionReason && (
                              <p className="text-sm text-red-600 mt-1">
                                <strong>Raison :</strong> {slot.rejectionReason}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge status={slot.status} />
                            {slot.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleApproveSlot(reservation.id, slot.id)}
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleOpenRejectModal(reservation, slot)}
                                >
                                  <XCircle size={16} className="mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
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
                    <p className="text-sm text-gray-600">Club</p>
                    <p className="font-medium">{selectedReservation.clubName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{selectedReservation.contactName || '-'}</p>
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
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="mt-1">{selectedReservation.eventDescription}</p>
                </div>
                {selectedReservation.status === 'cancelled' && selectedReservation.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded">
                    <p className="text-sm text-red-600">
                      <strong>Raison d&apos;annulation :</strong> {selectedReservation.cancellationReason}
                    </p>
                  </div>
                )}
                {selectedReservation.status !== 'cancelled' && (
                  <div className="mt-4">
                    <Button
                      variant="danger"
                      onClick={() => handleOpenCancelModal(selectedReservation)}
                    >
                      Annuler la réservation
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Créneaux demandés</h3>
                <div className="space-y-3">
                  {selectedReservation.roomSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
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

        {/* Rejection Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Refuser le créneau"
          size="md"
        >
          {selectedSlot && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedSlot.roomName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedSlot.startDate).toLocaleString('fr-FR')} - 
                  {new Date(selectedSlot.endDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison du refus <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi ce créneau est refusé..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="danger"
                  onClick={handleRejectSlot}
                  className="flex-1"
                  disabled={!rejectionReason.trim()}
                >
                  Confirmer le refus
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Reservation Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Annuler la réservation"
          size="md"
        >
          {selectedReservation && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedReservation.eventName}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedReservation.clubName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison d&apos;annulation <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Expliquez la raison et demandez de refaire une réservation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="danger"
                  onClick={handleCancelReservation}
                  className="flex-1"
                  disabled={!cancelReason.trim()}
                >
                  Confirmer l&apos;annulation
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
