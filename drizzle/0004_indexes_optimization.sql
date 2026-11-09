CREATE INDEX IF NOT EXISTS players_room_learner_seen ON players(room, learner_id, seen);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS players_learner_id ON players(learner_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS builds_room_created_at ON builds(room, created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS enrollments_learner_id ON enrollments(learner_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS enrollments_room_display_name ON enrollments(room, display_name COLLATE NOCASE);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS harvest_receipts_room_slot ON harvest_receipts(room, slot);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS rooms_created_at ON rooms(created_at DESC);

