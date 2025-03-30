"use client";

export type Profile = {
    handle: string;
    displayName: string;
    avatar: string | null;
};

const cache = new Map<string, [number, Promise<Profile>]>();

export async function getProfile(did: string) {
    const now = Date.now();
    const cached = cache.get(did);
    if (cached && cached[0] > now) {
        return cached[1];
    }
    const promise = fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch profile for ${did}: ${res.status} ${await res.text()}`);
            }
            return await res.json() as Profile;
        });
    cache.set(did, [now + 1000 * 60 * 5, promise]);
    return promise;
}
