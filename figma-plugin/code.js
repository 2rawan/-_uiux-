const C = {
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
  pale: "#F8F7FA",
};
const FONT_REGULAR = { family: "Inter", style: "Regular" };
const FONT_MEDIUM = { family: "Inter", style: "Medium" };
const FONT_SEMIBOLD = { family: "Inter", style: "Semi Bold" };
const FONT_BOLD = { family: "Inter", style: "Bold" };
const KINDS = new Set([
  "dashboard",
  "form",
  "table",
  "office",
  "meeting",
  "detail",
  "empty",
  "success",
]);

figma.showUI(__html__, { width: 360, height: 355 });

function fail(message) {
  throw new Error(message);
}

function validateDesign(data) {
  if (!data || data.format !== "forma-design" || data.version !== 1) {
    fail("الملف ليس بصيغة Forma المدعومة (forma-design، الإصدار 1).");
  }
  if (
    !Array.isArray(data.sections) ||
    data.sections.some((section) => typeof section !== "string") ||
    !Array.isArray(data.screens) ||
    !data.screens.length
  ) {
    fail("يجب أن يتضمن الملف قائمة شاشات وأقسام غير فارغة.");
  }

  const ids = new Set();
  for (const [index, screen] of data.screens.entries()) {
    if (!screen || typeof screen.id !== "string" || !screen.id.trim()) {
      fail(`معرّف الشاشة رقم ${index + 1} غير صالح.`);
    }
    if (ids.has(screen.id)) fail(`معرّف الشاشة مكرر: ${screen.id}`);
    ids.add(screen.id);
    if (
      typeof screen.title !== "string" ||
      typeof screen.section !== "string" ||
      typeof screen.description !== "string" ||
      !KINDS.has(screen.kind) ||
      !Array.isArray(screen.actions)
    ) {
      fail(`بيانات الشاشة "${screen.id}" غير مكتملة أو غير مدعومة.`);
    }
    for (const key of ["fields", "stats", "columns", "rows"]) {
      if (screen[key] !== undefined && !Array.isArray(screen[key])) {
        fail(`قائمة ${key} في الشاشة "${screen.id}" غير صالحة.`);
      }
    }
    if (screen.notice !== undefined && typeof screen.notice !== "string") {
      fail(`ملاحظة الشاشة "${screen.id}" غير صالحة.`);
    }
    if (screen.fields?.some((field) => !field || typeof field.label !== "string")) {
      fail(`حقول الشاشة "${screen.id}" غير صالحة.`);
    }
    if (screen.stats?.some((stat) => !stat || typeof stat.label !== "string" || typeof stat.value !== "string")) {
      fail(`إحصاءات الشاشة "${screen.id}" غير صالحة.`);
    }
    if (screen.columns?.some((column) => typeof column !== "string")) {
      fail(`أعمدة الشاشة "${screen.id}" غير صالحة.`);
    }
    if (screen.rows?.some((row) => !Array.isArray(row) || row.some((cell) => typeof cell !== "string"))) {
      fail(`صفوف الشاشة "${screen.id}" غير صالحة.`);
    }
    for (const action of screen.actions) {
      if (
        !action ||
        typeof action.label !== "string" ||
        typeof action.target !== "string" ||
        (action.primary !== undefined && typeof action.primary !== "boolean")
      ) {
        fail(`يوجد زر تنقّل غير صالح في الشاشة "${screen.id}".`);
      }
    }
  }
  for (const screen of data.screens) {
    for (const action of screen.actions) {
      if (!ids.has(action.target)) {
        fail(`زر "${action.label}" في "${screen.title}" يشير إلى شاشة غير موجودة (${action.target}).`);
      }
    }
  }
  if (data.screens.some((screen) => !data.sections.includes(screen.section))) {
    fail("توجد شاشة مرتبطة بقسم غير موجود في قائمة الأقسام.");
  }
  return data;
}

function color(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((part) => part + part).join("") : value;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

function solid(hex) {
  return [{ type: "SOLID", color: color(hex) }];
}

function rect(parent, x, y, width, height, fill, radius = 0, stroke) {
  const node = figma.createRectangle();
  node.name = "Shape";
  node.x = x;
  node.y = y;
  node.resize(Math.max(1, width), Math.max(1, height));
  node.fills = solid(fill);
  node.cornerRadius = radius;
  if (stroke) {
    node.strokes = solid(stroke);
    node.strokeWeight = 1;
  }
  parent.appendChild(node);
  return node;
}

function text(parent, value, x, y, width, size = 13, fill = C.text, weight = "regular") {
  const node = figma.createText();
  node.name = String(value).slice(0, 80) || "Text";
  node.fontName =
    weight === "bold"
      ? FONT_BOLD
      : weight === "semibold"
        ? FONT_SEMIBOLD
        : weight === "medium"
          ? FONT_MEDIUM
          : FONT_REGULAR;
  node.characters = String(value ?? "");
  node.fontSize = size;
  node.fills = solid(fill);
  node.textAutoResize = "HEIGHT";
  node.resize(Math.max(12, width), 24);
  node.lineHeight = { unit: "PIXELS", value: Math.round(size * 1.5) };
  parent.appendChild(node);
  return node;
}

function frame(parent, name, x, y, width, height, fill = C.surface, stroke) {
  const node = figma.createFrame();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = solid(fill);
  node.clipsContent = true;
  if (stroke) {
    node.strokes = solid(stroke);
    node.strokeWeight = 1;
  }
  parent.appendChild(node);
  return node;
}

function button(parent, label, x, y, width, target, isPrimary, links) {
  const surface = frame(
    parent,
    `Button · ${label}`,
    x,
    y,
    width,
    38,
    isPrimary ? C.purple : C.surface,
    isPrimary ? undefined : C.line,
  );
  surface.cornerRadius = 8;
  const caption = text(surface, label, 12, 9, width - 24, 12, isPrimary ? C.surface : C.text, "semibold");
  links.push({ node: surface, target, label: caption });
  return surface;
}

function addRule(parent, x, y, width) {
  rect(parent, x, y, width, 1, C.line);
}

function drawStats(parent, stats, x, y, width, mobile = false) {
  if (!stats || !stats.length) return y;
  const columns = mobile ? Math.min(2, stats.length) : Math.min(4, stats.length);
  const gap = 12;
  const cardWidth = (width - gap * (columns - 1)) / columns;
  const rows = Math.ceil(stats.length / columns);
  stats.forEach((stat, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const cx = x + column * (cardWidth + gap);
    const cy = y + row * 82;
    const card = frame(parent, `Metric · ${stat.label}`, cx, cy, cardWidth, 70, C.surface, C.line);
    card.cornerRadius = 10;
    text(card, stat.label, 14, 10, cardWidth - 28, 11, C.muted, "medium");
    text(card, stat.value, 14, 31, cardWidth - 28, 20, C.text, "semibold");
  });
  return y + rows * 82;
}

function drawFields(parent, fields, x, y, width, mobile = false) {
  if (!fields || !fields.length) return y;
  text(parent, "تفاصيل النموذج", x, y, width, 15, C.text, "semibold");
  y += 32;
  const columns = mobile ? 1 : 2;
  const gap = 14;
  const fieldWidth = (width - gap * (columns - 1)) / columns;
  fields.forEach((field, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const fx = x + column * (fieldWidth + gap);
    const fy = y + row * 78;
    text(parent, `${field.label}${field.required ? " *" : ""}`, fx, fy, fieldWidth, 11, C.text, "medium");
    const input = frame(parent, `Field · ${field.label}`, fx, fy + 21, fieldWidth, 42, C.surface, C.line);
    input.cornerRadius = 7;
    const placeholder = field.options && field.options.length
      ? field.options.join(" · ")
      : field.placeholder || field.type || "اكتب هنا";
    text(input, placeholder, 11, 12, fieldWidth - 22, 11, C.muted, "regular");
  });
  return y + Math.ceil(fields.length / columns) * 78;
}

function drawTable(parent, columns, rows, x, y, width) {
  if (!columns || !columns.length) return y;
  const cellWidth = width / columns.length;
  const tableHeight = 42 + Math.max(1, (rows || []).length) * 42;
  const table = frame(parent, "Editable data table", x, y, width, tableHeight, C.surface, C.line);
  table.cornerRadius = 8;
  rect(table, 0, 0, width, 42, C.pale, 8);
  columns.forEach((label, index) => {
    text(table, label, 12 + index * cellWidth, 13, cellWidth - 20, 10, C.muted, "semibold");
  });
  const visibleRows = rows && rows.length ? rows : [columns.map(() => "—")];
  visibleRows.forEach((row, rowIndex) => {
    const rowY = 42 + rowIndex * 42;
    addRule(table, 0, rowY, width);
    columns.forEach((_, columnIndex) => {
      text(table, row[columnIndex] ?? "—", 12 + columnIndex * cellWidth, rowY + 12, cellWidth - 20, 10, C.text);
    });
  });
  return y + tableHeight;
}

function drawOffice(parent, x, y, width, mobile) {
  text(parent, "مساحات المكتب الافتراضي", x, y, width, 15, C.text, "semibold");
  y += 32;
  const cols = mobile ? 1 : 2;
  const gap = 14;
  const roomWidth = (width - gap * (cols - 1)) / cols;
  const rooms = ["ردهة الفريق", "غرفة التركيز", "غرفة الاجتماعات", "ركن الاستراحة"];
  rooms.forEach((name, index) => {
    const rx = x + (index % cols) * (roomWidth + gap);
    const ry = y + Math.floor(index / cols) * 126;
    const room = frame(parent, `Office room · ${name}`, rx, ry, roomWidth, 112, index % 2 ? C.sageLight : C.purpleLight, C.line);
    room.cornerRadius = 10;
    text(room, name, 14, 12, roomWidth - 28, 13, C.text, "semibold");
    text(room, `${index === 1 ? "2" : index === 2 ? "4" : "6"} / 8 משתתפים`, 14, 34, roomWidth - 28, 10, C.muted);
    rect(room, 18, 64, 44, 30, C.surface, 14, C.line);
    rect(room, 74, 68, 24, 24, index % 2 ? C.sage : C.purple, 12);
    rect(room, 108, 68, 24, 24, C.peach, 12);
    if (roomWidth > 250) rect(room, 144, 68, 24, 24, C.sage, 12);
  });
  return y + Math.ceil(rooms.length / cols) * 126;
}

function drawMeeting(parent, x, y, width, mobile, screen) {
  text(parent, "الاجتماعات والأنشطة", x, y, width, 15, C.text, "semibold");
  y += 32;
  const items = screen.rows && screen.rows.length
    ? screen.rows
    : [[screen.title, screen.description, "10:00"], ["جلسة الفريق", "مساحة تعاون مفتوحة", "11:30"], ["استراحة قهوة", "الجميع مرحّب به", "14:00"]];
  const itemWidth = mobile ? width : (width - 14) / 2;
  items.forEach((item, index) => {
    const ix = x + (mobile ? 0 : (index % 2) * (itemWidth + 14));
    const iy = y + Math.floor(index / (mobile ? 1 : 2)) * 92;
    const tile = frame(parent, `Meeting · ${item[0] || "Session"}`, ix, iy, itemWidth, 78, index % 2 ? C.sageLight : C.purpleLight, C.line);
    tile.cornerRadius = 9;
    text(tile, item[0] || "جلسة", 13, 11, itemWidth - 26, 12, C.text, "semibold");
    text(tile, item[1] || "", 13, 33, itemWidth - 26, 10, C.muted);
    text(tile, item[2] || "", 13, 55, itemWidth - 26, 10, C.purple, "medium");
  });
  return y + Math.ceil(items.length / (mobile ? 1 : 2)) * 92;
}

function drawNotice(parent, notice, x, y, width, kind) {
  if (!notice) return y;
  const fill = kind === "success" ? C.sageLight : kind === "empty" ? C.purpleLight : C.peach;
  const card = frame(parent, `${kind} notice`, x, y, width, 76, fill);
  card.cornerRadius = 9;
  text(card, kind === "success" ? "تم بنجاح" : kind === "empty" ? "لا توجد بيانات بعد" : "ملاحظة", 14, 12, width - 28, 12, kind === "success" ? C.sage : C.purple, "semibold");
  text(card, notice, 14, 35, width - 28, 11, C.text);
  return y + 88;
}

function addActions(parent, actions, x, y, width, targets, device, links, mobile) {
  if (!actions.length) return y;
  const gap = 10;
  const buttonWidth = mobile
    ? width
    : Math.min(210, (width - gap * (Math.min(actions.length, 4) - 1)) / Math.min(actions.length, 4));
  actions.forEach((action, index) => {
    const row = mobile ? index : Math.floor(index / 4);
    const column = mobile ? 0 : index % 4;
    const bx = mobile ? x : x + column * (buttonWidth + gap);
    const by = y + row * 48;
    button(parent, action.label, bx, by, buttonWidth, targets.get(`${device}:${action.target}`), Boolean(action.primary), links);
  });
  return y + (mobile ? actions.length : Math.ceil(actions.length / 4)) * 48;
}

function makeDesktop(screen, frameNode, data, targetMap, links) {
  const frameHeight = Math.max(1000, 660 + (screen.fields?.length || 0) * 56 + (screen.rows?.length || 0) * 44);
  frameNode.resize(1440, frameHeight);
  frameNode.overflowDirection = "VERTICAL";
  frameNode.fills = solid(C.background);
  rect(frameNode, 0, 0, 244, frameHeight, C.surface);
  rect(frameNode, 243, 0, 1, frameHeight, C.line);
  text(frameNode, "Forma", 24, 24, 160, 24, C.text, "bold");
  rect(frameNode, 24, 62, 34, 34, C.purple, 10);
  text(frameNode, "F", 34, 67, 16, 16, C.surface, "bold");
  text(frameNode, "VIRTUAL OFFICE", 70, 66, 150, 10, C.muted, "semibold");
  addRule(frameNode, 20, 112, 204);
  text(frameNode, "مساحة العمل", 22, 130, 190, 12, C.muted, "semibold");
  let navY = 164;
  const firstBySection = new Map();
  for (const item of data.screens) {
    if (!firstBySection.has(item.section)) firstBySection.set(item.section, item);
  }
  for (const section of data.sections) {
    const target = firstBySection.get(section);
    if (!target) continue;
    const active = target.id === screen.id;
    const nav = frame(frameNode, `Navigation · ${section}`, 16, navY, 212, 36, active ? C.purpleLight : C.surface);
    nav.cornerRadius = 7;
    text(nav, section, 12, 10, 188, 11, active ? C.purple : C.text, active ? "semibold" : "medium");
    links.push({ node: nav, target: targetMap.get(`desktop:${target.id}`) });
    navY += 42;
  }
  const directory = frame(frameNode, "Navigation · كل الشاشات", 16, navY + 8, 212, 38, C.purple);
  directory.cornerRadius = 8;
  text(directory, "دليل كل الشاشات  ←", 12, 11, 188, 11, C.surface, "semibold");
  links.push({ node: directory, target: targetMap.get("directory:desktop") });

  rect(frameNode, 244, 0, 1196, 74, C.surface);
  addRule(frameNode, 244, 73, 1196);
  text(frameNode, "مساحة الفريق  /  Forma", 284, 27, 500, 12, C.muted);
  rect(frameNode, 1360, 20, 38, 38, C.sageLight, 19);
  text(frameNode, "R", 1372, 30, 16, 14, C.sage, "semibold");

  const x = 284;
  const width = 1100;
  let y = 112;
  text(frameNode, screen.title, x, y, width, 28, C.text, "bold");
  y += 44;
  text(frameNode, screen.description, x, y, width, 13, C.muted);
  y += 38;
  y = addActions(frameNode, screen.actions, x, y, width, targetMap, "desktop", links, false) + 8;
  y = drawNotice(frameNode, screen.notice, x, y, width, screen.kind);
  y = drawStats(frameNode, screen.stats, x, y, width) + 20;
  if (screen.kind === "form" || screen.fields?.length) y = drawFields(frameNode, screen.fields, x, y, width) + 20;
  if (screen.kind === "office") y = drawOffice(frameNode, x, y, width, false) + 18;
  if (screen.kind === "meeting") y = drawMeeting(frameNode, x, y, width, false, screen) + 18;
  if ((screen.columns?.length || 0) > 0) y = drawTable(frameNode, screen.columns, screen.rows, x, y, width) + 18;
  if (screen.kind === "detail" && !screen.fields?.length && !screen.stats?.length) {
    const detail = frame(frameNode, "Record details", x, y, width, 140, C.surface, C.line);
    detail.cornerRadius = 10;
    text(detail, screen.title, 18, 18, width - 36, 15, C.text, "semibold");
    text(detail, screen.description, 18, 50, width - 36, 12, C.muted);
    y += 158;
  }
  if (screen.kind === "dashboard" && !screen.columns?.length && !screen.stats?.length) {
    y = drawMeeting(frameNode, x, y, width, false, screen) + 18;
  }
}

function makeMobile(screen, frameNode, data, targetMap, links) {
  const contentWidth = 350;
  frameNode.resize(390, 844);
  frameNode.overflowDirection = "VERTICAL";
  frameNode.fills = solid(C.background);
  rect(frameNode, 0, 0, 390, 68, C.surface);
  addRule(frameNode, 0, 67, 390);
  text(frameNode, "Forma", 20, 20, 120, 20, C.text, "bold");
  const menu = frame(frameNode, "Open screen directory", 296, 15, 74, 38, C.purpleLight);
  menu.cornerRadius = 8;
  text(menu, "الشاشات", 9, 11, 56, 11, C.purple, "semibold");
  links.push({ node: menu, target: targetMap.get("directory:mobile") });

  let y = 94;
  text(frameNode, screen.section, 20, y, contentWidth, 10, C.purple, "semibold");
  y += 22;
  text(frameNode, screen.title, 20, y, contentWidth, 23, C.text, "bold");
  y += 36;
  text(frameNode, screen.description, 20, y, contentWidth, 12, C.muted);
  y += 48;
  y = addActions(frameNode, screen.actions, 20, y, contentWidth, targetMap, "mobile", links, true) + 8;
  y = drawNotice(frameNode, screen.notice, 20, y, contentWidth, screen.kind);
  y = drawStats(frameNode, screen.stats, 20, y, contentWidth, true) + 18;
  if (screen.kind === "form" || screen.fields?.length) y = drawFields(frameNode, screen.fields, 20, y, contentWidth, true) + 18;
  if (screen.kind === "office") y = drawOffice(frameNode, 20, y, contentWidth, true) + 18;
  if (screen.kind === "meeting") y = drawMeeting(frameNode, 20, y, contentWidth, true, screen) + 18;
  if ((screen.columns?.length || 0) > 0) y = drawTable(frameNode, screen.columns, screen.rows, 20, y, contentWidth) + 18;
  if (screen.kind === "detail" && !screen.fields?.length && !screen.stats?.length) {
    const detail = frame(frameNode, "Record details", 20, y, contentWidth, 140, C.surface, C.line);
    detail.cornerRadius = 10;
    text(detail, screen.title, 16, 18, contentWidth - 32, 14, C.text, "semibold");
    text(detail, screen.description, 16, 50, contentWidth - 32, 11, C.muted);
  }
  if (screen.kind === "dashboard" && !screen.columns?.length && !screen.stats?.length) {
    drawMeeting(frameNode, 20, y, contentWidth, true, screen);
  }
}

function makeDirectory(frameNode, data, targetMap, device, links) {
  const mobile = device === "mobile";
  const width = mobile ? 390 : 1440;
  const contentWidth = mobile ? 350 : 1080;
  const columns = mobile ? 1 : 3;
  const gap = 12;
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns;
  const sectionOrder = data.sections.filter((section) => data.screens.some((screen) => screen.section === section));
  const directoryContentHeight = sectionOrder.reduce((total, section) => {
    const count = data.screens.filter((screen) => screen.section === section).length;
    return total + 27 + Math.ceil(count / columns) * 82 + 18;
  }, 0);
  const titleY = mobile ? 94 : 50;
  const height = Math.max(mobile ? 844 : 1000, titleY + 74 + directoryContentHeight + 24);
  frameNode.resize(width, height);
  frameNode.fills = solid(C.background);
  if (mobile) frameNode.overflowDirection = "VERTICAL";
  if (!mobile) {
    rect(frameNode, 0, 0, 244, height, C.surface);
    rect(frameNode, 243, 0, 1, height, C.line);
    text(frameNode, "Forma", 24, 24, 180, 24, C.text, "bold");
  } else {
    rect(frameNode, 0, 0, width, 68, C.surface);
    addRule(frameNode, 0, 67, width);
    text(frameNode, "Forma · دليل الشاشات", 20, 22, 340, 17, C.text, "bold");
  }
  const x0 = mobile ? 20 : 284;
  text(frameNode, "كل شاشات النموذج", x0, titleY, contentWidth, 24, C.text, "bold");
  text(frameNode, "اختاري شاشة للانتقال إليها. كل إطار هنا قابل للتحرير.", x0, titleY + 37, contentWidth, 12, C.muted);
  let y = titleY + 74;
  for (const section of sectionOrder) {
    const items = data.screens.filter((screen) => screen.section === section);
    text(frameNode, section, x0, y, contentWidth, 13, C.purple, "semibold");
    y += 27;
    items.forEach((screen, index) => {
      const gx = x0 + (index % columns) * (cardWidth + gap);
      const gy = y + Math.floor(index / columns) * 82;
      const card = frame(frameNode, `Directory link · ${screen.title}`, gx, gy, cardWidth, 68, C.surface, C.line);
      card.cornerRadius = 9;
      text(card, screen.title, 12, 10, cardWidth - 24, 12, C.text, "semibold");
      text(card, `${screen.kind}  ·  افتحي الشاشة ←`, 12, 34, cardWidth - 24, 10, C.muted);
      links.push({ node: card, label: card.children.find((child) => child.type === "TEXT"), target: targetMap.get(`${device}:${screen.id}`) });
    });
    y += Math.ceil(items.length / columns) * 82 + 18;
  }
}

async function importDesign(rawData) {
  const data = validateDesign(rawData);
  await Promise.all([
    figma.loadFontAsync(FONT_REGULAR),
    figma.loadFontAsync(FONT_MEDIUM),
    figma.loadFontAsync(FONT_SEMIBOLD),
    figma.loadFontAsync(FONT_BOLD),
  ]);

  let page;
  try {
    page = figma.createPage();
    page.name = "Forma · Editable prototype";
    await figma.setCurrentPageAsync(page);
    const targetMap = new Map();
    const frameEntries = [];
    let frameY = 0;
    data.screens.forEach((screen, index) => {
      const desktopHeight = Math.max(1000, 660 + (screen.fields?.length || 0) * 56 + (screen.rows?.length || 0) * 44);
      const desktop = frame(page, `Desktop · ${screen.title}`, 0, frameY, 1440, desktopHeight, C.background);
      const mobile = frame(page, `Mobile · ${screen.title}`, 1640, frameY, 390, 844, C.background);
      targetMap.set(`desktop:${screen.id}`, desktop);
      targetMap.set(`mobile:${screen.id}`, mobile);
      frameEntries.push({ screen, desktop, mobile, index });
      frameY += Math.max(desktopHeight, 844) + 160;
    });
    const directoryDesktop = frame(page, "Directory · Desktop", 0, frameY, 1440, 1000, C.background);
    const directoryMobile = frame(page, "Directory · Mobile", 1640, frameY, 390, 844, C.background);
    targetMap.set("directory:desktop", directoryDesktop);
    targetMap.set("directory:mobile", directoryMobile);

    const links = [];
    for (const entry of frameEntries) {
      makeDesktop(entry.screen, entry.desktop, data, targetMap, links);
      makeMobile(entry.screen, entry.mobile, data, targetMap, links);
    }
    makeDirectory(directoryDesktop, data, targetMap, "desktop", links);
    makeDirectory(directoryMobile, data, targetMap, "mobile", links);

    const flowStart = targetMap.get(`desktop:${data.screens[0].id}`);
    try {
      page.flowStartingPoints = [{ nodeId: flowStart.id, name: "Forma prototype" }];
    } catch {
      // Older Figma editor versions still open the first generated desktop frame.
    }
    for (const link of links) {
      if (!link.target) fail("تعذر العثور على وجهة أحد أزرار التنقّل.");
      const reaction = [
        {
          trigger: { type: "ON_CLICK" },
          actions: [
            {
              type: "NODE",
              destinationId: link.target.id,
              navigation: "NAVIGATE",
              transition: {
                type: "DISSOLVE",
                easing: { type: "EASE_OUT" },
                duration: 0.15,
              },
              preserveScrollPosition: false,
            },
          ],
        },
      ];
      await link.node.setReactionsAsync(reaction);
      for (const child of link.node.children) {
        if (child.type === "TEXT") await child.setReactionsAsync(reaction);
      }
    }
    await figma.setCurrentPageAsync(page);
    figma.viewport.scrollAndZoomIntoView([flowStart]);
    return { screens: data.screens.length, frames: data.screens.length * 2 + 2, links: links.length };
  } catch (error) {
    if (page && figma.root.children.includes(page)) figma.root.removeChild(page);
    throw error;
  }
}

figma.ui.onmessage = async (message) => {
  if (!message || message.type !== "import-design") return;
  try {
    const result = await importDesign(message.data);
    figma.ui.postMessage({ type: "import-result", ok: true, ...result });
    figma.notify(`تم إنشاء ${result.screens} شاشة مع نسختي سطح المكتب والهاتف.`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: "import-result", ok: false, error: detail });
    figma.notify("تعذر استيراد التصميم. لم تُترك صفحة جزئية في الملف.", { error: true });
  }
};
