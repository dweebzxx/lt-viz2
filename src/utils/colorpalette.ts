export const CORPORATE_PALETTE = [
  '#ED1C24', // Classic Red
  '#0072BC', // Primary Blue
  '#FFD100', // Sunny Yellow
  '#00A651', // Grass Green
  '#F15A24', // Warm Orange
  '#EC008C', // Magenta Pink
  '#662D91', // Playful Purple
  '#2E3192', // Deep Blue
  '#00AEEF', // Sky Blue
  '#8DC63F', // Lime Green
];

export const shufflePalette = (palette: string[]): string[] => {
  const copy = [...palette];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
