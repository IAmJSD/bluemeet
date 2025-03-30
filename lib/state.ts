"use client";

import { atom } from "atomtree";
import type { getUser } from "./auth";
import { Profile, getProfile } from "./profileCache";

export const state = {
    users: {
        application: atom<Awaited<ReturnType<typeof getUser>> | undefined>(undefined),
        bluesky: atom<Profile | null | undefined>(undefined),
    },
    location: atom<{ latitude: number; longitude: number } | null>(null),
};

if (typeof window !== "undefined") {
    fetch("/api/user")
        .then((res) => res.json() as Promise<Awaited<ReturnType<typeof getUser>>>)
        .then(async (user) => {
            // We can set the user atom first because that is the first thing we get.
            state.users.application.set(user);
            if (user) {
                // Ask the bluesky public API for the profile.
                const data = await getProfile(user.did);
                state.users.bluesky.set(data);
            } else {
                state.users.bluesky.set(null);
            }
        });
    fetch("/api/geolocation")
        .then((res) => res.json() as Promise<{ latitude: number; longitude: number }>)
        .then((data) => {
            state.location.set(data);
        });
}
