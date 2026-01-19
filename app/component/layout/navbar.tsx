export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-surface-dark/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3 font-bold text-lg">
          <span className="text-primary">UniFYP</span>
          Partner
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:block text-text-muted">
            Already a partner?
          </span>
          <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold">
            Log In
          </button>
        </div>
      </div>
    </header>
  );
}
