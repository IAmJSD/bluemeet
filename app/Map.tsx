"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

export type Point = {
    latitude: number;
    longitude: number;
    pfp: string | null;
    name: string;
    url: string;
    did: string;
};

function mapPoints(map: L.Map, points: Point[], markers: L.Marker[]) {
    for (const marker of markers) {
        marker.remove();
    }
    markers.length = 0;
    for (const point of points) {
        const marker = L.marker([point.latitude, point.longitude], {
            icon: L.icon({
                iconUrl: point.pfp ?? "/images/person.png",
                iconSize: [32, 32],
            }),
            title: point.name,
        });
        marker.on("click", () => {
            window.open(point.url, "_blank");
        });
        marker.addTo(map);
        markers.push(marker);
    }
}

type MapProps = {
    initLatitude: number;
    initLongitude: number;
    initZoom: number;
    onMapChange: (latitude: number, longitude: number, zoom: number) => void;
    setPointsListener: (listener: (points: Point[]) => void) => void;
};

export default function Map({ initLatitude, initLongitude, initZoom, onMapChange, setPointsListener }: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let map: L.Map | null = null;
        const markers: L.Marker[] = [];
        if (mapRef.current) {
            map = new L.Map(mapRef.current, {
                center: [initLatitude, initLongitude],
                zoom: initZoom,
            });
            setPointsListener((points: Point[]) => {
                if (map) {
                    mapPoints(map, points, markers);
                }
            });
            L.tileLayer(
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                { attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors" },
            ).addTo(map);
            map.on("moveend", () => {
                const latLng = map?.getCenter();
                if (latLng) {
                    onMapChange(latLng.lat, latLng.lng, map!.getZoom());
                }
            });
            map.on("zoomend", () => {
                const zoom = map?.getZoom();
                if (zoom !== undefined) {
                    const latLng = map!.getCenter();
                    onMapChange(latLng.lat, latLng.lng, zoom);
                }
            });
        }
        return () => {
            if (map) {
                map.remove();
                map = null;
            }
        };
    }, [mapRef.current, initLatitude, initLongitude]);

    return <div className="w-full h-full" ref={mapRef} />;
}
