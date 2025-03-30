CREATE INDEX "locations_lat" ON "locations" USING btree ("latitude");--> statement-breakpoint
CREATE INDEX "locations_long" ON "locations" USING btree ("longitude");