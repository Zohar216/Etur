CREATE TABLE "parentTask" (
	"id" text PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"domain" text NOT NULL,
	"title" text NOT NULL,
	"topic" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"createdByUserId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "parentTaskId" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "isGeneral" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "section" text;--> statement-breakpoint
CREATE TABLE "userTopic" (
	"userId" text NOT NULL,
	"section" text NOT NULL,
	"topic" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussionMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussionReadState" (
	"userId" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"lastReadAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parentTask" ADD CONSTRAINT "parentTask_createdByUserId_user_id_fk" FOREIGN KEY ("createdByUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_parentTaskId_parentTask_id_fk" FOREIGN KEY ("parentTaskId") REFERENCES "public"."parentTask"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userTopic" ADD CONSTRAINT "userTopic_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussionMessage" ADD CONSTRAINT "discussionMessage_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussionReadState" ADD CONSTRAINT "discussionReadState_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userTopic" ADD CONSTRAINT "userTopic_userId_section_topic_pk" PRIMARY KEY("userId","section","topic");--> statement-breakpoint
ALTER TABLE "discussionReadState" ADD CONSTRAINT "discussionReadState_userId_entityType_entityId_pk" PRIMARY KEY("userId","entityType","entityId");
