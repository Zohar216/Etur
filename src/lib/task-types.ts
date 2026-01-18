export type Task = {
  id: string;
  title: string;
  description: string | null;
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
