import assert from "node:assert/strict";
import test from "node:test";
import { screens, sections } from "../prototype/catalog";

test("all prototype screens have unique IDs and valid linked actions", () => {
  const ids = new Set(screens.map((s) => s.id));
  assert.equal(ids.size, screens.length);
  assert.ok(screens.length >= 50);
  for (const screen of screens) {
    assert.ok(sections.includes(screen.section), screen.id);
    assert.ok(screen.actions.length > 0, `Dead end: ${screen.id}`);
    for (const action of screen.actions)
      assert.ok(ids.has(action.target), `${screen.id} → ${action.target}`);
    if (screen.kind === "form")
      assert.ok(screen.fields?.length, `Empty form: ${screen.id}`);
    if (screen.rows)
      for (const row of screen.rows)
        assert.equal(
          row.length,
          screen.columns?.length,
          `Table mismatch: ${screen.id}`,
        );
  }
});
test("all screens can be reached from overview through designed actions", () => {
  const visited = new Set<string>();
  const queue = ["overview"];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const screen = screens.find((s) => s.id === id);
    assert.ok(screen);
    queue.push(...screen.actions.map((a) => a.target));
  }
  assert.deepEqual(
    screens.filter((s) => !visited.has(s.id)).map((s) => s.id),
    [],
  );
});

test("prototype starts at sign-in, including empty and malformed links", async () => {
  const { screenIdFromHash, startScreenId } = await import(
    "../prototype/navigation"
  );
  assert.equal(startScreenId, "sign-in");
  assert.equal(screenIdFromHash(""), "sign-in");
  assert.equal(screenIdFromHash("#"), "sign-in");
  assert.equal(screenIdFromHash("#%"), "sign-in");
  assert.equal(screenIdFromHash("#office"), "office");
  const signIn = screens.find((s) => s.id === startScreenId)!;
  assert.equal(signIn.kind, "form");
  assert.ok(signIn.fields?.some((f) => f.type === "password"));
  assert.ok(signIn.actions.some((a) => a.target === "overview"));
});
