import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function CaptainDashboardLoading() {
  return (
    <main className="space-y-6">
      <section className="card fade-in p-4 md:p-6">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </main>
  );
}
