'use client';

import { useEffect, useRef, useState } from 'react';
import Marzipano from 'marzipano';
import { Maximize2, X } from 'lucide-react';

interface Hotspot {
  yaw: number;
  pitch: number;
  sceneId: string;
  label: string;
}

interface SceneConfig {
  id: string;
  name: string;
  imageUrl: string;
  hotspots?: Hotspot[];
}

interface MarzipanoViewerProps {
  scenes: SceneConfig[];
  initialSceneId?: string;
}

export default function MarzipanoViewer({ scenes, initialSceneId }: MarzipanoViewerProps) {
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  useEffect(() => {
    if (!panoRef.current || scenes.length === 0) return;

    // Initialize Viewer
    const viewerOpts = {
      controls: { mouseViewMode: 'drag' }
    };
    const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
    viewerRef.current = viewer;

    const marzipanoScenes: Record<string, any> = {};

    scenes.forEach(sceneConfig => {
      // Create source
      const source = Marzipano.ImageUrlSource.fromString(sceneConfig.imageUrl);

      // Create geometry
      // Using an equirectangular geometry
      const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

      // Create view
      const limiter = Marzipano.RectilinearView.limit.traditional(1024, 100 * Math.PI / 180);
      const view = new Marzipano.RectilinearView(
        { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        limiter
      );

      // Create scene
      const scene = viewer.createScene({ source, geometry, view, pinFirstLevel: true });
      marzipanoScenes[sceneConfig.id] = { scene, config: sceneConfig };

      // Add hotspots
      if (sceneConfig.hotspots) {
        sceneConfig.hotspots.forEach(hotspot => {
          const el = document.createElement('div');
          el.className = 'hotspot-link cursor-pointer bg-white/90 px-3 py-1.5 rounded-full text-sm font-bold text-text-dark shadow-md border hover:bg-primary-green hover:text-white transition-colors flex items-center gap-1.5';
          el.innerHTML = `<span>⚲</span> ${hotspot.label}`;
          
          el.addEventListener('click', () => {
            const nextScene = marzipanoScenes[hotspot.sceneId];
            if (nextScene) {
              nextScene.scene.switchTo();
              setCurrentSceneId(hotspot.sceneId);
            }
          });

          scene.hotspotContainer().createHotspot(el, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });
      }
    });

    // Switch to initial scene
    const initial = marzipanoScenes[initialSceneId || scenes[0].id];
    if (initial) {
      initial.scene.switchTo();
      setCurrentSceneId(initial.config.id);
    }

    // Handle resize
    const handleResize = () => viewer.updateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [JSON.stringify(scenes), initialSceneId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      panoRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden group">
      {/* Container for Marzipano (strictly isolated) */}
      <div id="pano" ref={panoRef} className="w-full h-full absolute top-0 left-0 outline-none" />

      {/* Overlay UI */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Scene indicator */}
      <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
          {scenes.find(s => s.id === currentSceneId)?.name || '3D Virtual Tour'}
        </span>
      </div>
    </div>
  );
}
