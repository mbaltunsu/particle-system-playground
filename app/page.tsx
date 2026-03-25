'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';
import type { RecommendedPreset } from '@/lib/device-detection';

const ParticleScene = dynamic(() => import('@/components/canvas/ParticleScene'), {
  ssr: false,
});

export default function Home() {
  const [started, setStarted] = useState(false);
  const [initialPreset, setInitialPreset] = useState<RecommendedPreset>('medium');

  const handleReady = (preset: RecommendedPreset) => {
    setInitialPreset(preset);
    setStarted(true);
  };

  if (!started) {
    return <LoadingScreen onReady={handleReady} />;
  }

  return <ParticleScene initialPreset={initialPreset} />;
}
