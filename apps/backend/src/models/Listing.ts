import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    ownerId: mongoose.Types.ObjectId;
    // 1. Core Property Info
    listingName: string;
    propertyType: 'Apartment' | 'Condo' | 'Studio Type' | 'Bed Spacer' | 'Boarding House' | 'Up and Down';
    description: string;
    rating: number;
    // reviews is handled via population or separate model, but we'll keep the array placeholder if needed
    
    // 2. Media & Virtual Viewing
    photos: string[];
    video?: string;
    virtualTour360?: string;
    hasEnhancedViewing: boolean; // Derived/Stored
    floorPlans: string[];

    // 3. Location & Neighborhood
    fullAddress: string;
    mapLoc: {
        type: 'Point';
        coordinates: [number, number];
    };
    neighborhoodNear: string[]; // Enums: School, University, etc.
    transportationOptions: string[];

    // 4. Room, Unit Details & Pricing
    roomType: string;
    availableRooms: number;
    bedrooms: 'Studio' | '1' | '2' | '3' | '4+';
    bathrooms: '1' | '2' | '3+';
    squareFeet: number;
    monthlyRent: number;
    moveInDate: Date;

    // 5. Fees & Policies
    securityDeposit: number;
    advancePayment: number;
    applicationReviewFee: number;
    specialtyProperty: 'Student Only' | 'Worker Only' | 'Income Restricted' | 'Short-Term' | 'None';

    // 6. Pet Policy
    petPolicy: 'Cat Friendly' | 'Dog Friendly' | 'Any Pet Friendly' | 'Small Dogs Only' | 'No Pets';

    // 7. House Rules
    hasCurfew: boolean;
    visitorsAllowed: boolean;
    smokingAllowed: boolean;
    cookingAllowed: boolean;
    quietHours: string;

    // 8. Amenities
    airConditioning: boolean;
    wifi: boolean;
    washer: boolean;
    dryer: boolean;
    utilitiesIncluded: boolean;
    dishwasher: boolean;
    parkingType: 'None' | 'Outside' | 'Garage';
    laundryFacilities: boolean;
    kitchen: boolean;
    appliancesIncluded: boolean;

    // Meta
    status: 'Active' | 'Unpublished' | 'Pending';
    createdAt: Date;
    updatedAt: Date;
}

const ListingSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 1. Core Property Info
    listingName: { type: String, required: true },
    propertyType: { 
        type: String, 
        enum: ['Apartment', 'Condo', 'Studio Type', 'Bed Spacer', 'Boarding House', 'Up and Down'],
        required: true 
    },
    description: { type: String, required: true },
    rating: { type: Number, default: 0 },

    // 2. Media & Virtual Viewing
    photos: [{ type: String }],
    video: { type: String },
    virtualTour360: { type: String },
    hasEnhancedViewing: { type: Boolean, default: false },
    floorPlans: [{ type: String }],

    // 3. Location & Neighborhood
    fullAddress: { type: String, required: true },
    mapLoc: {
        type: { type: String, enum: ['Point'], required: true, default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    neighborhoodNear: [{ type: String }],
    transportationOptions: [{ type: String }],

    // 4. Room, Unit Details & Pricing
    roomType: { type: String, required: true },
    availableRooms: { type: Number, required: true, min: 0 },
    bedrooms: { type: String, enum: ['Studio', '1', '2', '3', '4+'], required: true },
    bathrooms: { type: String, enum: ['1', '2', '3+'], required: true },
    squareFeet: { type: Number, required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    moveInDate: { type: Date, required: true },

    // 5. Fees & Policies
    securityDeposit: { type: Number, default: 0 },
    advancePayment: { type: Number, default: 0 },
    applicationReviewFee: { type: Number, default: 0 },
    specialtyProperty: { 
        type: String, 
        enum: ['Student Only', 'Worker Only', 'Income Restricted', 'Short-Term', 'None'],
        default: 'None'
    },

    // 6. Pet Policy
    petPolicy: { 
        type: String, 
        enum: ['Cat Friendly', 'Dog Friendly', 'Any Pet Friendly', 'Small Dogs Only', 'No Pets'],
        default: 'No Pets'
    },

    // 7. House Rules
    hasCurfew: { type: Boolean, default: false },
    visitorsAllowed: { type: Boolean, default: true },
    smokingAllowed: { type: Boolean, default: false },
    cookingAllowed: { type: Boolean, default: true },
    quietHours: { type: String },

    // 8. Amenities
    airConditioning: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    washer: { type: Boolean, default: false },
    dryer: { type: Boolean, default: false },
    utilitiesIncluded: { type: Boolean, default: false },
    dishwasher: { type: Boolean, default: false },
    parkingType: { type: String, enum: ['None', 'Outside', 'Garage'], default: 'None' },
    laundryFacilities: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    appliancesIncluded: { type: Boolean, default: false },

    // Meta
    status: {
        type: String,
        enum: ['Active', 'Unpublished', 'Pending'],
        default: 'Active'
    }
}, { timestamps: true });

ListingSchema.index({ mapLoc: '2dsphere' });
ListingSchema.index({ ownerId: 1 });
ListingSchema.index({ monthlyRent: 1 });
ListingSchema.index({ listingName: 'text', description: 'text' });

export default mongoose.model<IListing>('Listing', ListingSchema);
