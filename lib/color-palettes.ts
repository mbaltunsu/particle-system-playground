export interface ColorPalette {
  label: string;
  stops: [number, number, number][]; // 5 RGB stops
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  plasma: {
    label: 'Plasma',
    stops: [
      [0.05, 0.15, 0.6],   // deep blue
      [0.0, 0.7, 1.0],     // cyan
      [0.7, 1.0, 1.0],     // white-cyan
      [1.0, 0.6, 0.1],     // orange
      [1.0, 0.2, 0.05],    // red
    ],
  },
  ice: {
    label: 'Ice',
    stops: [
      [0.1, 0.1, 0.3],     // dark blue
      [0.2, 0.4, 0.8],     // blue
      [0.4, 0.7, 1.0],     // light blue
      [0.7, 0.85, 1.0],    // pale blue
      [1.0, 1.0, 1.0],     // white
    ],
  },
  fire: {
    label: 'Fire',
    stops: [
      [0.1, 0.0, 0.0],     // dark red
      [0.7, 0.1, 0.0],     // red
      [1.0, 0.4, 0.0],     // orange
      [1.0, 0.8, 0.2],     // yellow
      [1.0, 1.0, 0.8],     // white-yellow
    ],
  },
  neon: {
    label: 'Neon',
    stops: [
      [0.0, 0.8, 0.2],     // green
      [0.0, 1.0, 0.8],     // cyan-green
      [0.4, 0.2, 1.0],     // purple
      [1.0, 0.0, 0.8],     // magenta
      [1.0, 0.4, 1.0],     // pink
    ],
  },
  monochrome: {
    label: 'Monochrome',
    stops: [
      [0.1, 0.1, 0.1],     // near black
      [0.3, 0.3, 0.3],     // dark gray
      [0.5, 0.5, 0.5],     // mid gray
      [0.8, 0.8, 0.8],     // light gray
      [1.0, 1.0, 1.0],     // white
    ],
  },
  ocean: {
    label: 'Ocean',
    stops: [
      [0.0, 0.05, 0.2],    // deep ocean
      [0.0, 0.2, 0.5],     // dark blue
      [0.0, 0.5, 0.7],     // teal
      [0.2, 0.8, 0.9],     // cyan
      [0.6, 1.0, 1.0],     // bright cyan
    ],
  },
  aurora: {
    label: 'Aurora',
    stops: [
      [0.0, 0.5, 0.2],     // green
      [0.0, 0.8, 0.6],     // teal
      [0.3, 0.4, 0.9],     // blue-purple
      [0.7, 0.2, 0.8],     // purple
      [1.0, 0.3, 0.6],     // pink
    ],
  },
};

export const PALETTE_NAMES = Object.keys(COLOR_PALETTES);
