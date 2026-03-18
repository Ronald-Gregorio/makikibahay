import { api } from '../../lib/api';

export const savedSearchService = {
    getSavedSearches: () => {
        return api.get<any[]>('/saved-searches');
    },

    saveSearch: (name: string, filters: any) => {
        return api.post('/saved-searches', { name, filters });
    },

    deleteSavedSearch: (id: string) => {
        return api.delete(`/saved-searches/${id}`);
    }
};
