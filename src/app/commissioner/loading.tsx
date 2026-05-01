import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function CommissionerLoading() {
  return (
    <main className="space-y-6">
      <section className="card fade-in p-4 md:p-6">
        <Skeleton className="h-6 w-56" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </section>
      <section className="card p-4 md:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 space-y-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </main>
  );
}
