import "server-only";

import { NodeOAuthClient, NodeSavedSession, NodeSavedState } from "@atproto/oauth-client-node";
import { db } from "@/singletons/db";
import { bskyOAuthStore } from "@/schema";
import { and, eq } from "drizzle-orm";

const clientId = process.env.BLUESKY_CLIENT_ID;
if (!clientId) {
    throw new Error("BLUESKY_CLIENT_ID is not set");
}

class NeonStoreBase<V> {
    constructor(private session: boolean) {}

    async get(key: string): Promise<V | undefined> {
        const res = await db.select({
            sessionData: bskyOAuthStore.sessionData,
        }).from(bskyOAuthStore).where(and(
            eq(bskyOAuthStore.id, key),
            eq(bskyOAuthStore.session, this.session),
        ));
        if (res.length === 0) return undefined;
        return res[0].sessionData as V;
    }

    async set(key: string, value: V) {
        await db.insert(bskyOAuthStore).values({
            id: key,
            session: this.session,
            sessionData: value,
        });
    }

    async del(key: string) {
        await db.delete(bskyOAuthStore).where(and(
            eq(bskyOAuthStore.id, key),
            eq(bskyOAuthStore.session, this.session),
        ));
    }
}

export const client = new NodeOAuthClient({
    clientMetadata: {
        client_id: clientId,
        client_name: "Bluemeet",
        redirect_uris: [`${process.env.NEXT_PUBLIC_URL}/api/bluesky`],
        response_types: ["code"],
        grant_types: ["authorization_code"],
    },
    stateStore: new NeonStoreBase<NodeSavedState>(false),
    sessionStore: new NeonStoreBase<NodeSavedSession>(true),
});
