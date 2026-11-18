export const logo = {
  name: "Forma · Signature",
  style: "wordmark",
  wordmark: "FORMA",
  fontFamily: "Georgia",
  letterSpacing: 5,
  viewBox: "0 0 280 76",
  colors: { primary: "#17213B", accent: "#B89555", light: "#FFFFFF" },
};
export function logoSvg(light = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.viewBox}" role="img" aria-label="Forma"><title>Forma · Signature</title><text x="140" y="48" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-size="44" letter-spacing="5" fill="${light ? logo.colors.light : logo.colors.primary}">FORMA</text><path d="M115 65H165" stroke="${logo.colors.accent}" stroke-width="2"/></svg>`;
}
