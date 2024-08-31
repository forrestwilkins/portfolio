export const getRandomRGB = () => {
  const red = Math.random() * 255;
  const green = Math.random() * 255;
  const blue = Math.random() * 255;
  return `rgb(${red}, ${green}, ${blue})`;
};
