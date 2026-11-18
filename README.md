# Forma — Virtual Office

An interactive first prototype based on **Virtual Office SaaS SRS v1.0**. This is not yet the production SaaS or the full P0 implementation.

## Run

Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
npm run build
npm test
```

The development server listens on port 3000. `dist/` contains the production frontend build.

## Available in this prototype

- Responsive overview, sample team directory and attendance report.
- Role filtering, member search, and CSV export of the displayed sample records.
- Session creation with browser-local persistence and day navigation.
- Illustrative office map, keyboard-controlled avatar, and local room exploration.
- Honest unconfigured states for recording, Google Drive, media, and authentication.
- Tested pure attendance calculations: grace-adjusted lateness, union of verified intervals, and CSV escaping/formula protection. These are groundwork; the sample dashboard does not consume real attendance events.

All people, metrics, positions, room occupancy, and attendance records are illustrative. Sessions are stored only in localStorage; there is no team synchronization or server-side storage. Never enter sensitive data into the demo. The office is not an authoritative world simulation and does not enforce real room permissions. No microphone, camera, recording, SMS, or Google service is invoked.

## Next implementation stages

1. Confirm SRS Section 16 decisions: pilot concurrency, launch region/privacy obligations, recording consent/retention, Drive ownership, and attendance policies.
2. Build tenant-aware Laravel/PostgreSQL API, phone/password authentication, SMS reset, role authorization, invitations, and audit logs.
3. Persist recurring schedules and policy snapshots, ingest server-verified attendance events, apply heartbeat/reconnect rules, and produce tested reports.
4. Connect authoritative Node/WebSocket movement and presence plus scoped media tokens and a selected media provider.
5. Implement consent-aware recording, secure organization-specific Drive OAuth, idempotent uploads/retries, retention, and operational alerts.
6. Run cross-tenant security, media/browser, load, backup, and pilot acceptance checks.

React/TypeScript are established here. The SRS-recommended Laravel, PostgreSQL, Redis, world server, and media infrastructure have not been scaffolded or provisioned. No paid resources have been created.

## Dependency review

`npm audit --omit=dev` reports no runtime dependency advisories at implementation time. The full audit reports a high-severity advisory in the build-tool dependency `picomatch` (GHSA-fc5q-39xc-vjpf), also inherited through its dependents. The registry currently marks all versions affected and offers no patched version; the automatic downgrade suggestion introduces other Vite advisories and is not applied. Keep development preview access restricted and recheck before production delivery. The static production build does not ship Vite or picomatch.
