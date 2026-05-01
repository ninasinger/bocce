import { Skeleton } from "@/components/Skeleton";

export default function MatchLoading() {
  return (
    <main className="space-y-6">
      <section className="card fade-in p-4 md:p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-7 w-2/3" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </section>
    </main>
  );
}
