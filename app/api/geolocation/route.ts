import { geolocation } from "@vercel/edge";

const DEBUG_LATITUDE = 37.774929;
const DEBUG_LONGITUDE = -122.419418;

export async function GET(request: Request) {
    const { latitude, longitude } = geolocation(request);
    return new Response(
        JSON.stringify({
            latitude: latitude ?? DEBUG_LATITUDE,
            longitude: longitude ?? DEBUG_LONGITUDE,
        }),
    );
}
