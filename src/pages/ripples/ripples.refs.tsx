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
  growthRate: number;
  colorChangeRate: number;
  radius: number;
}

export const ripplesRef: { current: Ripple[] } = {
  current: [],
};
