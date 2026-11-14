export default function PostSkeleton() {
  return (
    <div className="panel-2008 p-4 mb-3">
      <div className="flex gap-3">
        <div 
          className="w-10 h-10 flex-shrink-0 bg-gray-200 rounded-sm"
          style={{ width: '40px', height: '40px' }}
        />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2 w-24" />
          <div className="h-3 bg-gray-200 rounded mb-1 w-full" />
          <div className="h-3 bg-gray-200 rounded mb-1 w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
      </div>
    </div>
  );
}
