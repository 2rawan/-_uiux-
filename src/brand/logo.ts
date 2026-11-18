export const logo = {
  name: "Forma · Open door",
  viewBox: "0 0 40 40",
  colors: { primary: "#6336E6", accent: "#31D4B0", light: "#FFFFFF" },
  shapes: [
    {
      name: "Door · left upright",
      x: 5,
      y: 4,
      width: 8,
      height: 32,
      radius: 2,
    },
    { name: "Door · lintel", x: 5, y: 4, width: 29, height: 8, radius: 2 },
    { name: "F · crossbar", x: 5, y: 18, width: 23, height: 7, radius: 2 },
    {
      name: "Presence · welcome",
      x: 27,
      y: 28,
      width: 8,
      height: 8,
      radius: 4,
      accent: true,
    },
  ],
};
export function logoSvg(light = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.viewBox}" fill="none" role="img" aria-label="Forma"><title>Forma · Open door</title>${logo.shapes.map((s) => `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" rx="${s.radius}" fill="${s.accent ? logo.colors.accent : light ? logo.colors.light : logo.colors.primary}"/>`).join("")}</svg>`;
}
