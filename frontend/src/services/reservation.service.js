import api from './api';

export const reservationService = {
    getAll: async () => {
        const response = await api.get('/reservations');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/reservations/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/reservations', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/reservations/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/reservations/${id}`);
        return response.data;
    },
};

export default reservationService;
