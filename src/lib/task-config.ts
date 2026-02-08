export const statusConfig = {
  pending: {
    label: "משימה פתוחה",
    order: 0,
    color: "bg-yellow-400",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-yellow-800",
    gradientFrom: "from-yellow-50",
    gradientTo: "to-yellow-100",
    stickyNoteColor: "bg-yellow-50",
    stickyNoteBorder: "border-yellow-300",
    stickyNoteShadow: "shadow-[0_4px_8px_rgba(234,179,8,0.2)]",
  },
  "in-progress": {
    label: "בטיפול",
    order: 1,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-800",
    gradientFrom: "from-blue-50",
    gradientTo: "to-blue-100",
    stickyNoteColor: "bg-blue-50",
    stickyNoteBorder: "border-blue-300",
    stickyNoteShadow: "shadow-[0_4px_8px_rgba(59,130,246,0.2)]",
  },
  completed: {
    label: "בוצע",
    order: 2,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-800",
    gradientFrom: "from-green-50",
    gradientTo: "to-green-100",
    stickyNoteColor: "bg-green-50",
    stickyNoteBorder: "border-green-300",
    stickyNoteShadow: "shadow-[0_4px_8px_rgba(34,197,94,0.2)]",
  },
};

export const getStatusColor = (status: string): string => {
  const statusKey = status as keyof typeof statusConfig;
  return statusConfig[statusKey]?.color || statusConfig.pending.color;
};

export const getStatusConfig = (status: string) => {
  const statusKey = status as keyof typeof statusConfig;
  return statusConfig[statusKey] || statusConfig.pending;
};

export const priorityConfig = {
  low: {
    label: "נמוכה",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    borderColor: "border-blue-200",
    accentColor: "bg-blue-500",
  },
  medium: {
    label: "בינונית",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    borderColor: "border-yellow-200",
    accentColor: "bg-yellow-500",
  },
  high: {
    label: "גבוהה",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    borderColor: "border-red-200",
    accentColor: "bg-red-500",
  },
};

export const getPriorityConfig = (priority: string) => {
  const priorityKey = priority as keyof typeof priorityConfig;
  return priorityConfig[priorityKey] || priorityConfig.medium;
};
