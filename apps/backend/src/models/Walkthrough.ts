import mongoose, { Schema, Document } from 'mongoose';

export interface IHotspot {
  id: string;
  targetSceneId: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface IScene {
  id: string;
  name: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  hotspots: IHotspot[];
  initialViewYaw: number;
  initialViewPitch: number;
  initialViewFov: number;
}

export interface IWalkthrough extends Document {
  listingId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  scenes: IScene[];
  defaultSceneId: string;
  createdAt: Date;
  updatedAt: Date;
}

const HotspotSchema = new Schema<IHotspot>(
  {
    id: { type: String, required: true },
    targetSceneId: { type: String, required: true },
    yaw: { type: Number, required: true },
    pitch: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const SceneSchema = new Schema<IScene>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    hotspots: { type: [HotspotSchema], default: [] },
    initialViewYaw: { type: Number, default: 0 },
    initialViewPitch: { type: Number, default: 0 },
    initialViewFov: { type: Number, default: Math.PI / 2 },
  },
  { _id: false }
);

const WalkthroughSchema = new Schema<IWalkthrough>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Virtual Tour' },
    scenes: { type: [SceneSchema], default: [] },
    defaultSceneId: { type: String, default: '' },
  },
  { timestamps: true }
);

WalkthroughSchema.index({ listingId: 1 }, { unique: true });
WalkthroughSchema.index({ ownerId: 1 });

export default mongoose.model<IWalkthrough>('Walkthrough', WalkthroughSchema);
