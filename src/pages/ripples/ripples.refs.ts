interface Ripple {
  x: number;
  y: number;
  red: number;
  green: number;
  blue: number;
  opacity: number;
  isHighRed: boolean;
  isHighGreen: boolean;
  isHighBlue: boolean;
  isHighOpacity: boolean;
  isHighChargingRadius: boolean;
  growthRate: number;
  colorChangeRate: number;
  isCharging: boolean;
  touchId?: number;
  radius: number;
}

export const ripplesRef: { current: Ripple[] } = {
  current: [],
};
