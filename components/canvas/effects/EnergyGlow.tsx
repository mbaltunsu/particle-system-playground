'use client';

import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { DEFAULTS } from '@/lib/constants';

export default function EnergyGlow() {
  return (
    <EffectComposer>
      <Bloom
        intensity={DEFAULTS.bloomIntensity}
        luminanceThreshold={DEFAULTS.bloomThreshold}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
