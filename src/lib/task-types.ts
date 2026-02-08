export type Task = {
  id: string;
  title: string;
  description: string | null;
  // Hierarchy fields
  parentTaskId?: string | null;
  parentTitle?: string | null; // Enriched from parentTask
  section?: string | null; // "מיצוב" | "איתור"
  isGeneral?: boolean;
  // Discussion indicators
  discussionCount?: number;
  hasUnreadDiscussion?: boolean;
  domain: string;
  topic: string;
  leaderId: string;
  leader_name: string | null;
  leader_email: string;
  dueDate: string | null;
  priority: string;
  status: string;
  createdAt: string;
  collaborators: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
};

export type ParentTask = {
  id: string;
  section: string; // "מיצוב" | "איתור"
  domain: string;
  title: string;
  topic: string;
  priority: string;
  createdByUserId: string;
  createdBy_name: string | null;
  createdBy_email: string;
  createdAt: string;
  updatedAt: string;
  // Discussion indicators
  discussionCount?: number;
  hasUnreadDiscussion?: boolean;
};
