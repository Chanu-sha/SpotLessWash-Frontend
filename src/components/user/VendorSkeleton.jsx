import React from "react";

const VendorSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-32 sm:h-40 bg-gradient-to-r from-gray-200 to-gray-300 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between items-center">
              <div className="flex-1 pr-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default VendorSkeleton;