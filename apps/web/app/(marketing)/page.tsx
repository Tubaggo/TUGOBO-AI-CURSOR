import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-lg">Tugobo AI</span>
        </div>
        <Link
          href="/auth/login"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          AI-powered hotel reservations via WhatsApp
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Turn WhatsApp inquiries
          <br />
          <span className="text-blue-400">into confirmed bookings</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Tugobo AI answers guest questions, sends quotes, and closes
          reservations — automatically, 24/7, in any language.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors w-full sm:w-auto"
          >
            Start free trial
          </Link>
          <a
            href="#how-it-works"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Guest messages on WhatsApp",
              description:
                "A guest asks about room availability, prices, or amenities — in any language.",
            },
            {
              step: "02",
              title: "AI qualifies and quotes",
              description:
                "Tugobo AI extracts travel details, checks your availability, and sends a personalised quote.",
            },
            {
              step: "03",
              title: "Reservation confirmed",
              description:
                "Guest pays via a secure link. Reservation is created instantly. Staff notified.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
            >
              <div className="text-blue-400 text-sm font-bold mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm border-t border-slate-800 mt-8">
        © {new Date().getFullYear()} Tugobo AI. Built for hospitality.
      </footer>
    </main>
  );
}
