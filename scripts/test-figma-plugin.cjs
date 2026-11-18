const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repo = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(repo, "figma-plugin/manifest.json"), "utf8"));
const design = JSON.parse(fs.readFileSync(path.join(repo, "public/design/forma-design.json"), "utf8"));
const pluginCode = fs.readFileSync(path.join(repo, "figma-plugin", manifest.main), "utf8");

assert.deepEqual(manifest.editorType, ["figma"]);
assert.deepEqual(manifest.networkAccess, { allowedDomains: ["none"] });
assert.equal(design.format, "forma-design");
assert.equal(design.version, 1);
assert.ok(design.screens.length > 0);

let nextId = 1;
const pages = [];
const messages = [];
const notifications = [];

function makeNode(type) {
  return {
    id: `mock-node-${nextId++}`,
    type,
    name: "",
    children: [],
    parent: null,
    appendChild(child) {
      child.parent = this;
      this.children.push(child);
    },
    resize(width, height) {
      this.width = width;
      this.height = height;
    },
    async setReactionsAsync(reactions) {
      this.reactions = reactions;
    },
  };
}

const root = {
  children: [],
  removeChild(page) {
    this.children = this.children.filter((child) => child !== page);
  },
};
const figma = {
  root,
  ui: {
    onmessage: null,
    postMessage(message) {
      messages.push(message);
    },
  },
  showUI() {},
  async loadFontAsync() {},
  createPage() {
    const page = makeNode("PAGE");
    pages.push(page);
    root.children.push(page);
    return page;
  },
  createFrame() {
    return makeNode("FRAME");
  },
  createRectangle() {
    return makeNode("RECTANGLE");
  },
  createText() {
    return makeNode("TEXT");
  },
  async setCurrentPageAsync() {},
  viewport: { scrollAndZoomIntoView() {} },
  notify(message, options) {
    notifications.push({ message, options });
  },
};

vm.runInNewContext(pluginCode, {
  figma,
  __html__: "",
  console,
  Set,
  Map,
  Promise,
  Error,
  String,
  Math,
  parseInt,
});

function allNodes(node, result = []) {
  result.push(node);
  for (const child of node.children) allNodes(child, result);
  return result;
}

function destination(node) {
  return node.reactions?.[0]?.actions?.[0]?.destinationId;
}

async function runImport(data) {
  const previousMessageCount = messages.length;
  await figma.ui.onmessage({ type: "import-design", data });
  assert.equal(messages.length, previousMessageCount + 1);
  return messages.at(-1);
}

async function assertCompleteImport(page) {
  const topFrames = page.children;
  const count = design.screens.length;
  assert.equal(topFrames.length, count * 2 + 2, "all screen and directory frames exist");
  const desktopFrames = topFrames.filter((node) => node.name.startsWith("Desktop · "));
  const mobileFrames = topFrames.filter((node) => node.name.startsWith("Mobile · "));
  const desktopDirectory = topFrames.find((node) => node.name === "Directory · Desktop");
  const mobileDirectory = topFrames.find((node) => node.name === "Directory · Mobile");
  assert.equal(desktopFrames.length, count);
  assert.equal(mobileFrames.length, count);
  assert.ok(desktopDirectory);
  assert.ok(mobileDirectory);
  assert.equal(desktopDirectory.height >= 844, true);
  assert.equal(mobileDirectory.height >= 844, true);
  assert.equal(mobileDirectory.overflowDirection, "VERTICAL");

  const all = allNodes(page);
  const nodeIds = new Set(all.map((node) => node.id));
  const frameIds = new Set(topFrames.map((node) => node.id));
  const reactions = all.flatMap((node) => node.reactions || []);
  let expectedScreenActions = 0;

  for (const [index, screen] of design.screens.entries()) {
    const desktop = desktopFrames[index];
    const mobile = mobileFrames[index];
    assert.equal(desktop.name, `Desktop · ${screen.title}`);
    assert.equal(mobile.name, `Mobile · ${screen.title}`);
    assert.equal(desktop.overflowDirection, "VERTICAL", `${screen.id} desktop is scrollable`);
    assert.equal(mobile.overflowDirection, "VERTICAL", `${screen.id} mobile is scrollable`);

    const desktopButtons = desktop.children.filter((node) => node.name.startsWith("Button · "));
    const mobileButtons = mobile.children.filter((node) => node.name.startsWith("Button · "));
    assert.equal(desktopButtons.length, screen.actions.length, `${screen.id} desktop actions`);
    assert.equal(mobileButtons.length, screen.actions.length, `${screen.id} mobile actions`);
    expectedScreenActions += screen.actions.length * 2;

    for (const action of screen.actions) {
      for (const [device, buttons, targetFrames] of [
        ["desktop", desktopButtons, desktopFrames],
        ["mobile", mobileButtons, mobileFrames],
      ]) {
        const button = buttons.find((node) => node.name === `Button · ${action.label}`);
        assert.ok(button, `${screen.id} ${device} action exists: ${action.label}`);
        const targetIndex = design.screens.findIndex((item) => item.id === action.target);
        assert.notEqual(targetIndex, -1, `${screen.id} action target exists: ${action.target}`);
        assert.equal(destination(button), targetFrames[targetIndex].id, `${screen.id} ${device} target`);
      }
    }
  }

  for (const directory of [desktopDirectory, mobileDirectory]) {
    const directoryLinks = directory.children.filter((node) => node.name.startsWith("Directory link · "));
    assert.equal(directoryLinks.length, count, "directory has one direct link per screen");
    const destinations = new Set(directoryLinks.map(destination));
    const expected = directory === desktopDirectory ? desktopFrames : mobileFrames;
    for (const screenFrame of expected) {
      assert.ok(destinations.has(screenFrame.id), `directory reaches ${screenFrame.name}`);
    }
  }

  assert.ok(
    reactions.length >= expectedScreenActions * 2 + count * design.sections.length,
    "each screen action and section navigation has a prototype reaction",
  );
  for (const reaction of reactions) {
    assert.ok(nodeIds.has(reaction.actions[0].destinationId), "reaction destination exists in the page");
    assert.ok(frameIds.has(reaction.actions[0].destinationId), "reaction destination is a screen or directory frame");
  }

  const reachable = new Set();
  const queue = [design.screens[0].id];
  while (queue.length) {
    const id = queue.shift();
    if (reachable.has(id)) continue;
    reachable.add(id);
    const screen = design.screens.find((item) => item.id === id);
    assert.ok(screen, `reachable action target exists: ${id}`);
    queue.push(...screen.actions.map((action) => action.target));
  }
  assert.deepEqual([...reachable].sort(), design.screens.map((screen) => screen.id).sort(), "all screens reachable from overview actions");

  return {
    screenCount: count,
    frameCount: topFrames.length,
    screenActionButtons: expectedScreenActions,
    reactions: reactions.length,
  };
}

(async () => {
  const expectedPageCount = 2;
  const badResult = await runImport({ format: "wrong-format", version: 1, screens: [], sections: [] });
  assert.equal(badResult.ok, false, "bad format is rejected");
  assert.equal(pages.length, 0, "invalid input does not create a page");

  const first = await runImport(design);
  assert.equal(first.ok, true, first.error);
  const firstCounts = await assertCompleteImport(pages[0]);

  const second = await runImport(design);
  assert.equal(second.ok, true, second.error);
  const secondCounts = await assertCompleteImport(pages[1]);
  assert.equal(pages.length, expectedPageCount, "two imports create exactly two complete pages");

  const invalidTargetData = structuredClone(design);
  invalidTargetData.screens[0].actions[0].target = "missing-screen";
  const badTarget = await runImport(invalidTargetData);
  assert.equal(badTarget.ok, false, "unknown action target is rejected");
  assert.equal(pages.length, expectedPageCount, "invalid target leaves no partial page");

  for (const node of allNodes(root)) {
    if (node.type !== "FRAME" || !node.name.startsWith("Directory · ")) continue;
    assert.ok(node.height > 844 || node.overflowDirection === "VERTICAL", "directory content remains reachable");
  }

  console.log(
    `Figma importer mock passed: ${firstCounts.screenCount} screens, ` +
      `${firstCounts.frameCount} frames/import, ${firstCounts.screenActionButtons} screen action buttons, ` +
      `${firstCounts.reactions} prototype links/import; repeated import passed; ` +
      `invalid inputs rejected without orphan pages.`,
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
