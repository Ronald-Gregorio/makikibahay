import { api } from '../../lib/api';

export const dashboardService = {
    getOwnerMetrics: () => {
        return api.get<any>('/owner/metrics');
    },

    getOwnerListings: () => {
        return api.get<any[]>('/owner/listings');
    },

    getAdminMetrics: () => {
        return api.get<any>('/admin/metrics');
    },

    getAdminUsers: () => {
        return api.get<any[]>('/admin/users');
    },

    getAdminSystemLogs: () => {
        return api.get<any[]>('/admin/logs');
    },

    getAdminTickets: () => {
        return api.get<any[]>('/admin/tickets');
    },

    getAdminReviews: () => {
        return api.get<any[]>('/admin/reviews');
    }
};
