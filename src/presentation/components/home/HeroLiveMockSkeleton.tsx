"use client";

/** Fixed-size loading skeleton matching HeroLiveMock dimensions to prevent layout shift. */
export function HeroLiveMockSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="wall-ocean mt-14 w-full max-w-[1160px] p-3 text-left shadow-[0_30px_100px_rgba(0,0,0,0.75)] sm:mt-16 sm:p-5 md:p-6"
    >
      <div className="flex h-8 items-center justify-between rounded-[12px] bg-black/40 px-3">
        <div className="h-3.5 w-28 rounded-full bg-white/10" />
        <div className="hidden h-5 w-40 rounded-full bg-white/10 sm:block" />
        <div className="h-3.5 w-16 rounded-full bg-white/10" />
      </div>

      <div className="mx-auto mt-5 max-w-[960px]">
        <div className="h-[440px] rounded-[18px] border border-white/10 bg-[#0d1117]/80 sm:h-[470px]" />
      </div>

      <div className="mt-5 flex justify-center sm:mt-6">
        <div className="home-glass h-[72px] w-full max-w-[580px] rounded-[22px]" />
      </div>
    </div>
  );
}
