export const statusConfig = {
  pending: {
    label: "משימה פתוחה",
    order: 0,
    color: "bg-gray-400",
  },
  "in-progress": {
    label: "בטיפול",
    order: 1,
    color: "bg-blue-500",
  },
  completed: {
    label: "בוצע",
    order: 2,
    color: "bg-green-500",
  },
};

export const getStatusColor = (status: string): string => {
  const statusKey = status as keyof typeof statusConfig;
  return statusConfig[statusKey]?.color || statusConfig.pending.color;
};

export const priorityConfig = {
  low: {
    label: "נמוכה",
    color: "bg-blue-100 text-blue-700",
  },
  medium: {
    label: "בינונית",
    color: "bg-yellow-100 text-yellow-700",
  },
  high: {
    label: "גבוהה",
    color: "bg-red-100 text-red-700",
  },
};

export const getPriorityConfig = (priority: string) => {
  const priorityKey = priority as keyof typeof priorityConfig;
  return priorityConfig[priorityKey] || priorityConfig.medium;
};
