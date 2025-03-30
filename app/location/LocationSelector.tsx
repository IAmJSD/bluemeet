"use client";

import L from "leaflet";
import { useRef, useEffect, useState, useCallback } from "react";
import { state } from "@/lib/state";
import { Button } from "@/components/Button";

function ErrorAlert({ error }: { error: string }) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
        </div>
    );
}

export default function LocationSelector({ location }: { location: { latitude: number; longitude: number } | null }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<typeof location>(null);
    const stateLocationRef = useRef(location);
    const [elLocation, setElLocation] = useState(location);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/user", {
                    method: "PATCH",
                    body: JSON.stringify(selectedLocation),
                });
                if (!res.ok) {
                    const t = await res.text();
                    setError(t);
                    return;
                }
                state.users.application.mutate((v) => {
                    if (v) v.location = selectedLocation;
                });
            } catch {
                setError("Failed to update location");
            } finally {
                setLoading(false);
            }
        },
        [selectedLocation],
    );

    const clearLocaton = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedLocation(null);
        setElLocation(null);
    };

    useEffect(() => {
        if (location !== stateLocationRef.current) {
            setElLocation(location);
            stateLocationRef.current = location;
        }
    }, [location]);

    useEffect(() => {
        let map: L.Map | null = null;
        if (mapRef.current) {
            map = new L.Map(mapRef.current, {
                center: elLocation ? [elLocation.latitude, elLocation.longitude] : [0, 0],
                zoom: elLocation ? 13 : 2,
            });
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
            }).addTo(map);
            const marker = L.marker(elLocation ? [elLocation.latitude, elLocation.longitude] : [0, 0], {
                draggable: true,
                icon: L.icon({
                    iconUrl: "/images/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                }),
            }).addTo(map);
            marker.on("moveend", () => {
                const latLng = marker.getLatLng();
                setSelectedLocation({
                    latitude: latLng.lat,
                    longitude: latLng.lng,
                });
            });
        }
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [mapRef.current, elLocation]);

    return (
        <form onSubmit={handleSubmit} aria-disabled={loading}>
            {error && <ErrorAlert error={error} />}
            <p className="mb-4">
                <span className="font-bold">NOTE:</span> Be careful how close you set this to your actual location since
                it is publicly visible.
            </p>
            <div ref={mapRef} className="w-[400px] h-[400px]" />
            <button onClick={clearLocaton}>Clear Location</button>
            <div className="my-2">
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    );
}
