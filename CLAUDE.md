@AGENTS.md

## Project Overview

GPU-accelerated particle physics playground inspired by Unreal Engine's Niagara system. Built with Next.js, React Three Fiber, Three.js GLSL shaders, Leva controls, and Framer Motion.

## Architecture

**GPU-first GPGPU simulation** — zero per-particle CPU loops:
- `GPUComputationRenderer` runs two fragment shader passes per frame (position + velocity)
- Two float textures: position (xyz + life) and velocity (xyz + energy)
- Texture size determines particle count: 64² = 4K, 128² = 16K, 256² = 65K, 512² = 262K, 1024² = 1M
- Multi-emitter system stores up to 32 emitters in a DataTexture (4x32 RGBA Float32)

**Data flow:** Leva UI → `useSimulationControls` mutable ref → `useGPUCompute` syncs uniforms per frame → GPU compute shaders → render shaders read output textures

## Key Directories

- `shaders/compute/` — GPU simulation (position + velocity integration)
- `shaders/render/` — Particle vertex/fragment display shaders
- `shaders/lib/` — Reusable GLSL: forces, noise, emitters, boids, nbody, sdf
- `shaders/effects/` — Trail, shockwave shader code
- `components/canvas/` — R3F components (ParticleScene, ParticleSystem, GPUCompute, effects)
- `components/ui/` — UI panels (Overlay, EmitterPanel, TimelineEditor, ExportPanel, EffectTriggers)
- `lib/` — Constants, types, presets, color palettes, GPU capabilities, emitter config
- `lib/export/` — MediaRecorder + WebCodecs video export
- `lib/scene/` — Keyframe types, interpolation, scene manager (localStorage)
- `hooks/` — useGPUCompute, useSimulationControls, useSceneTimeline, useExport, usePresets

## Features

- **10 emitter shapes:** Point, Sphere, Directional, Box, Cylinder, Cone, Torus, Disc, Line, Grid
- **9 forces:** Gravity, Repulsion, Magnetic, Curl Noise, Vortex, Drag, Wind, Point Attractor, Fractal Turbulence
- **4 simulation modes:** Particles, Boids (flocking), N-Body (gravity), Cloth
- **SDF collision:** 5 primitives (sphere, box, plane, cylinder, torus), 2 active colliders
- **Multi-emitter:** Up to 32 independent emitters via DataTexture
- **7 color palettes:** Plasma, Ice, Fire, Neon, Monochrome, Ocean, Aurora
- **12 presets:** Default, Galaxy, Fire, Rain, Snow, Aurora, Magnetic Field, Vortex Storm, Calm, Chaos, Flock, Electromagnetic
- **Scene timeline:** Keyframe animation with interpolation, save/load, play range markers
- **Video export:** Quick WebM (MediaRecorder) + Quality MP4 (WebCodecs + mp4-muxer)
- **5 resolution presets:** Low (4K) → Ultra+ (1M particles)

## Rules

### Hydration
- Always add `suppressHydrationWarning` to `<html>` and `<body>` in `app/layout.tsx`

### Leva Controls
- Use `options: { Label: value }` objects for dropdowns, NOT arrays (arrays create searchable text inputs)
- Use Leva's `label` property for Niagara-style display names (e.g., `label: 'Gravity Force'`)
- Use `render: (get) => condition` on folders for conditional visibility
- Emitter controls are in custom EmitterPanel (NOT Leva) — Leva can't do dynamic arrays

### Shaders
- All GLSL is stored as TypeScript template literal strings in `.glsl.ts` files
- Shared GLSL libraries use `${import}` template injection (not `#include`)
- Emitter data is read from DataTexture, NOT scalar uniforms
- Always clamp `uDeltaTime` in shaders: `float dt = min(uDeltaTime, 0.05);`

### GPU Compute
- Skip compute when `delta > 0.5` (stall detector) to prevent mass particle death
- `emittersRef` syncs React state → ref via useEffect for R3F useFrame access
- DataTexture filter must be `NearestFilter` (no interpolation between emitter rows)

### Timeline / Scene
- Filter state keys through `LEVA_KEYS` whitelist before calling `levaSet()` — removed emitter fields crash Leva
- Wrap `levaSet` in try-catch during playback
- Throttle Leva UI sync to 10Hz to avoid React re-render flood

### Performance
- Never do per-particle work on CPU — GPU handles all simulation
- Particle count = texture_size² (not configurable independently)
- Boids/N-Body use stochastic sampling (128-512 neighbors) not O(n²)
- DLSS/FSR not available in WebGL — use half-res FBO + bilateral upscale instead
