export function SkeletonLoader() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
      <div className="flex justify-center gap-2 mb-4">
        <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded mt-4"></div>
    </div>
  )
}
