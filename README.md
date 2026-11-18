# Forma — Virtual Office UI/UX Prototype

Interactive UI/UX delivery based on **Virtual Office SaaS SRS v1.0**. It covers product journeys with fictional data, not a production SaaS backend.

## Try it

- Managed Preview opens the full screen directory and linked prototype.
- Download and extract `Forma-UIUX-Complete.zip`, then open `website/OPEN-ME.html` directly in a modern browser. The standalone site embeds its JavaScript and CSS; optional Google Fonts use a fallback when offline.
- Source development: Node.js 22.12+ (24 recommended), `npm ci`, `npm run dev`.

## Design and Figma

`forma-design.json` is a **custom Forma design document**, not a native Figma `.fig` file or a file Figma can open by itself. The included local development plugin converts it into native editable frames, text, shapes, and prototype links for desktop and mobile.

See `figma-plugin/README.md` and the Arabic `START-HERE-AR.md` included in the delivery. Import the plugin manifest in Figma Desktop, run the importer, then choose the JSON. Development plugin access is required. If Figma requires an assigned plugin ID, create a local development plugin through Figma and preserve its generated ID as explained in the importer instructions.

The Figma layout is a native-layer reconstruction, not a pixel-identical copy of browser CSS. Figma buttons navigate to designed states; the live web prototype additionally supports form validation, local form-flow summaries, table search/CSV export, avatar movement, and simulated media controls. Input editing and real service behavior are not provided by Figma prototype links.

**Figma editor import has not been tested in a signed-in Figma application.** Local validation/mock tests can verify API orchestration but do not replace that check.

## Coverage and navigation

The catalog is `src/prototype/catalog.ts`. It defines screen content, forms, tables, states, and action destinations and drives both the web experience and design JSON. The directory exposes every screen; section navigation and explicit screen actions keep all screens connected. The generated `SCREEN-MAP.md` lists every screen and destination.

Journeys cover authentication/access, office and media, people/roles/teams, scheduling, attendance/corrections/reports, recordings/Drive, organization policies, billing, and the platform console. Later-phase SRS screens are illustrative rather than a promise of live integrations.

The original dashboard demo remains accessible through the screen directory. Its added sessions persist only in browser localStorage. New prototype forms only keep a temporary in-memory completion summary, excluding fields named password, phone, OTP, code, card, or CVV. Never enter real personal, credential, or payment information.

## Build, verify, and package

```sh
npm test                  # attendance and prototype graph checks
npm run build             # export JSON, typecheck, production bundle
npm run export:design     # refresh public/design/forma-design.json
npm run test:figma        # mock API import, links, positions, rollback
npm run deliver           # build, test, create complete ZIP
```

`npm run deliver` generates a `delivery/forma-uiux/` folder and `Forma-UIUX-Complete.zip` with source, a standalone website, design JSON, importer, Arabic instructions, and a screen inventory. No dependencies, credentials, user attachments, or workspace runtime files are bundled. Only explicit deliverable paths are copied.

## Boundaries

No actual authentication, SMS/OTP, authorization boundary, tenant isolation, payments, OAuth, calendar sync, media capture, real-time presence, recording, upload, AI inference, or email delivery is implemented. Switching role screens is navigation, not security. Office room layouts and attendance data are illustrative. No paid resources have been created or external transactions performed.

Laravel/PostgreSQL/Redis, an authoritative WebSocket world service, scoped media tokens, background uploads, server-verified attendance, security/load testing, and deployment remain production implementation work. SRS Section 16 policy and launch decisions remain open.

## Dependency review

The previous runtime dependency audit reported no advisories. A high-severity advisory in build tooling `picomatch` (GHSA-fc5q-39xc-vjpf) affects currently published versions and dependent build packages; the automatic downgrade suggestion reintroduces Vite advisories and is not applied. Vite and picomatch are not shipped as runtime code in the static production bundle. Keep development preview access restricted and recheck before production delivery.
