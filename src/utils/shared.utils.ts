export const sleep = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getIsTouchDevice = () =>
  !!navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;
