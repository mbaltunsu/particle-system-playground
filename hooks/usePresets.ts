'use client';

import { useState, useCallback, useEffect } from 'react';
import { BUILT_IN_PRESETS, type Preset } from '@/lib/presets';

const STORAGE_KEY = 'particle-playground-presets';

function loadCustomPresetsFromStorage(): Record<string, Preset> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Preset>;
  } catch {
    return {};
  }
}

function saveCustomPresetsToStorage(presets: Record<string, Preset>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function usePresets() {
  const [customPresets, setCustomPresets] = useState<Record<string, Preset>>({});

  useEffect(() => {
    setCustomPresets(loadCustomPresetsFromStorage());
  }, []);

  const presetNames = [
    ...Object.keys(BUILT_IN_PRESETS),
    ...Object.keys(customPresets),
  ];

  const customPresetNames = Object.keys(customPresets);

  const loadPreset = useCallback(
    (name: string): Record<string, any> | null => {
      const preset = BUILT_IN_PRESETS[name] ?? customPresets[name];
      if (!preset) return null;
      return { ...preset.values };
    },
    [customPresets],
  );

  const saveCustomPreset = useCallback(
    (name: string, values: Record<string, any>) => {
      const next = {
        ...customPresets,
        [name]: {
          label: name,
          description: 'Custom preset',
          values: values as Preset['values'],
        },
      };
      setCustomPresets(next);
      saveCustomPresetsToStorage(next);
    },
    [customPresets],
  );

  const deleteCustomPreset = useCallback(
    (name: string) => {
      const next = { ...customPresets };
      delete next[name];
      setCustomPresets(next);
      saveCustomPresetsToStorage(next);
    },
    [customPresets],
  );

  return {
    presetNames,
    loadPreset,
    saveCustomPreset,
    deleteCustomPreset,
    customPresetNames,
  };
}
