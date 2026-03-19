import { api } from '../../lib/api';

export interface HotspotConfig {
  id: string;
  targetSceneId: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface SceneConfig {
  id: string;
  name: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  hotspots: HotspotConfig[];
  initialViewYaw: number;
  initialViewPitch: number;
  initialViewFov: number;
}

export interface WalkthroughConfig {
  _id: string;
  listingId: string;
  ownerId: string;
  title: string;
  scenes: SceneConfig[];
  defaultSceneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveWalkthroughPayload {
  listingId: string;
  title: string;
  scenes: SceneConfig[];
  defaultSceneId: string;
}

export const walkthroughService = {
  getWalkthrough: async (listingId: string): Promise<WalkthroughConfig | null> => {
    try {
      return await api.get<WalkthroughConfig>(`/walkthroughs/${listingId}`);
    } catch {
      // 404 is expected when no walkthrough has been created yet
      return null;
    }
  },

  saveWalkthrough: (payload: SaveWalkthroughPayload): Promise<WalkthroughConfig> => {
    return api.post<WalkthroughConfig>('/walkthroughs', payload);
  },

  deleteWalkthrough: (listingId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/walkthroughs/${listingId}`);
  },
};
