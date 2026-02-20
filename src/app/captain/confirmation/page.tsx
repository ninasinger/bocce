export default function ConfirmationPage() {
  return (
    <main className="card p-6">
      <h2 className="section-title">Submission received</h2>
      <p className="mt-2 text-sm text-stone">
        Your score is locked. The match will verify once the opposing captain
        submits the same result.
      </p>
      <div className="mt-6 rounded-xl bg-field/80 p-4">
        <p className="text-xs uppercase tracking-wide text-stone">Status</p>
        <p className="mt-2 font-semibold">Pending verification</p>
      </div>
    </main>
  );
}
