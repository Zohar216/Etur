ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_stripeCustomerId_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "stripeCustomerId";
