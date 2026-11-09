ALTER TABLE players ADD COLUMN elevation REAL NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN yaw REAL NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN moving INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN farm_xp INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN farm_coins INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN harvests INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE plots (room TEXT NOT NULL REFERENCES rooms(code), slot INTEGER NOT NULL, crop TEXT NOT NULL DEFAULT '', planted_at INTEGER NOT NULL DEFAULT 0, watered INTEGER NOT NULL DEFAULT 0, fed INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 0, owner_name TEXT NOT NULL DEFAULT '', PRIMARY KEY(room,slot));
--> statement-breakpoint
CREATE TABLE harvest_receipts (id TEXT PRIMARY KEY, room TEXT NOT NULL, player_id TEXT NOT NULL, slot INTEGER NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE builds (id TEXT PRIMARY KEY, room TEXT NOT NULL REFERENCES rooms(code), player_id TEXT NOT NULL, color TEXT NOT NULL, x INTEGER NOT NULL, z INTEGER NOT NULL, created_at INTEGER NOT NULL, UNIQUE(room,x,z));
