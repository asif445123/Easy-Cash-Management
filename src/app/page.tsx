import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
            ₨
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">EasyCash</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/demo" className="text-ink/70 hover:text-ink transition-colors">
            View demo
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Log in
          </Link>
        </nav>
      </header>

      <section className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs font-semibold text-primary mb-4">
            Ledger for people who hate spreadsheets
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-ink mb-6">
            Know exactly where your money went — and who still owes you.
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            EasyCash keeps a running ledger of income, expenses, and payments. Every
            account is approved by an admin before it can sign in, so your books stay
            private.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Create an account
            </Link>
            <Link
              href="/demo"
              className="px-6 py-3 rounded-full border border-ink/15 text-ink font-semibold hover:bg-ink/5 transition-colors"
            >
              Explore the demo
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-ink/5 border border-ink/5 p-6">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">This month</p>
          <p className="font-display text-3xl font-bold text-ink mb-4">Rs 184,250</p>
          <div className="space-y-3">
            {[
              { label: "Site Payment - Al Habib Plaza", amount: "+150,000", positive: true },
              { label: "Cement & Bricks", amount: "-42,000", positive: false },
              { label: "Labour Wages - Week 29", amount: "-38,500", positive: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{row.label}</span>
                <span className={row.positive ? "text-primary font-semibold" : "text-danger font-semibold"}>
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-6">
        <p className="text-center text-xs text-ink/40">
          &copy; {new Date().getFullYear()} EasyCash. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
