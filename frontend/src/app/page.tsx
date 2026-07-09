import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf6f6] font-sans dark:bg-[#120f0f] text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e8d5d5] bg-white/85 backdrop-blur-md dark:border-[#2f2222] dark:bg-[#1a1515]/85 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/cupcake_ticket.svg"
              alt="VelvetFlow Logo"
              width={40}
              height={40}
            // className="rounded-lg shadow-sm border border-[#e8d5d5] dark:border-[#2f2222]"
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Velvet<span className="text-rose-700 dark:text-rose-400">Flow</span>
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
                Flash-Sale Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Backend Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-950/15 dark:to-rose-900/5 border border-rose-100 dark:border-rose-950/40 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-rose-900 dark:text-rose-300">High-Concurrency Live Monitor</h2>
            <p className="text-sm text-rose-800/80 dark:text-rose-400/80 mt-1 leading-relaxed">
              Use the simulator panel to trigger concurrent checkouts. Watch the real-time chart below to observe how Hono, Redis locking (SETNX), and PostgreSQL prevent race conditions under load.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://github.com/zzeeyyaa/velvet-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-rose-200 dark:border-rose-950 text-rose-800 dark:text-rose-300 bg-white/60 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all active:scale-[0.98]"
            >
              Docs
            </a>
          </div>
        </div>

        {/* Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: ControlPanel Placeholder */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a1515] border border-[#e8d5d5] dark:border-[#2f2222] rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4 mb-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Simulation Controls</h3>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded">ControlPanel</span>
              </div>

              {/* TODO: Insert ControlPanel Component here once created */}
              {/* <ControlPanel /> */}

              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
                <span className="text-3xl mb-2">🎛️</span>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Control Panel Placeholder</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-xs">
                  This card will host the ticket parameters, user concurrent slider, and trigger checkout buttons.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: RPSChart Placeholder */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a1515] border border-[#e8d5d5] dark:border-[#2f2222] rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4 mb-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">RPS & Latency Metrics</h3>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded">RPSChart</span>
              </div>

              {/* TODO: Insert RPSChart Component here once created */}
              {/* <RPSChart /> */}

              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
                <span className="text-3xl mb-2">📊</span>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Real-Time Performance Chart</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-md">
                  This card will render live throughput (RPS), lock collision rates, and transaction latency graphs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
