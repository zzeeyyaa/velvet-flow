import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#faf6f6] font-sans dark:bg-[#120f0f]">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-12 bg-white border border-[#e8d5d5] shadow-xl dark:border-[#2f2222] dark:bg-[#1a1515] rounded-2xl my-8 sm:items-start">
        {/* Header Logo */}
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/cupcake.svg"
            alt="VelvetFlow Retro Cupcake Logo"
            width={72}
            height={72}
            className="rounded-lg shadow-sm border border-[#e8d5d5] dark:border-[#2f2222]"
            priority
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full">
              Flash-Sale Simulator
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              Velvet<span className="text-rose-700 dark:text-rose-400">Flow</span>
            </h1>
          </div>
        </div>

        {/* Project Description */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left my-6">
          <p className="max-w-xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            Welcome to <strong>VelvetFlow</strong>, a robust ticket flash-sale simulation system designed to prevent race conditions and handle heavy concurrent loads gracefully.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400 w-full">
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span className="text-rose-600">⚡</span>
              <span>Hono API with Bun & TypeScript</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span className="text-rose-600">🔒</span>
              <span>Redis Distributed Locking (SETNX)</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span className="text-rose-600">🗄️</span>
              <span>PostgreSQL Ticket & Order Registry</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span className="text-rose-600">🐳</span>
              <span>Docker & docker-compose Deployment</span>
            </div>
          </div>
        </div>

        {/* Buttons / Controls */}
        <div className="flex flex-col gap-4 text-base font-semibold sm:flex-row w-full mt-6">
          <a
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-700 text-white transition-all hover:bg-rose-800 active:scale-[0.98] shadow-md shadow-rose-900/10 dark:bg-rose-600 dark:hover:bg-rose-700"
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/cupcake.svg"
              alt="Cupcake Logo"
              width={18}
              height={18}
            />
            Launch Simulator
          </a>
          <a
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-solid border-zinc-200 text-zinc-800 transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-[0.98]"
            href="https://github.com/nextjs/next.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            System Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
