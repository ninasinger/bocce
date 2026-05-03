const documents = [
  {
    title: "2026 Roster",
    description: "Team and player roster for the 2026 season.",
    href: "/documents/2026-roster.pdf"
  },
  {
    title: "2026 Rules",
    description: "Official league rules for the 2026 season.",
    href: "/documents/2026-rules.pdf"
  }
];

export default function DocumentsPage() {
  return (
    <main className="space-y-6">
      <section className="card p-4 md:p-6">
        <h2 className="section-title">Documents</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              download
              className="tap rounded-xl border border-white/70 bg-field/85 p-4 shadow-sm transition hover:bg-white"
            >
              <span className="font-semibold text-ink">{doc.title}</span>
              <span className="mt-1 block text-sm text-stone">{doc.description}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
