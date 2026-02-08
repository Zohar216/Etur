"use client";

export const TaskCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="absolute right-0 top-0 h-full w-2.5 bg-gray-300" />
      
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        <div className="h-5 w-16 bg-gray-200 rounded-md" />
      </div>

      <div className="pr-3 space-y-3">
        <div className="space-y-2 mt-8">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-md" />
          <div className="h-6 w-20 bg-gray-200 rounded-md" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="w-6 h-6 rounded-full bg-gray-200 -mr-2" />
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ParentTaskCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white p-4 shadow-md animate-pulse">
      <div className="absolute left-0 top-0 h-full w-3 bg-gray-300" />
      
      <div className="pr-2 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-16 bg-gray-200 rounded-md" />
          <div className="h-5 w-20 bg-gray-200 rounded-md" />
        </div>
        
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};
