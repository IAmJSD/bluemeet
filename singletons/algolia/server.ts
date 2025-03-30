import { algoliasearch } from "algoliasearch";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_API_KEY;

if (!appId || !apiKey) {
    throw new Error("Environment variables NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_API_KEY must be set");
}

export const algolia = algoliasearch(appId, apiKey);
