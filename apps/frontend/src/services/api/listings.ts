import { api } from '../../lib/api';
import type { Listing } from '../../lib/types';

export const listingService = {
    getAll: (query?: string) => {
        const queryString = query ? `?${query}` : '';
        return api.get<Listing[]>(`/listings${queryString}`);
    },

    getFeatured: () => {
        return api.get<Listing[]>('/listings/featured');
    },

    getById: (id: string | number) => {
        return api.get<Listing>(`/listings/${id}`);
    },

    create: (data: Partial<Listing>) => {
        return api.post<Listing>('/listings', data);
    },

    update: (id: string | number, data: Partial<Listing>) => {
        return api.put<Listing>(`/listings/${id}`, data);
    },

    delete: (id: string | number) => {
        return api.delete<{ message: string }>(`/listings/${id}`);
    }
};
