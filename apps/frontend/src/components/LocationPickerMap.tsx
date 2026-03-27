'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
    initialCenter?: [number, number];
    initialZoom?: number;
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export default function LocationPickerMap({ initialCenter = [15.4865, 120.9734], initialZoom = 13, onLocationSelect }: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerInstance = useRef<L.Marker | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        }
    }, []);

    useEffect(() => {
        if (!isMounted || !mapRef.current) return;

        if (!mapInstance.current) {
            // Initialize map
            mapInstance.current = L.map(mapRef.current).setView(initialCenter, initialZoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            // Initialize marker
            markerInstance.current = L.marker(initialCenter, { draggable: true }).addTo(mapInstance.current);
            markerInstance.current.bindPopup('Drag me or click anywhere on the map to set location.');

            // Event listeners
            const updateLocation = async (lat: number, lng: number) => {
                let address = undefined;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                        headers: {
                            'User-Agent': 'Makikibahay-App/1.0 (Contact: admin@makikibahay.com)'
                        }
                    });
                    const data = await res.json();
                    if (data && data.display_name) {
                        address = data.display_name;
                    }
                } catch (err) {
                    console.error("Reverse geocoding failed", err);
                }
                onLocationSelect(lat, lng, address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            };

            markerInstance.current.on('dragend', () => {
                if (markerInstance.current) {
                    const pos = markerInstance.current.getLatLng();
                    updateLocation(pos.lat, pos.lng);
                }
            });

            mapInstance.current.on('click', (e: L.LeafletMouseEvent) => {
                if (markerInstance.current) {
                    markerInstance.current.setLatLng(e.latlng);
                    updateLocation(e.latlng.lat, e.latlng.lng);
                }
            });
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    // Update map view when initialCenter prop changes (Forward Geocoding sync)
    useEffect(() => {
        if (mapInstance.current && markerInstance.current && initialCenter) {
            mapInstance.current.setView(initialCenter, initialZoom);
            markerInstance.current.setLatLng(initialCenter);
        }
    }, [initialCenter[0], initialCenter[1], initialZoom]);

    if (!isMounted) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />;

    return <div ref={mapRef} className="h-[400px] w-full border border-border rounded-lg z-0" />;
}
