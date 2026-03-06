import React from 'react';
import { motion } from 'motion/react';

export default function SkeletonScreen() {
  return (
    <div className="h-full w-full bg-white p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-full" />
      </div>

      {/* Hero Skeleton */}
      <div className="w-full h-48 bg-gray-100 rounded-2xl" />

      {/* List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
              <div className="w-1/2 h-3 bg-gray-200 rounded" />
            </div>
            <div className="w-12 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 flex justify-between">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-12 h-12 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
