import { Skeleton, SkeletonStandingRow } from "@/components/Skeleton";

export default function StandingsLoading() {
  return (
    <main className="space-y-6">
      <section className="card fade-in p-4 md:p-6">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonStandingRow key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
