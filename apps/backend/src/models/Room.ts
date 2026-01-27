import mongoose, { Schema, Document } from 'mongoose';
import type { Room, Waypoint } from '@makikibahay/types';

export interface IRoomDocument extends Omit<Room, '_id'>, Document {}

const PositionSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
}, { _id: false });

const HotspotCoordinatesSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const WaypointSchema = new Schema({
  id: { type: String, required: true },
  position: { type: PositionSchema, required: true },
  hotspotCoordinates: { type: HotspotCoordinatesSchema, required: true },
}, { _id: false });

const RoomSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  sizeSqm: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  inclusions: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  model3dUrl: { type: String, validate: { validator: (v: string) => !v || /^https?:\/\/.+/.test(v), message: 'Invalid URL format' } },
  waypoints: [WaypointSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

RoomSchema.index({ listingId: 1 });
RoomSchema.index({ price: 1 });
RoomSchema.index({ isAvailable: 1 });

export const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);