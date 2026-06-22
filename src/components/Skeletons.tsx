export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-3.5 w-20 rounded" />
              <div className="skeleton h-8 w-16 rounded mt-3" />
            </div>
            <div className="skeleton w-10 h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApiListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="skeleton h-5 w-3/4 rounded mb-2" />
          <div className="skeleton h-5 w-full rounded mb-3" />
          <div className="skeleton h-3 w-5/6 rounded mb-2" />
          <div className="skeleton h-3 w-2/3 rounded mb-4" />
          <div className="flex items-center gap-4 pt-3 border-t border-dark-700/50">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="card p-5 h-fit sticky top-24">
      <div className="skeleton h-5 w-16 rounded mb-5" />
      <div className="space-y-5">
        <div>
          <div className="skeleton h-4 w-20 rounded mb-2.5" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-7 w-14 rounded-md" />
            ))}
          </div>
        </div>
        <div>
          <div className="skeleton h-4 w-20 rounded mb-2.5" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-7 w-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6">
        <div className="skeleton h-7 w-48 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="skeleton h-4 w-16 rounded mb-1.5" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
          <div>
            <div className="skeleton h-4 w-16 rounded mb-1.5" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="card p-6">
        <div className="skeleton h-6 w-32 rounded mb-4" />
        <div className="space-y-3">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
