import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s infinite linear',
      }}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonStats: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};



export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 3,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <Skeleton className="h-6 w-48 mb-4" />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="text-left py-3 px-4">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-3 px-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SkeletonInput: React.FC<{ className?: string; hasLabel?: boolean }> = ({
  className = '',
  hasLabel = true,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {hasLabel && <Skeleton className="h-4 w-24" />}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
};

export const SkeletonButton: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-md ${className}`} />
  );
};

export const SkeletonFilterGroup: React.FC<{
  items?: number;
  className?: string;
}> = ({
  items = 4,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Array.from({ length: items }).map((_, index) => (
          <SkeletonInput key={index} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
        <div className="ml-auto">
          <SkeletonButton size="lg" />
        </div>
      </div>
    </div>
  );
};
