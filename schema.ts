import { pgTable, text, index, timestamp, doublePrecision, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";

export const tokens = pgTable(
    "tokens",
    {
        token: text("token").primaryKey(),
        did: text("did").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (t) => [index("token_index").on(t.token)],
);

export const locations = pgTable(
    "locations",
    {
        did: text("did").primaryKey(),
        latitude: doublePrecision("latitude").notNull(),
        longitude: doublePrecision("longitude").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (t) => [index("locations_lat").on(t.latitude), index("locations_long").on(t.longitude)],
);

export const bskyOAuthStore = pgTable(
    "bsky_oauth_store",
    {
        id: text("id").notNull(),
        session: boolean("session").notNull(),
        sessionData: jsonb("session_data").notNull(),
    },
    (t) => [primaryKey({ columns: [t.id, t.session] })],
);
