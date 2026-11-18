/**
 * Shared iris maths so the WebGL scene, the SVG fallback and the DOM reel clip stay in sync.
 * Units: 1 world unit = half the stage height (orthographic camera, frustum height 2).
 */
export const HOUSING_INNER = 0.9;
export const HOUSING_OUTER = 1.04;
export const OPEN_MAX = 0.95; // blades fully retracted under the housing ring
/** Progress used for the static render (reduced motion / no WebGL): half open, reel visible through the hole. */
export const STATIC_PROGRESS = 0.5;
const OPEN_END = 0.62; // phase A: blades open; phase B: dolly through the lens
const SCALE_END = 2.7;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * t;

export type IrisState = {
  /** Inradius of the polygonal opening (world units, before scale). */
  opening: number;
  /** Rotation of the whole blade set — real irises twist as they open. */
  twist: number;
  /** Lens scale — grows in phase B so the housing passes beyond the frame. */
  scale: number;
};

export function irisState(progress: number): IrisState {
  const p = clamp01(progress);
  const a = easeInOut(clamp01(p / OPEN_END));
  const b = easeIn(clamp01((p - OPEN_END) / (1 - OPEN_END)));
  return {
    opening: a * OPEN_MAX,
    twist: a * 0.75,
    scale: 1 + b * (SCALE_END - 1),
  };
}

/** Radius (in px) of the visible circle through the housing, used to clip the DOM reel. */
export function clipRadiusPx(progress: number, stageHeightPx: number) {
  return HOUSING_INNER * irisState(progress).scale * (stageHeightPx / 2);
}

export const bladeAngle = (i: number, n: number, twist: number) => (i / n) * Math.PI * 2 + twist;
