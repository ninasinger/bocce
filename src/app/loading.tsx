import { Skeleton, SkeletonCard, SkeletonStandingRow } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <main className="space-y-6">
      <section className="card fade-in p-4 md:p-6">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 md:p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-2">
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
          </div>
        </div>
        <div className="card p-4 md:p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    </main>
  );
}
