import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[200%_100%] rounded-sm ${className}`}
      style={{
        animation: 'shimmer 2s infinite linear',
      }}
    />
  );
};

/**
 * 
 * @param lines số lượng dòng
 * @param className class name cho ô chứa
 * @returns 
 */
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

/**
 * 
 * @param className class name cho ô chứa
 * @returns 
 */
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

/**
 * 
 * @param rows số lượng hàng
 * @param columns số lượng cột
 * @returns 
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; noContainer?: boolean }> = ({
  rows = 5,
  columns = 3,
  noContainer = false,
}) => {
  return (
    <div className={noContainer ? '' : "bg-white rounded-xl shadow-md p-6 border border-gray-100"}>
      {/* <Skeleton className="h-6 w-48 mb-4" /> */}

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

/**
 * 
 * @param className class name cho ô chứa
 * @param hasLabel có hiển thị label không
 * @returns 
 */
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
      sm: 'h-8 w-28',
      md: 'h-10 w-32',
      lg: 'h-12 w-36',
    };

    return (
      <Skeleton className={`${sizeClasses[size]} rounded-md ${className}`} />
    );
  };
  
/**
 * 
 * @param items số lượng ô input
 * @param className class name cho ô chứa
 * @returns 
 */
export const SkeletonFilterGroup: React.FC<{
  items?: number;
  className?: string;
  noContainer?: boolean;
}> = ({
  items = 4,
  className = '',
  noContainer = false,
}) => {
    return (
      <div className={noContainer ? className : `bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
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
  /**
   * 
   * @param items số lượng ô input
   * @param itemButton số lượng ô button
   * @param className class name cho ô chứa
   * @param positionButton vị trí button
   * grid grid-cols-1 md:grid-cols-4 gap-4 mb-4
   * @returns 
   */
export const SkeletonSearchGroup: React.FC<{
  items?: number;
  itemButton?: number;
  className?: string;
  positionButton?: 'start' | 'end' | 'center';
  noContainer?: boolean;
}> = ({
  items = 4,
  itemButton = 2,
  className = '',
  positionButton = '',
  noContainer = false,
}) => {
    return (
      <div
        className={noContainer ? '' : `bg-white rounded-xl shadow-md p-6 border border-gray-100`}
      >
        <div className={className || 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'}>
          {Array.from({ length: items }).map((_, index) => (
            <SkeletonInput key={index} />
          ))}

          <div className={`${positionButton ? 'col-span-full' :' '} flex justify-${positionButton ? positionButton : 'between'} gap-2 items-end  mt-4 md:mt-0`}>
            {
              Array.from({ length: itemButton }).map((_, index) => (
                <SkeletonButton
                  key={index}
                  size='md'
                />
              ))
            }
          </div>
        </div>
      </div>
    );
  };

export const SkeletonTitle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`mb-3 border-b border-gray-200 pb-2 flex items-center gap-2 ${className}`}>
      <Skeleton className="w-5 h-5 rounded-sm" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
};
