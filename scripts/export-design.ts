import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { screens, sections } from "../src/prototype/catalog.ts";

const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/design/forma-design.json",
);

const colors = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#292B30",
  muted: "#878991",
  line: "#EAEAF0",
  purple: "#8069B8",
  purpleLight: "#F0ECF8",
  sage: "#75957F",
  sageLight: "#EDF4EF",
  peach: "#F4E5D9",
  danger: "#B85A61",
};

function validateCatalog() {
  if (!Array.isArray(screens) || screens.length === 0) {
    throw new Error("The prototype catalog must contain at least one screen.");
  }
  if (!Array.isArray(sections) || sections.some((section) => typeof section !== "string")) {
    throw new Error("The prototype catalog sections must be a list of strings.");
  }

  const ids = new Set<string>();
  for (const [index, screen] of screens.entries()) {
    if (!screen || typeof screen.id !== "string" || !screen.id.trim()) {
      throw new Error(`Screen ${index + 1} has no valid id.`);
    }
    if (ids.has(screen.id)) throw new Error(`Duplicate screen id: ${screen.id}`);
    ids.add(screen.id);
    if (typeof screen.title !== "string" || typeof screen.section !== "string") {
      throw new Error(`Screen "${screen.id}" is missing its title or section.`);
    }
    if (!Array.isArray(screen.actions)) {
      throw new Error(`Screen "${screen.id}" must define an actions array.`);
    }
  }

  for (const screen of screens) {
    for (const action of screen.actions) {
      if (!action || typeof action.label !== "string" || !ids.has(action.target)) {
        throw new Error(
          `Screen "${screen.id}" has an action with an unknown target: ${String(action?.target)}.`,
        );
      }
    }
  }
}

validateCatalog();

const design = {
  format: "forma-design",
  version: 1,
  tokens: {
    colors,
    typography: {
      family: "Inter",
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    radius: { small: 6, medium: 10, large: 16, pill: 999 },
    spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48],
  },
  screens,
  sections,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(design, null, 2)}\n`, "utf8");
console.log(`Exported ${screens.length} screens to ${outputPath}`);
