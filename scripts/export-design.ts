import { logo, logoSvg } from "../src/brand/logo.ts";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startScreenId } from "../src/prototype/navigation.ts";
import { screens, sections } from "../src/prototype/catalog.ts";

const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/design/forma-design.json",
);

const colors = {
  navy: "#141E38",
  background: "#F1F3F9",
  surface: "#FFFFFF",
  text: "#17213B",
  muted: "#526079",
  line: "#D8DEEB",
  purple: "#6336E6",
  purpleLight: "#EDE7FF",
  sage: "#087F6D",
  sageLight: "#DDF5EE",
  peach: "#FFE7CE",
  danger: "#BA2546",
};
const kinds = new Set([
  "dashboard",
  "form",
  "table",
  "office",
  "meeting",
  "detail",
  "empty",
  "success",
]);

function validateCatalog() {
  if (!Array.isArray(screens) || screens.length === 0) {
    throw new Error("The prototype catalog must contain at least one screen.");
  }
  if (
    !Array.isArray(sections) ||
    sections.some((section) => typeof section !== "string")
  ) {
    throw new Error(
      "The prototype catalog sections must be a list of strings.",
    );
  }

  const ids = new Set<string>();
  for (const [index, screen] of screens.entries()) {
    if (!screen || typeof screen.id !== "string" || !screen.id.trim()) {
      throw new Error(`Screen ${index + 1} has no valid id.`);
    }
    if (ids.has(screen.id))
      throw new Error(`Duplicate screen id: ${screen.id}`);
    ids.add(screen.id);
    if (
      typeof screen.title !== "string" ||
      typeof screen.section !== "string" ||
      typeof screen.description !== "string" ||
      !kinds.has(screen.kind) ||
      !sections.includes(screen.section)
    ) {
      throw new Error(
        `Screen "${screen.id}" has invalid title, section, description or kind.`,
      );
    }
    if (!Array.isArray(screen.actions)) {
      throw new Error(`Screen "${screen.id}" must define an actions array.`);
    }
    for (const key of ["fields", "stats", "columns", "rows"] as const) {
      const value = screen[key];
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error(`Screen "${screen.id}" has an invalid ${key} list.`);
      }
    }
    if (
      screen.fields?.some((field) => !field || typeof field.label !== "string")
    ) {
      throw new Error(`Screen "${screen.id}" has an invalid form field.`);
    }
    if (
      screen.stats?.some(
        (stat) =>
          !stat ||
          typeof stat.label !== "string" ||
          typeof stat.value !== "string",
      )
    ) {
      throw new Error(`Screen "${screen.id}" has an invalid stat.`);
    }
    if (screen.columns?.some((column) => typeof column !== "string")) {
      throw new Error(`Screen "${screen.id}" has an invalid table column.`);
    }
    if (
      screen.rows?.some(
        (row) =>
          !Array.isArray(row) || row.some((cell) => typeof cell !== "string"),
      )
    ) {
      throw new Error(`Screen "${screen.id}" has an invalid table row.`);
    }
    if (screen.notice !== undefined && typeof screen.notice !== "string") {
      throw new Error(`Screen "${screen.id}" has an invalid notice.`);
    }
  }

  for (const screen of screens) {
    for (const action of screen.actions) {
      if (
        !action ||
        typeof action.label !== "string" ||
        typeof action.target !== "string" ||
        !ids.has(action.target) ||
        (action.primary !== undefined && typeof action.primary !== "boolean")
      ) {
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
  startScreenId,
  brand: { name: "Forma", logo },
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

await mkdir("public/brand", { recursive: true });
await writeFile("public/brand/forma-mark.svg", logoSvg());
await writeFile("public/brand/forma-mark-light.svg", logoSvg(true));
