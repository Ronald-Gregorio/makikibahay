import { api } from '../../lib/api';
import type { Listing } from '../../lib/types';

// Normalize a single listing from MongoDB response to frontend Listing type
function normalizeListing(raw: any): Listing {
    const id = raw._id?.toString() || raw.id?.toString() || '';
    return {
        ...raw,
        id,
        _id: id,
        ownerId: raw.ownerId?._id?.toString() || raw.ownerId?.toString() || raw.owner_id || '',
        
        // 1. Core Property Info
        listingName: raw.listingName || raw.name || '',
        propertyType: raw.propertyType || raw.type || 'Apartment',
        description: raw.description || '',
        rating: raw.rating || 0,

        // 2. Media & Virtual Viewing
        photos: (raw.photos || []).map((p: any) => typeof p === 'string' ? p : (p.url || '')),
        video: raw.video || '',
        virtualTour360: raw.virtualTour360 || '',
        hasEnhancedViewing: raw.hasEnhancedViewing || !!raw.virtualTour360,
        floorPlans: (raw.floorPlans || []).map((p: any) => typeof p === 'string' ? p : (p.url || '')),

        // 3. Location & Neighborhood
        fullAddress: raw.fullAddress || raw.address || '',
        lat: raw.mapLoc?.coordinates?.[1] || raw.location?.coordinates?.[1] || raw.lat || 0,
        lng: raw.mapLoc?.coordinates?.[0] || raw.location?.coordinates?.[0] || raw.lng || 0,
        neighborhoodNear: raw.neighborhoodNear || [],
        transportationOptions: raw.transportationOptions || [],

        // 4. Room, Unit Details & Pricing
        roomType: raw.roomType || '',
        availableRooms: raw.availableRooms || raw.available_rooms || 0,
        bedrooms: raw.bedrooms || 'Studio',
        bathrooms: raw.bathrooms || '1',
        squareFeet: raw.squareFeet || 0,
        monthlyRent: raw.monthlyRent || raw.priceMin || 0,
        moveInDate: raw.moveInDate || '',

        // 5. Fees & Policies
        securityDeposit: raw.securityDeposit || 0,
        advancePayment: raw.advancePayment || 0,
        applicationReviewFee: raw.applicationReviewFee || 0,
        specialtyProperty: raw.specialtyProperty || 'None',

        // 6. Pet Policy
        petPolicy: raw.petPolicy || 'No Pets',

        // 7. House Rules
        hasCurfew: !!raw.hasCurfew,
        visitorsAllowed: raw.visitorsAllowed !== undefined ? !!raw.visitorsAllowed : true,
        smokingAllowed: !!raw.smokingAllowed,
        cookingAllowed: raw.cookingAllowed !== undefined ? !!raw.cookingAllowed : true,
        quietHours: raw.quietHours || '',

        // 8. Amenities
        airConditioning: !!raw.airConditioning,
        wifi: !!raw.wifi,
        washer: !!raw.washer,
        dryer: !!raw.dryer,
        utilitiesIncluded: !!raw.utilitiesIncluded,
        dishwasher: !!raw.dishwasher,
        parkingType: raw.parkingType || 'None',
        laundryFacilities: !!raw.laundryFacilities,
        kitchen: !!raw.kitchen,
        appliancesIncluded: !!raw.appliancesIncluded,

        // 9. Normalized Rooms
        rooms: (raw.rooms || []).map((r: any) => ({
            room_id: r._id?.toString() || r.room_id?.toString() || r.id?.toString() || '',
            listing_id: id,
            type: r.type || 'Standard',
            size_sqm: r.sizeSqm || r.size_sqm || 0,
            price: r.price || 0,
            inclusions: Array.isArray(r.inclusions) ? r.inclusions : [r.inclusions].filter(Boolean),
            is_available: r.isAvailable ?? r.is_available ?? true,
            model_3d_url: r.model3dUrl || r.model_3d_url || '',
        })),

        // Legacy fields for compatibility
        name: raw.listingName || raw.name || '',
        address: raw.fullAddress || raw.address || '',
        priceMin: raw.monthlyRent || raw.priceMin || 0,
        priceMax: raw.monthlyRent || raw.priceMax || 0,
        totalRooms: (raw.rooms || []).length || raw.totalRooms || raw.total_rooms || 0,
        amenities: raw.amenities || [],
        rules: raw.rules || [],
        status: raw.status || 'Active',
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

    getOwnerListings: async () => {
        const data = await api.get<any[]>('/listings/owner');
        return data.map(normalizeListing);
    },

    bulkUpdateListingsStatus: (listingIds: string[], status: string) => {
        return api.patch('/admin/listings/bulk-status', { listingIds, status });
    },

    bulkDeleteListings: (listingIds: string[]) => {
        return api.delete('/admin/listings/bulk', { listingIds });
    }
};
