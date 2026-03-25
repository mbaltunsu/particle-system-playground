'use client';

import dynamic from 'next/dynamic';

const ParticleScene = dynamic(() => import('@/components/canvas/ParticleScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#030308] font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-cyan-400/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400/60" />
        </div>
        <p className="text-[10px] tracking-[0.3em] text-cyan-400/40">
          INITIALIZING SIMULATION
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <ParticleScene />;
}
