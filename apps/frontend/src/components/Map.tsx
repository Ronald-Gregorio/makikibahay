'use client';

import { useEffect, useRef } from 'react';

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        title: string;
    }>;
    className?: string;
}

// Pure vanilla Leaflet — no react-leaflet Context involved
export default function Map({
    center = [15.4865, 120.9734],
    zoom = 13,
    markers = [],
    className = 'h-full w-full rounded-lg z-0',
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) return;

        const initMap = async () => {
            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');

            // Fix Leaflet icon paths in Next.js
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            if (leafletMapRef.current) return; // Already initialized

            const map = L.map(mapRef.current!).setView(center, zoom);
            leafletMapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Add markers
            markers.forEach((marker) => {
                const m = L.marker(marker.position).addTo(map);
                m.bindPopup(marker.title);
                markersRef.current.push(m);
            });
        };

        initMap().catch(console.error);

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                markersRef.current = [];
            }
        };
    }, []);

    // Update center/zoom when props change
    useEffect(() => {
        if (!leafletMapRef.current) return;
        leafletMapRef.current.setView(center, zoom);
    }, [center, zoom]);

    // Update markers when props change
    useEffect(() => {
        if (!leafletMapRef.current) return;
        const L = (window as any).L;
        if (!L) return;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        markers.forEach((marker) => {
            const m = L.marker(marker.position).addTo(leafletMapRef.current!);
            m.bindPopup(marker.title);
            markersRef.current.push(m);
        });
    }, [markers]);

    return <div ref={mapRef} className={className} style={{ minHeight: 400 }} />;
}
