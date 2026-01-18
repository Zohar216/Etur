CREATE TABLE IF NOT EXISTS "userPinnedTask" (
	"userId" text NOT NULL,
	"taskId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userPinnedTask" ADD CONSTRAINT "userPinnedTask_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPinnedTask" ADD CONSTRAINT "userPinnedTask_taskId_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPinnedTask" ADD CONSTRAINT "userPinnedTask_userId_taskId_pk" PRIMARY KEY("userId","taskId");
