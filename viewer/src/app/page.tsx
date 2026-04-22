"use client";

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black text-white">
      <header className="absolute left-4 top-4 z-10 rounded-lg bg-black/60 px-4 py-2 backdrop-blur">
        <h1 className="text-xl font-semibold">splat-studio</h1>
        <p className="text-xs text-gray-300">
          Gaussian Splatting viewer · <a className="underline" href="https://github.com/TheRuKa7/splat-studio">GitHub</a>
        </p>
      </header>
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">🚧 Viewer ships in P2–P3.</p>
          <p className="mt-2 text-sm text-gray-400">
            See{" "}
            <a className="underline" href="https://github.com/TheRuKa7/splat-studio/blob/main/docs/PLAN.md">
              docs/PLAN.md
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
