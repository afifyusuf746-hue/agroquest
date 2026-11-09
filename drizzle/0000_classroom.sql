CREATE TABLE rooms (code TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE players (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, room TEXT NOT NULL REFERENCES rooms(code), name TEXT NOT NULL, color TEXT NOT NULL, x REAL NOT NULL DEFAULT 6, y REAL NOT NULL DEFAULT 8, seen INTEGER NOT NULL, emote_at INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE INDEX players_room_seen ON players(room, seen);
