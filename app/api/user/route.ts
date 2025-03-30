import { getUser, signOut } from "@/lib/auth";
import { locations } from "@/schema";
import { db } from "@/singletons/db";
import { eq } from "drizzle-orm";

export async function GET() {
    const user = await getUser();
    return new Response(JSON.stringify(user), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function PATCH(request: Request) {
    const user = await getUser();
    if (user === null) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    let body: { latitude: number; longitude: number } | null;
    try {
        body = await request.json();
        if (
            body !== null &&
            (typeof body !== "object" ||
                Array.isArray(body) ||
                typeof body.latitude !== "number" ||
                typeof body.longitude !== "number")
        ) {
            throw 1;
        }
    } catch {
        return new Response("Invalid request body", {
            status: 400,
        });
    }

    if (body === null) {
        await db.delete(locations).where(eq(locations.did, user.did));
    } else {
        await db
            .insert(locations)
            .values({
                did: user.did,
                latitude: body.latitude,
                longitude: body.longitude,
            })
            .onConflictDoUpdate({
                target: [locations.did],
                set: {
                    latitude: body.latitude,
                    longitude: body.longitude,
                },
            });
    }

    return new Response(null, {
        status: 204,
    });
}

export async function DELETE() {
    await signOut();
    return new Response(null, {
        status: 204,
    });
}
