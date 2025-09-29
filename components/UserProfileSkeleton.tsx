export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 h-auto  animate-pulse">
      {/* Avatar skeleton */}
      <div className="h-9 w-9 rounded-full bg-gray-300" />

      {/* Name + email skeleton */}
      <div className="hidden md:flex flex-col items-start text-left gap-1">
        <div className="h-4 w-28 rounded-md bg-gray-300" />
        <div className="h-3 w-20 rounded-md bg-gray-300" />
      </div>
    </div>
  );
}
