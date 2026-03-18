import { api } from '../../lib/api';
import type { Listing } from '../../lib/types';

// Normalize a single listing from MongoDB response to frontend Listing type
function normalizeListing(raw: any): Listing {
    const id = raw._id?.toString() || raw.id?.toString() || '';
    return {
        ...raw,
        id,
        _id: id,
        owner_id: raw.ownerId?.toString() || raw.owner_id?.toString() || '',
        owner_name: raw.owner_name || raw.ownerId?.name || 'Unknown',
        owner_phone: raw.owner_phone || '',
        name: raw.name || '',
        address: raw.address || '',
        lat: raw.location?.coordinates?.[1] || raw.lat || 0,
        lng: raw.location?.coordinates?.[0] || raw.lng || 0,
        total_rooms: raw.totalRooms || raw.total_rooms || 0,
        available_rooms: raw.availableRooms || raw.available_rooms || 0,
        rules: raw.rules || [],
        price_min: raw.priceMin || raw.price_min || 0,
        price_max: raw.priceMax || raw.price_max || 0,
        amenities: raw.amenities || [],
        status: raw.status || 'active',
        photos: (raw.photos || []).map((p: any, idx: number) => {
            // Backend Listing model stores photos as string[] (URLs)
            if (typeof p === 'string') {
                return {
                    photo_id: `photo_${idx}`,
                    listing_id: id,
                    url: p,
                    is_cover: idx === 0,
                    is_hidden: false,
                };
            }
            // Alternatively, if photos are stored as objects
            return {
                photo_id: p._id || p.photo_id || `photo_${idx}`,
                listing_id: id,
                url: p.url || '',
                is_cover: p.is_cover || p.isCover || idx === 0,
                is_hidden: p.is_hidden || false,
            };
        }),
        rooms: (raw.rooms || []).map((r: any) => ({
            room_id: r._id?.toString() || r.room_id?.toString() || '',
            listing_id: id,
            type: r.type || '',
            size_sqm: r.sizeSqm || r.size_sqm || 0,
            price: r.price || 0,
            inclusions: r.inclusions || [],
            is_available: r.isAvailable !== undefined ? r.isAvailable : (r.is_available !== undefined ? r.is_available : true),
            model_3d_url: r.model3dUrl || r.model_3d_url || undefined,
        })),
        reviews: (raw.reviews || []).map((rev: any) => ({
            review_id: rev._id?.toString() || rev.review_id?.toString() || '',
            _id: rev._id?.toString() || '',
            user_id: rev.userId?.toString() || rev.user_id?.toString() || '',
            listing_id: id,
            rating: rev.rating || 0,
            comment: rev.comment || '',
            created_at: rev.createdAt || rev.created_at || '',
            user: rev.userId && typeof rev.userId === 'object'
                ? { name: rev.userId.name || '', avatar: rev.userId.avatar || '' }
                : (rev.user || { name: '', avatar: '' }),
        })),
        created_at: raw.createdAt || raw.created_at || '',
        updated_at: raw.updatedAt || raw.updated_at || '',
    };
}

export const listingService = {
    getAll: async (query?: string) => {
        const queryString = query ? `?${query}` : '';
        const data = await api.get<any[]>(`/listings${queryString}`);
        return data.map(normalizeListing);
    },

    getFeatured: async () => {
        const data = await api.get<any[]>('/listings/featured');
        return data.map(normalizeListing);
    },

    getById: async (id: string | number) => {
        const data = await api.get<any>(`/listings/${id}`);
        return normalizeListing(data);
    },

    create: (data: Partial<Listing>) => {
        return api.post<Listing>('/listings', data);
    },

    update: (id: string | number, data: Partial<Listing>) => {
        return api.put<Listing>(`/listings/${id}`, data);
    },

    delete: (id: string | number) => {
        return api.delete<{ message: string }>(`/listings/${id}`);
    },

    getAdminListings: async () => {
        const data = await api.get<any[]>('/admin/listings');
        return data.map(normalizeListing);
    },

    bulkUpdateListingsStatus: (listingIds: string[], status: string) => {
        return api.patch('/admin/listings/bulk-status', { listingIds, status });
    },

    bulkDeleteListings: (listingIds: string[]) => {
        return api.delete('/admin/listings/bulk', { listingIds });
    }
};
