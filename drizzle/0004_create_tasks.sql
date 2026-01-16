CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"domain" text NOT NULL,
	"topic" text NOT NULL,
	"leaderId" text NOT NULL,
	"dueDate" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taskUser" (
	"taskId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text DEFAULT 'collaborator' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_leaderId_user_id_fk" FOREIGN KEY ("leaderId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taskUser" ADD CONSTRAINT "taskUser_taskId_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taskUser" ADD CONSTRAINT "taskUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taskUser" ADD CONSTRAINT "taskUser_taskId_userId_pk" PRIMARY KEY("taskId","userId");
