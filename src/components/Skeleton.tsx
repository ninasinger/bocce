export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-stone/15 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white/70 p-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-5 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />
    </div>
  );
}

export function SkeletonStandingRow() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

export function SkeletonAwardCard() {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
