import React from 'react';

// Skeleton shimmer animation
const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

// Table Loading Skeleton - renders only rows for use inside existing tbody
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="hover:bg-slate-50 animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className={`h-4 bg-slate-200 rounded ${shimmer}`}></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Card Grid Loading Skeleton
export const CardGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="space-y-4 animate-pulse">
            <div className={`h-32 bg-slate-200 rounded-lg ${shimmer}`}></div>
            <div className={`h-6 bg-slate-200 rounded ${shimmer}`}></div>
            <div className={`h-4 bg-slate-200 rounded w-3/4 ${shimmer}`}></div>
            <div className="flex gap-2">
              <div className={`h-8 bg-slate-200 rounded flex-1 ${shimmer}`}></div>
              <div className={`h-8 bg-slate-200 rounded flex-1 ${shimmer}`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Card Loading Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3 animate-pulse">
              <div className={`h-4 bg-slate-200 rounded w-24 ${shimmer}`}></div>
              <div className={`h-8 bg-slate-200 rounded w-32 ${shimmer}`}></div>
              <div className={`h-3 bg-slate-200 rounded w-20 ${shimmer}`}></div>
            </div>
            <div className={`w-16 h-16 bg-slate-200 rounded-full ${shimmer}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Form Loading Skeleton
export const FormSkeleton = ({ fields = 5 }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className={`h-4 bg-slate-200 rounded w-32 ${shimmer}`}></div>
          <div className={`h-10 bg-slate-200 rounded ${shimmer}`}></div>
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className={`h-10 bg-slate-200 rounded flex-1 ${shimmer}`}></div>
        <div className={`h-10 bg-slate-200 rounded flex-1 ${shimmer}`}></div>
      </div>
    </div>
  );
};

// Inline Loading Spinner (for buttons, small areas)
export const InlineLoader = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    cyan: 'border-cyan-600 border-t-transparent',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Full Page Loading Overlay
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-slate-700 font-semibold text-lg">{message}</p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-slate-100 rounded-full p-6 mb-4">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Compact Loading Bar (for top of page)
export const LoadingBar = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200">
      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default {
  TableSkeleton,
  CardGridSkeleton,
  StatsCardSkeleton,
  FormSkeleton,
  InlineLoader,
  PageLoader,
  EmptyState,
  LoadingBar,
};
