import "server-only";

import { locations, tokens } from "@/schema";
import { db } from "@/singletons/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

export async function signIn(did: string) {
    const token = randomBytes(32).toString("hex");
    await db.insert(tokens).values({ token, did });
    (await cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
    });
}

export async function signOut() {
    const cookieJar = await cookies();
    const currentToken = cookieJar.get("token")?.value;
    if (currentToken) {
        await db.delete(tokens).where(eq(tokens.token, currentToken));
    }
    cookieJar.delete("token");
}

export async function getUser() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    const query = await db.select().from(tokens).leftJoin(
        locations, eq(tokens.did, locations.did),
    ).where(eq(tokens.token, token));
    if (query.length === 0) return null;
    return {
        did: query[0].tokens.did,
        location: query[0].locations ? {
            latitude: query[0].locations.latitude,
            longitude: query[0].locations.longitude,
        } : null,
    };
}
