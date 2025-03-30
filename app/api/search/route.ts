import { locations } from "@/schema";
import { db } from "@/singletons/db";
import { and, gte, lte } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
});

export async function POST(request: Request) {
    let j: z.infer<typeof schema>;
    try {
        j = schema.parse(await request.json());
    } catch (e) {
        return new Response("Invalid request", { status: 400 });
    }

    const points = await db.query.locations.findMany({
        where: and(
            gte(locations.latitude, j.south),
            lte(locations.latitude, j.north),
            gte(locations.longitude, j.west),
            lte(locations.longitude, j.east),
        ),
        columns: {
            latitude: true,
            longitude: true,
            did: true,
        },
    });

    return new Response(JSON.stringify(points), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
