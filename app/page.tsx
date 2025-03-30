"use client";

import Spinner from "@/components/Spinner";
import { state } from "@/lib/state";
import { getProfile } from "@/lib/profileCache";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Point } from "./Map";

const Map = dynamic(() => import("./Map").then((mod) => mod.default), { ssr: false });

function UserBoxes({ points }: { points: Point[] }) {
    return (
        <div className="flex flex-col min-w-48 h-full overflow-y-auto">
            <div className="block">
                <div className="flex flex-wrap">
                    {points.map((point) => (
                        <a key={point.did} href={point.url} target="_blank">
                            <div
                                style={{
                                    backgroundImage: `url(${CSS.escape(point.pfp ?? "/images/person.png")})`,
                                    backgroundSize: "cover",
                                }}
                                className="w-32 h-32"
                            >
                                <div className="w-full h-full bg-black/40 flex flex-col justify-end">
                                    <div className="text-white text-sm p-2">{point.name}</div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const location = state.location.use();
    const applicationUser = state.users.application.use();
    const [ourLocation, setOurLocation] = useState(location);
    const [pointsHandler, setPointsHandler] = useState<((points: Point[]) => void) | null>(null);
    const lastSearchRef = useRef(0);
    const [points, setPointsState] = useState<Point[]>([]);
    const pointsRef = useRef(points);
    const userLocationSetRef = useRef(false);
    const setPoints = (points: Point[]) => {
        pointsRef.current = points;
        setPointsState(points);
    };

    const doSearch = async (north: number, south: number, east: number, west: number) => {
        const response = await fetch("/api/search", {
            method: "POST",
            body: JSON.stringify({ north, south, east, west }),
        });
        const hits: {
            latitude: number;
            longitude: number;
            did: string;
        }[] = await response.json();

        const toRemove: number[] = [];
        for (let i = 0; i < pointsRef.current.length; i++) {
            if (!hits.find((hit) => hit.did === pointsRef.current[i].did)) {
                toRemove.push(i);
            }
        }
        if (toRemove.length > 0) {
            setPoints(pointsRef.current.filter((_, i) => !toRemove.includes(i)));
        }

        const ourNumber = lastSearchRef.current++;
        for (const hit of hits) {
            (async () => {
                try {
                    if (pointsRef.current.find((point) => point.did === hit.did)) {
                        return;
                    }
                    const user = await getProfile(hit.did);
                    if (user && ourNumber + 1 === lastSearchRef.current) {
                        setPoints([
                            ...pointsRef.current,
                            {
                                did: hit.did,
                                latitude: hit.latitude,
                                longitude: hit.longitude,
                                pfp: user.avatar,
                                name: user.displayName,
                                url: `https://bsky.app/profile/${hit.did}`,
                            },
                        ]);
                    }
                } catch (e) {
                    console.error(`Error getting profile for ${hit.did}:`, e);
                }
            })();
        }
    };

    useEffect(() => {
        return () => {
            lastSearchRef.current++;
        };
    }, []);

    useEffect(() => {
        if (pointsHandler) {
            pointsHandler(points);
        }
    }, [pointsHandler, points]);

    useEffect(() => {
        if (userLocationSetRef.current) {
            // Don't override the user's location if it's already set.
            return;
        }
        if (location) {
            setOurLocation(location);
            userLocationSetRef.current = true;
        }
    }, [location]);

    useEffect(() => {
        if (applicationUser?.location) {
            // Jolt it to where we are on the map.
            setOurLocation(applicationUser.location);
            userLocationSetRef.current = true;
        }
    }, [applicationUser]);

    if (!ourLocation) {
        return (
            <main>
                <Spinner small={false} />
            </main>
        );
    }

    return (
        <main className="max-w-screen-lg mx-auto">
            <div className="h-[400px]">
                <Map
                    initLatitude={ourLocation.latitude}
                    initLongitude={ourLocation.longitude}
                    initZoom={8}
                    onMapChange={doSearch}
                    setPointsListener={(v) => setPointsHandler(() => v)}
                />
            </div>
            <UserBoxes points={points} />
        </main>
    );
}
