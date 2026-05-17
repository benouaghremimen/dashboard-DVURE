import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '@/services/domain.service';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Reservation } from '@/types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const reservations = await reservationsApi.listAdmin();
      setAllReservations(reservations);
    };
    void loadData();
  }, []);

  const pendingReservations = allReservations.filter(r => r.status === 'pending');
  const approvedCount = allReservations.filter(r => r.status === 'approved').length;
  const rejectedCount = allReservations.filter(r => r.status === 'rejected').length;
  const occupancyRate = allReservations.length
    ? Math.round((approvedCount / allReservations.length) * 100)
    : 0;

  const chartData = useMemo(() => {
    const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    allReservations.forEach((reservation) => {
      const date = reservation.createdAt ? new Date(reservation.createdAt) : new Date();
      buckets[date.getDay()] += 1;
    });
    return labels.map((name, index) => ({ name, reservations: buckets[index] }));
  }, [allReservations]);

  const formatReservationDate = (value?: Date) =>
    (value ? new Date(value) : new Date()).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });


  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de la gestion des salles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{allReservations.length}</p>
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
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingReservations.length}</p>
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
                  <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
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
                  <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
                </div>
                <XCircle className="text-red-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux d'occupation</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{occupancyRate}%</p>
                </div>
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Pending Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Réservations par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reservations" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Demandes en attente</CardTitle>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/admin/reservations')}
              >
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              {pendingReservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {pendingReservations.map((reservation) => (
                    <div 
                      key={reservation.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/reservations')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{reservation.eventName}</h4>
                        <Badge status={reservation.status} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {reservation.clubName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reservation.roomName} • {formatReservationDate(reservation.startDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/reservations')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                  <Calendar className="text-blue-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900">Gérer les réservations</h3>
                <p className="text-sm text-gray-600 mt-2">Approuver ou refuser les demandes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/rooms')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900">Gérer les salles</h3>
                <p className="text-sm text-gray-600 mt-2">Ajouter ou modifier les salles</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                  <XCircle className="text-purple-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900">Gérer les utilisateurs</h3>
                <p className="text-sm text-gray-600 mt-2">Activer ou désactiver les comptes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}


