import { getUser } from "@/lib/auth";
import { client } from "@/singletons/bluesky";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/singletons/db";
import { tokens } from "@/schema";

export async function POST(req: Request) {
    const user = await getUser();
    if (user) {
        return new Response("Already logged in", { status: 400 });
    }

    let handle: string;
    try {
        handle = await req.json();
        if (typeof handle !== "string") throw 1;
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const cookieStore = await cookies();
    const state = randomBytes(32).toString("hex");
    cookieStore.set("bluesky_state", state);

    const url = await client.authorize(handle, { state });
    return new Response(url.toString(), { headers: { "Content-Type": "text/plain" } });
}

export async function GET(req: Request) {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const { session, state } = await client.callback(params);
    const cookieStore = await cookies();
    if (state !== cookieStore.get("bluesky_state")?.value) {
        return new Response("Invalid state", { status: 400 });
    }
    cookieStore.delete("bluesky_state");

    const token = randomBytes(32).toString("hex");
    await db.insert(tokens).values({
        token,
        did: session.did,
    });
    cookieStore.set("token", token);
    return redirect("/");
}
