import { api } from '../../lib/api';

export const dashboardService = {
    getOwnerMetrics: () => {
        return api.get<any>('/dashboard/owner/metrics');
    },

    getOwnerListings: () => {
        return api.get<any[]>('/dashboard/owner/listings');
    },

    getOwnerSummary: () => {
        return api.get<any>('/dashboard/owner/summary');
    },

    getOwnerTenants: () => {
        return api.get<any[]>('/dashboard/owner/tenants');
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
    },

    bulkUpdateUsersStatus: (userIds: string[], status: string) => {
        return api.patch('/admin/users/bulk-status', { userIds, status });
    },

    bulkDeleteUsers: (userIds: string[]) => {
        return api.delete('/admin/users/bulk', { data: { userIds } });
    },

    bulkNotifyUsers: (userIds: string[], message: string) => {
        return api.post('/admin/users/bulk-notify', { userIds, message });
    }
};
