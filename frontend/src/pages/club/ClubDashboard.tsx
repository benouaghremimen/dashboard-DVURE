import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { reservationsApi } from '@/services/domain.service';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/types';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ClubDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const all = await reservationsApi.list();
        setReservations(all.filter(r => r.clubId === String(user?.id)));
      } catch {
        setReservations([]);
        toast.error("Impossible de charger les reservations");
      }
    };
    void loadReservations();
  }, [user?.id]);

  const stats = {
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
    total: reservations.length,
  };

  const recentReservations = reservations.slice(0, 5);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user?.clubName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Calendar className="text-blue-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approuvées</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refusées</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
                <XCircle className="text-red-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/club/calendar')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <Calendar className="text-blue-600" size={32} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Consulter le calendrier</h3>
                  <p className="text-sm text-gray-600 mt-1">Voir les disponibilités des salles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/club/new-request')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-lg">
                  <Plus className="text-green-600" size={32} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nouvelle demande</h3>
                  <p className="text-sm text-gray-600 mt-1">Réserver une salle pour un événement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Demandes récentes</CardTitle>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/club/requests')}
            >
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune demande pour le moment</p>
            ) : (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div 
                    key={reservation.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reservation.eventName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {reservation.roomName} • {new Date(reservation.startDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge status={reservation.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
