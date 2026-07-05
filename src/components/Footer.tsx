export function Footer() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg tracking-[0.2em] text-foreground">NOBLE</span>
            <span className="font-display text-lg tracking-[0.2em] text-brand">DRIVE</span>
          </div>
          <p className="tracking-wide">© {new Date().getFullYear()} NOBLE DRIVE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
