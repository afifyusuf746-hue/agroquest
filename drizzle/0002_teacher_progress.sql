CREATE TABLE learners (id TEXT PRIMARY KEY, secret_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL);
--> statement-breakpoint
ALTER TABLE players ADD COLUMN learner_id TEXT REFERENCES learners(id);
--> statement-breakpoint
ALTER TABLE rooms ADD COLUMN label TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE enrollments (room TEXT NOT NULL REFERENCES rooms(code), learner_id TEXT NOT NULL REFERENCES learners(id), display_name TEXT NOT NULL, joined_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, saved_at INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 0, progress TEXT NOT NULL DEFAULT '{}', harvests INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(room,learner_id));
--> statement-breakpoint
CREATE INDEX enrollments_last_seen ON enrollments(room,last_seen);
