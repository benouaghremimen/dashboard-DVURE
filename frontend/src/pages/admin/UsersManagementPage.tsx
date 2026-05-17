import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { usersApi } from '@/services/domain.service';
import { User } from '@/types';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clubName: '',
    password: '',
  });

  const loadUsers = async () => {
    const all = await usersApi.list();
    setUsers(all.filter(u => u.role === 'CLUB'));
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email,
        clubName: user.clubName || '',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        clubName: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const payload: {
        email?: string;
        role?: 'ADMIN' | 'CLUB';
        password?: string;
        name?: string;
        clubName?: string;
      } = {
        email: formData.email,
        role: 'CLUB',
        name: formData.name,
        clubName: formData.clubName,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      await usersApi.update(String(editingUser.id), payload);
      toast.success('Utilisateur modifié avec succès');
    } else {
      if (!formData.password.trim()) {
        toast.error('Veuillez saisir un mot de passe.');
        return;
      }
      await usersApi.create({
        email: formData.email,
        password: formData.password.trim(),
        role: 'CLUB',
        name: formData.name,
        clubName: formData.clubName,
      });
      toast.success('Utilisateur créé avec succès');
    }

    await loadUsers();
    if (editingUser) {
      handleCloseModal();
    } else {
      setFormData({
        name: '',
        email: '',
        clubName: '',
        password: '',
      });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await usersApi.remove(String(id));
      await loadUsers();
      toast.success('Utilisateur supprimé avec succès');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-2">Gérez les comptes clubs et leurs accès</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UsersIcon className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Club</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date création</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{user.clubName}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenModal(user)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom du club"
              value={formData.clubName}
              onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
              placeholder="Club Robotique INSAT"
              required
            />

            <Input
              label="Nom du contact"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Prénom Nom"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="club@insat.tn"
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? 'Laisser vide pour ne pas changer' : 'Saisir un mot de passe'}
              required={!editingUser}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingUser ? 'Modifier' : 'Créer'}
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
