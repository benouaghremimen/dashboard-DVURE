import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    requestPasswordReset: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.patch('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },
};

export default authService;
