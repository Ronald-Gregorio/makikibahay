'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from 'react';
import { Upload, Plus, Trash2, Save, Check, X, Link2, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  walkthroughService,
  type SceneConfig,
  type HotspotConfig,
  type WalkthroughConfig,
} from '@/services/api/walkthroughs';

// ────────────────────────────────────────────────────────────
// Marzipano type stubs (vanilla library accessed via window)
// ────────────────────────────────────────────────────────────
interface MarzipanoViewer {
  createScene(opts: MarzipanoSceneOptions): MarzipanoScene;
  updateSize(): void;
  destroy(): void;
}

interface MarzipanoScene {
  switchTo(opts?: { transitionDuration?: number }): void;
  hotspotContainer(): MarzipanoHotspotContainer;
  view(): MarzipanoView;
}

interface MarzipanoHotspotContainer {
  createHotspot(element: HTMLElement, position: { yaw: number; pitch: number }): void;
  destroyAll(): void;
}

interface MarzipanoView {
  yaw(): number;
  pitch(): number;
  fov(): number;
  setParameters(p: { yaw?: number; pitch?: number; fov?: number }): void;
}

interface MarzipanoSceneOptions {
  source: unknown;
  geometry: unknown;
  view: unknown;
  pinFirstLevel: boolean;
}

interface MarzipanoLib {
  Viewer: new (el: HTMLElement, opts: object) => MarzipanoViewer;
  ImageUrlSource: { fromString(url: string): unknown };
  EquirectGeometry: new (levels: Array<{ width: number }>) => unknown;
  RectilinearView: {
    new (
      params: { yaw: number; pitch: number; fov: number },
      limiter: unknown
    ): MarzipanoView;
    limit: { traditional(maxRes: number, maxFov: number): unknown };
  };
}

declare const Marzipano: MarzipanoLib;

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────
interface WalkthroughBuilderProps {
  listingId: string;
  initialConfig?: WalkthroughConfig | null;
  onSaved?: (config: WalkthroughConfig) => void;
}

// ────────────────────────────────────────────────────────────
// Hotspot Link Modal
// ────────────────────────────────────────────────────────────
interface HotspotModalState {
  yaw: number;
  pitch: number;
  targetSceneId: string;
  label: string;
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────
export default function WalkthroughBuilder({
  listingId,
  initialConfig,
  onSaved,
}: WalkthroughBuilderProps) {
  const { toast } = useToast();

  // ── scene list state ──────────────────────────────────────
  const [scenes, setScenes] = useState<SceneConfig[]>(
    initialConfig?.scenes ?? []
  );
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    initialConfig?.defaultSceneId ?? null
  );
  const [title, setTitle] = useState(initialConfig?.title ?? 'Virtual Tour');

  // ── viewer refs ───────────────────────────────────────────
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<MarzipanoViewer | null>(null);
  const marzipanoSceneMapRef = useRef<Record<string, MarzipanoScene>>({});

  // ── upload state ──────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── hotspot add mode ──────────────────────────────────────
  const [hotspotMode, setHotspotMode] = useState(false);
  const [hotspotModal, setHotspotModal] = useState<HotspotModalState | null>(null);

  // ────────────────────────────────────────────────────────────
  // Marzipano initialisation / scene switching
  // ────────────────────────────────────────────────────────────
  const buildViewer = useCallback(() => {
    if (!panoRef.current || typeof Marzipano === 'undefined') return;

    // Destroy previous viewer
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch { /* ignore */ }
    }
    marzipanoSceneMapRef.current = {};

    if (scenes.length === 0) return;

    const viewer = new Marzipano.Viewer(panoRef.current, {
      controls: { mouseViewMode: 'drag' },
    });
    viewerRef.current = viewer;

    scenes.forEach(sceneConfig => {
      const source = Marzipano.ImageUrlSource.fromString(sceneConfig.imageUrl);
      const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
      const limiter = Marzipano.RectilinearView.limit.traditional(
        1024,
        (100 * Math.PI) / 180
      );
      const view = new Marzipano.RectilinearView(
        {
          yaw: sceneConfig.initialViewYaw,
          pitch: sceneConfig.initialViewPitch,
          fov: sceneConfig.initialViewFov,
        },
        limiter
      );

      const scene = viewer.createScene({ source, geometry, view, pinFirstLevel: true });
      marzipanoSceneMapRef.current[sceneConfig.id] = scene;

      // Render hotspots
      sceneConfig.hotspots.forEach(hotspot => {
        const el = document.createElement('div');
        el.className =
          'hotspot-link cursor-pointer bg-white/90 px-3 py-1.5 rounded-full text-sm font-bold text-text-dark shadow-md border hover:bg-primary-green hover:text-white transition-colors flex items-center gap-1.5 select-none';
        el.innerHTML = `<span>⚲</span> ${hotspot.label}`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = marzipanoSceneMapRef.current[hotspot.targetSceneId];
          if (target) {
            target.switchTo({ transitionDuration: 1000 });
            setSelectedSceneId(hotspot.targetSceneId);
          }
        });
        scene
          .hotspotContainer()
          .createHotspot(el, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });
    });

    // Switch to selected scene
    const activeId = selectedSceneId ?? scenes[0].id;
    const activeScene = marzipanoSceneMapRef.current[activeId];
    if (activeScene) {
      activeScene.switchTo();
      setSelectedSceneId(activeId);
    }

    const handleResize = () => viewer.updateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes]);

  // Rebuild viewer whenever scenes change
  useEffect(() => {
    const cleanup = buildViewer();
    return cleanup;
  }, [buildViewer]);

  // Switch to a different scene without rebuilding everything
  const switchToScene = useCallback((sceneId: string) => {
    const scene = marzipanoSceneMapRef.current[sceneId];
    if (scene) {
      scene.switchTo({ transitionDuration: 800 });
      setSelectedSceneId(sceneId);
    }
  }, []);

  // ────────────────────────────────────────────────────────────
  // Upload 360° image
  // ────────────────────────────────────────────────────────────
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: SceneConfig[] = await Promise.all(
        files.map(async (file, idx) => {
          const formData = new FormData();
          formData.append('image', file);
          const { url, publicId } = await api.postForm<{ url: string; publicId: string }>(
            '/upload',
            formData
          );

          const id = `scene_${Date.now()}_${idx}`;
          return {
            id,
            name: file.name.replace(/\.[^.]+$/, '') || `Scene ${scenes.length + idx + 1}`,
            imageUrl: url,
            cloudinaryPublicId: publicId,
            hotspots: [],
            initialViewYaw: 0,
            initialViewPitch: 0,
            initialViewFov: Math.PI / 2,
          };
        })
      );

      setScenes(prev => {
        const next = [...prev, ...uploaded];
        if (!selectedSceneId && next.length > 0) setSelectedSceneId(next[0].id);
        return next;
      });
      toast({ title: `${uploaded.length} scene(s) uploaded`, description: 'Drag the marker to explore the scene.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast({ variant: 'destructive', title: 'Upload Error', description: msg });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // ────────────────────────────────────────────────────────────
  // Hotspot placement
  // ────────────────────────────────────────────────────────────
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hotspotMode || !viewerRef.current || !selectedSceneId) return;

      const scene = marzipanoSceneMapRef.current[selectedSceneId];
      if (!scene) return;

      const rect = panoRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      // Convert pixel coords to yaw/pitch using rectilinear projection
      const view = scene.view();
      const fov = view.fov();
      const aspect = w / h;
      const yawOffset = ((x / w) - 0.5) * fov * aspect;
      const pitchOffset = (0.5 - (y / h)) * fov;
      const yaw = view.yaw() + yawOffset;
      const pitch = view.pitch() + pitchOffset;

      setHotspotModal({ yaw, pitch, targetSceneId: '', label: '' });
      setHotspotMode(false);
    },
    [hotspotMode, selectedSceneId]
  );

  const commitHotspot = () => {
    if (!hotspotModal || !selectedSceneId) return;
    if (!hotspotModal.targetSceneId || !hotspotModal.label.trim()) {
      toast({ variant: 'destructive', title: 'Hotspot Error', description: 'Please fill in the label and target scene.' });
      return;
    }

    const newHotspot: HotspotConfig = {
      id: `hotspot_${Date.now()}`,
      targetSceneId: hotspotModal.targetSceneId,
      yaw: hotspotModal.yaw,
      pitch: hotspotModal.pitch,
      label: hotspotModal.label.trim(),
    };

    setScenes(prev =>
      prev.map(s =>
        s.id === selectedSceneId
          ? { ...s, hotspots: [...s.hotspots, newHotspot] }
          : s
      )
    );
    setHotspotModal(null);
    toast({ title: 'Hotspot added', description: 'Scene rebuilt with new hotspot.' });
  };

  const removeHotspot = (sceneId: string, hotspotId: string) => {
    setScenes(prev =>
      prev.map(s =>
        s.id === sceneId
          ? { ...s, hotspots: s.hotspots.filter(h => h.id !== hotspotId) }
          : s
      )
    );
  };

  const removeScene = (id: string) => {
    setScenes(prev => {
      const next = prev.filter(s => s.id !== id);
      if (selectedSceneId === id) setSelectedSceneId(next[0]?.id ?? null);
      return next;
    });
  };

  const renameScene = (id: string, name: string) => {
    setScenes(prev => prev.map(s => (s.id === id ? { ...s, name } : s)));
  };

  // ────────────────────────────────────────────────────────────
  // Save walkthrough
  // ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (scenes.length === 0) {
      toast({ variant: 'destructive', title: 'No scenes', description: 'Upload at least one 360° image before saving.' });
      return;
    }

    setIsSaving(true);
    try {
      // Capture current view parameters for the selected scene
      const scenesToSave: SceneConfig[] = scenes.map(s => {
        const mScene = marzipanoSceneMapRef.current[s.id];
        if (mScene && s.id === selectedSceneId) {
          const view = mScene.view();
          return {
            ...s,
            initialViewYaw: view.yaw(),
            initialViewPitch: view.pitch(),
            initialViewFov: view.fov(),
          };
        }
        return s;
      });

      const saved = await walkthroughService.saveWalkthrough({
        listingId,
        title,
        scenes: scenesToSave,
        defaultSceneId: selectedSceneId ?? scenes[0].id,
      });

      toast({ title: 'Walkthrough saved!', description: 'Your 3D tour is now live on the listing page.' });
      onSaved?.(saved);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast({ variant: 'destructive', title: 'Save Error', description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────
  const selectedScene = scenes.find(s => s.id === selectedSceneId) ?? null;
  const otherScenes = scenes.filter(s => s.id !== selectedSceneId);

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tour title…"
          className="flex-1 border border-gray-border rounded-lg px-3 py-2 text-sm font-semibold text-text-dark focus:outline-none focus:border-primary-green"
        />
        <button
          onClick={handleSave}
          disabled={isSaving || scenes.length === 0}
          className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green-hover disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          {isSaving ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Tour
        </button>
      </div>

      <div className="flex gap-5 min-h-[520px]">
        {/* ── Left rail: scene list ── */}
        <aside className="w-52 shrink-0 flex flex-col gap-3">
          <label
            className={`relative flex flex-col items-center justify-center gap-1.5 h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isUploading ? 'border-gray-300 opacity-50 cursor-not-allowed' : 'border-primary-green/40 hover:border-primary-green hover:bg-primary-green/5'}`}
          >
            {isUploading ? (
              <span className="animate-spin h-6 w-6 border-2 border-primary-green border-t-transparent rounded-full" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-primary-green" />
                <span className="text-xs font-bold text-primary-green">Upload 360° Image</span>
                <span className="text-[10px] text-gray-text">JPEG or PNG, equirectangular</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isUploading}
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => switchToScene(scene.id)}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${scene.id === selectedSceneId ? 'border-primary-green shadow-md' : 'border-gray-border hover:border-gray-300'}`}
              >
                <img
                  src={scene.imageUrl}
                  alt={scene.name}
                  className="w-full h-20 object-cover"
                />
                <div className="px-2 py-1.5 bg-white">
                  <input
                    type="text"
                    value={scene.name}
                    onChange={e => { e.stopPropagation(); renameScene(scene.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className="w-full text-xs font-semibold text-text-dark bg-transparent focus:outline-none truncate"
                  />
                  <p className="text-[10px] text-gray-text">{scene.hotspots.length} hotspot{scene.hotspots.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeScene(scene.id); }}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
                <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right: Marzipano canvas ── */}
        <div className="flex-1 flex flex-col gap-3">
          {scenes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-border rounded-xl text-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary-green/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary-green" />
              </div>
              <p className="font-semibold text-text-dark">No scenes yet</p>
              <p className="text-sm text-gray-text max-w-xs">Upload equirectangular 360° images using the panel on the left to start building your virtual tour.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-dark flex-1 truncate">
                  {selectedScene?.name}
                </span>
                <button
                  onClick={() => setHotspotMode(m => !m)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${hotspotMode ? 'bg-amber-400 border-amber-400 text-white' : 'border-gray-border hover:border-primary-green text-gray-text hover:text-primary-green'}`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {hotspotMode ? 'Click canvas to place' : 'Add Hotspot'}
                </button>
              </div>

              {/* Canvas */}
              <div
                className={`relative flex-1 min-h-[400px] rounded-xl overflow-hidden ${hotspotMode ? 'cursor-crosshair ring-2 ring-amber-400' : ''}`}
                onClick={handleCanvasClick}
              >
                <div ref={panoRef} className="absolute inset-0 outline-none" />
                {hotspotMode && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg pointer-events-none z-10">
                    Click anywhere in the scene to place a hotspot
                  </div>
                )}
              </div>

              {/* Hotspot list for selected scene */}
              {selectedScene && selectedScene.hotspots.length > 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-border p-3">
                  <p className="text-xs font-bold text-gray-text uppercase tracking-wide mb-2">Hotspots in this scene</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedScene.hotspots.map(h => (
                      <div key={h.id} className="flex items-center gap-1.5 bg-white border border-gray-border rounded-full pl-3 pr-1 py-0.5 text-xs font-semibold text-text-dark">
                        <Link2 className="h-3 w-3 text-primary-green" />
                        {h.label}
                        <span className="text-gray-text">→</span>
                        {scenes.find(s => s.id === h.targetSceneId)?.name ?? 'Unknown'}
                        <button
                          onClick={() => removeHotspot(selectedSceneId!, h.id)}
                          className="ml-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Hotspot Modal ── */}
      {hotspotModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg text-text-dark mb-4">Configure Hotspot</h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Label</label>
                <input
                  type="text"
                  value={hotspotModal.label}
                  onChange={e => setHotspotModal(prev => prev ? { ...prev, label: e.target.value } : null)}
                  placeholder="e.g., Living Room"
                  className="w-full border border-gray-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Links to Scene</label>
                <select
                  value={hotspotModal.targetSceneId}
                  onChange={e => setHotspotModal(prev => prev ? { ...prev, targetSceneId: e.target.value } : null)}
                  className="w-full border border-gray-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-green bg-white"
                >
                  <option value="">Select a scene…</option>
                  {otherScenes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-text bg-gray-50 rounded-lg px-3 py-2">
                Position: yaw {hotspotModal.yaw.toFixed(3)} · pitch {hotspotModal.pitch.toFixed(3)}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setHotspotModal(null)}
                className="flex-1 py-2 border border-gray-border rounded-lg text-sm font-semibold text-text-dark hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitHotspot}
                className="flex-1 py-2 bg-primary-green hover:bg-primary-green-hover text-white rounded-lg text-sm font-bold transition-colors"
              >
                <Check className="h-4 w-4 inline mr-1.5" />Add Hotspot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
