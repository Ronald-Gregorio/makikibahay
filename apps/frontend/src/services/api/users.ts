import { api } from '../../lib/api';

export const userService = {
    getFavorites: () => {
        return api.get<any[]>('/users/me/favorites');
    },

    addFavorite: (listingId: string) => {
        return api.post('/users/me/favorites', { listingId });
    },

    removeFavorite: (listingId: string) => {
        return api.delete(`/users/me/favorites/${listingId}`);
    },

    getMyReviews: () => {
        return api.get<any[]>('/reviews/me');
    }
};
