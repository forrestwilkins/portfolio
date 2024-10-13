export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export type TouchPointMap = Record<string, TouchPoint>;

export interface RenderData {
  touchPoints: TouchPointMap;
  frameCount: number;
}
