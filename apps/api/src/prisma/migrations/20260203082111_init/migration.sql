-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "username" TEXT,
    "campus_id" TEXT NOT NULL,
    "roles" TEXT NOT NULL DEFAULT 'student',
    "status" TEXT NOT NULL DEFAULT 'active',
    "reputation_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campus_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_embeds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "embedded_type" TEXT NOT NULL,
    "embedded_id" TEXT NOT NULL,
    "embedded_campus_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_embeds_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campus_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campus_id" TEXT NOT NULL,
    "creator_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" DATETIME,
    "reactions_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "campus_updates_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "campus_updates_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campus_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "uploader_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "year" INTEGER,
    "semester" TEXT,
    "price_ugx" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "downloads_count" INTEGER NOT NULL DEFAULT 0,
    "rating_avg" REAL NOT NULL DEFAULT 0,
    "embed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notes_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notes_uploader_user_id_fkey" FOREIGN KEY ("uploader_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "note_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "note_files_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "note_purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "buyer_user_id" TEXT NOT NULL,
    "amount_ugx" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "payment_method" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "note_purchases_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "note_purchases_buyer_user_id_fkey" FOREIGN KEY ("buyer_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "note_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "reviewer_user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "note_reviews_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "note_reviews_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campus_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "post_type" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "anonymous_handle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "image_path" TEXT,
    "image_watermarked_path" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "embed_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_score" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "feed_posts_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "feed_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feed_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "anonymous_handle" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "feed_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feed_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feed_reactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feed_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feed_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feed_reposts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "original_post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feed_reposts_original_post_id_fkey" FOREIGN KEY ("original_post_id") REFERENCES "feed_posts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "feed_reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "embed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "polls_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poll_id" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "votes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "poll_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poll_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "poll_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "poll_votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "poll_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "poll_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campus_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'community',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" REAL NOT NULL DEFAULT 0,
    "featured_at" DATETIME,
    "embed_count" INTEGER NOT NULL DEFAULT 0,
    "persistence_score" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "published_at" DATETIME,
    CONSTRAINT "articles_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "articles_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "article_reads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "article_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_percentage" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "read_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "article_reads_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "article_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "location" TEXT,
    "semester" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "timetable_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "timetable_entries_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporter_user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moderator_user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_actions_moderator_user_id_fkey" FOREIGN KEY ("moderator_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "courses_campus_id_code_key" ON "courses"("campus_id", "code");

-- CreateIndex
CREATE INDEX "content_embeds_embedded_type_embedded_id_idx" ON "content_embeds"("embedded_type", "embedded_id");

-- CreateIndex
CREATE INDEX "content_embeds_created_by_user_id_idx" ON "content_embeds"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_embeds_source_type_source_id_key" ON "content_embeds"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "campus_updates_campus_id_status_idx" ON "campus_updates"("campus_id", "status");

-- CreateIndex
CREATE INDEX "notes_campus_id_status_idx" ON "notes"("campus_id", "status");

-- CreateIndex
CREATE INDEX "notes_course_id_idx" ON "notes"("course_id");

-- CreateIndex
CREATE INDEX "note_purchases_buyer_user_id_idx" ON "note_purchases"("buyer_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_reviews_note_id_reviewer_user_id_key" ON "note_reviews"("note_id", "reviewer_user_id");

-- CreateIndex
CREATE INDEX "feed_posts_campus_id_status_created_at_idx" ON "feed_posts"("campus_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "feed_posts_engagement_score_idx" ON "feed_posts"("engagement_score");

-- CreateIndex
CREATE UNIQUE INDEX "feed_reactions_post_id_user_id_key" ON "feed_reactions"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "feed_reposts_original_post_id_idx" ON "feed_reposts"("original_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "polls_post_id_key" ON "polls"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_poll_id_user_id_key" ON "poll_votes"("poll_id", "user_id");

-- CreateIndex
CREATE INDEX "articles_campus_id_status_tier_idx" ON "articles"("campus_id", "status", "tier");

-- CreateIndex
CREATE INDEX "articles_persistence_score_idx" ON "articles"("persistence_score");

-- CreateIndex
CREATE UNIQUE INDEX "article_reads_article_id_user_id_key" ON "article_reads"("article_id", "user_id");

-- CreateIndex
CREATE INDEX "timetable_entries_user_id_semester_idx" ON "timetable_entries"("user_id", "semester");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "moderation_actions_target_type_target_id_idx" ON "moderation_actions"("target_type", "target_id");
