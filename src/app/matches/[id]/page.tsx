export default function MatchDetailPage() {
  return (
    <main className="card p-6">
      <h2 className="section-title">Match detail</h2>
      <p className="mt-2 text-sm text-stone">Read-only view of verified results.</p>
      <div className="mt-6 space-y-3">
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-stone">Scoreline</p>
          <p className="mt-2 font-semibold">Harbor Rollers 16, 12</p>
          <p className="font-semibold">West Cove 11, 16</p>
        </div>
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-stone">Notes</p>
          <p className="mt-2 text-sm">
            Clean match, no disputes. Bonus point awarded for higher total score.
          </p>
        </div>
      </div>
    </main>
  );
}
