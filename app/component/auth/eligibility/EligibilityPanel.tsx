export default function EligibilityPanel() {
  return (
    <div className="border rounded-xl bg-white dark:bg-surface-dark">
      <div className="h-2 bg-gradient-to-r from-primary to-blue-400" />
      <div className="p-6 space-y-4">
        <h2 className="font-bold text-xl">Eligibility Check</h2>
        <p className="text-sm text-text-muted">
          Registration is limited to semesters 5–7.
        </p>

        <ul className="space-y-3 text-sm">
          <li className="opacity-50">Semesters 1–4 ❌</li>
          <li className="font-semibold text-primary">Semesters 5–7 ✅</li>
          <li className="opacity-50">Semesters 8+ ❌</li>
        </ul>
      </div>
    </div>
  );
}
