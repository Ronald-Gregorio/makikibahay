import { api } from '../../lib/api';
import type { User, Listing, Review } from '../../lib/types';

export const userService = {
    getProfile: () => {
        return api.get<User>('/users/profile');
    },

    updateProfile: (data: Partial<User>) => {
        return api.put<User>('/users/profile', data);
    },

    getFavorites: () => {
        return api.get<Listing[]>('/users/favorites');
    },

    addFavorite: (listingId: number | string) => {
        return api.post<{ message: string; favorite_id: number }>('/users/favorites', { listing_id: listingId });
    },

    removeFavorite: (listingId: number | string) => {
        return api.delete<{ message: string }>(`/users/favorites/${listingId}`);
    },

    getMyReviews: () => {
        return api.get<Review[]>('/users/reviews');
    }
};
