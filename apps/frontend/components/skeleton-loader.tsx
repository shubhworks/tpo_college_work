export function SkeletonLoader() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl animate-pulse">
      <div className="mb-4 flex justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
      <div className="flex justify-center gap-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}
