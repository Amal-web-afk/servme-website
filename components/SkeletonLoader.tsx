import React from "react";

export const MenuSkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Categories skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse shrink-0" />
        ))}
      </div>

      {/* Grid items skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border animate-pulse">
            <div className="w-24 h-24 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-16 rounded bg-muted" />
                <div className="h-8 w-20 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeaderSkeletonLoader: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
};
