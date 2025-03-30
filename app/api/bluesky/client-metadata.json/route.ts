import { client } from "@/singletons/bluesky";

export async function GET() {
    return new Response(JSON.stringify(client.clientMetadata), { headers: { "Content-Type": "application/json" } });
}
