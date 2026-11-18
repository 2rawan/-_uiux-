import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Video,
  Settings,
  ShieldCheck,
  Check,
  Download,
  X,
  Menu,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MonitorUp,
  PhoneOff,
  Circle,
  Grid2X2,
  ExternalLink,
  FileJson,
  Clock3,
  Leaf,
  Plus,
} from "lucide-react";
import { screens, sections, type Screen } from "./catalog";
import { toCsv } from "../lib/attendance";
import { Logo, LogoMark } from "../brand/Logo";
import { DemoApp } from "../DemoApp";
import { screenIdFromHash } from "./navigation";
const icons = [
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Video,
  Settings,
  ShieldCheck,
];
function currentId() {
  return screenIdFromHash(location.hash);
}
export default function Prototype() {
  const [id, setId] = useState(currentId);
  const [directory, setDirectory] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState("");
  const [avatar, setAvatar] = useState({ x: 49, y: 60 });
  const [saved, setSaved] = useState<
    { screen: string; values: Record<string, string> }[]
  >([]);
  const screen =
    screens.find((s) => s.id === id) ||
    screens.find((s) => s.id === "sign-in")!;
  const isAccessScreen = screen.section === "Start" && screen.id !== "overview";
  useEffect(() => {
    const update = () => {
      setId(currentId());
      setQuery("");
      setMobile(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    document.title = `${screen.title} — Forma Prototype`;
    document.querySelector<HTMLElement>(".proto-title")?.focus();
  }, [screen.id]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDirectory(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  function go(target: string) {
    location.hash = target;
    setDirectory(false);
    setSearch("");
  }
  function action(target: string) {
    go(target);
    setToast("Prototype transition · no external service was contacted.");
  }
  useEffect(() => {
    if (!directory) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = document.querySelector<HTMLElement>(".proto-directory");
    const nodes = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("button, input, a[href]") || [],
      );
    nodes()[0]?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const elements = nodes();
      const first = elements[0],
        last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [directory]);
  const filtered = useMemo(
    () =>
      screens.filter((s) =>
        `${s.title} ${s.section} ${s.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  function exportReport() {
    const rows = (screen.rows || []).filter((r) =>
      r.join(" ").toLowerCase().includes(query.toLowerCase()),
    );
    const data = toCsv([screen.columns || ["Sample data"], ...rows]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([data], { type: "text/csv;charset=utf-8;" }),
    );
    link.download = `forma-${screen.id}-demo.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setToast("Sample report exported.");
  }
  function ActionButtons({ s = screen }: { s?: Screen }) {
    return (
      <div className="proto-actions">
        {s.actions.map((a, i) => (
          <button
            key={`${a.target}-${i}`}
            className={a.primary ? "primary" : "secondary"}
            onClick={() => action(a.target)}
          >
            {a.label}
            {a.primary ? <ArrowRight size={14} /> : <ArrowUpRight size={13} />}
          </button>
        ))}
      </div>
    );
  }
  if (id === "original-demo")
    return (
      <>
        <button
          className="back-to-proto primary"
          onClick={() => go("overview")}
        >
          Back to full prototype
        </button>
        <DemoApp />
      </>
    );
  return (
    <div className={`proto-app ${isAccessScreen ? "proto-access" : ""}`}>
      <aside
        inert={directory}
        className={`proto-sidebar ${mobile ? "open" : ""}`}
      >
        <a className="brand" href="#overview">
          <Logo />
        </a>
        <button className="proto-workspace" onClick={() => go("overview")}>
          <span>a✳</span>
          <div>
            <b>Acme Studio</b>
            <small>UI/UX prototype · All roles</small>
          </div>
          <ChevronRight size={15} />
        </button>
        <span className="proto-nav-label">EXPLORE YOUR WORKSPACE</span>
        <nav>
          {sections.map((section, i) => {
            const Icon = icons[i % icons.length];
            const first = screens.find((s) => s.section === section)!;
            return (
              <div className="proto-nav-section" key={section}>
                <button
                  className={`proto-section-button ${screen.section === section ? "selected" : ""}`}
                  onClick={() => go(first.id)}
                >
                  <Icon size={17} />
                  {section}
                  <small>
                    {screens.filter((s) => s.section === section).length}
                  </small>
                </button>
                {screen.section === section && (
                  <div className="proto-subnav">
                    {screens
                      .filter((s) => s.section === section)
                      .map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          aria-current={s.id === screen.id ? "page" : undefined}
                        >
                          {s.title}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="proto-side-bottom">
          <div className="proto-side-note">
            <Leaf size={20} />
            <b>Designed for connection.</b>
            <p>
              Every screen is linked.
              <br />
              Every service is simulated.
            </p>
          </div>
          <button onClick={() => setDirectory(true)}>
            <Grid2X2 size={16} />
            All {screens.length} screens
          </button>
          <div className="proto-profile">
            <span>RJ</span>
            <div>
              <b>Rawan Jarada</b>
              <small>Prototype reviewer</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="proto-shell" inert={directory}>
        <header className="proto-topbar">
          <div>
            <button
              className="icon-button proto-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            {isAccessScreen && (
              <a className="proto-access-brand" href="#sign-in">
                <Logo />
                <span className="forma-product-label">VIRTUAL OFFICE</span>
              </a>
            )}
            <span>{screen.section}</span>
            <ChevronRight size={12} />
            <b>{screen.title}</b>
          </div>
          <div>
            <span className="proto-label">SIMULATED PROTOTYPE</span>
            <button className="secondary" onClick={() => setDirectory(true)}>
              <Grid2X2 size={14} />
              <span>All {screens.length} screens · جميع الشاشات</span>
            </button>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() =>
                go(
                  screens.find((s) => /notification/i.test(s.id))?.id ||
                    "overview",
                )
              }
            >
              <Bell size={18} />
            </button>
            <span className="proto-top-avatar">RJ</span>
          </div>
        </header>
        <main className="proto-main">
          <nav
            className="proto-flow-shortcuts"
            aria-label="Prototype quick navigation"
          >
            <button
              className={screen.id === "sign-in" ? "current" : ""}
              onClick={() => go("sign-in")}
            >
              تسجيل الدخول <span>Sign in</span>
            </button>
            <button
              className={screen.id === "overview" ? "current" : ""}
              onClick={() => go("overview")}
            >
              لوحة المتابعة <span>Dashboard</span>
            </button>
            <button onClick={() => go("office")}>
              المكتب <span>Virtual office</span>
            </button>
            <button className="browse-all" onClick={() => setDirectory(true)}>
              <Grid2X2 size={15} />
              جميع الشاشات الـ{screens.length}
              <ArrowRight size={14} />
            </button>
          </nav>
          <div className="proto-breadcrumb">
            <button onClick={() => go("overview")}>Workspace</button>
            <span>/</span>
            {screen.section}
            <span>/</span>
            {screen.title}
          </div>
          <div className="proto-page-heading">
            <div>
              <div className="eyebrow">A LITTLE CLOSER, WHEREVER YOU WORK.</div>
              <h1 tabIndex={-1} className="proto-title">
                {screen.title}
                <span>✳</span>
              </h1>
              <p>{screen.description}</p>
            </div>
            <div className="proto-page-count">
              <span>
                {String(screens.indexOf(screen) + 1).padStart(2, "0")}
              </span>{" "}
              / {screens.length}
              <small>linked screens</small>
            </div>
          </div>
          <div className="proto-demo-strip">
            <ShieldCheck size={15} />
            <span>
              {screen.notice ||
                "Interactive UI/UX prototype. Fictional sample data · no live accounts, payments, media, or integrations."}
            </span>
            <button onClick={() => setDirectory(true)}>
              Explore flows <ArrowRight size={12} />
            </button>
          </div>
          {screen.stats && (
            <div
              className={`proto-stats stats-${Math.min(screen.stats.length, 4)}`}
            >
              {screen.stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`proto-stat tone-${i % 4} ${stat.value.length > 8 ? "long-value" : ""}`}
                >
                  <span>
                    {stat.label}
                    <Circle size={13} />
                  </span>
                  <b>{stat.value}</b>
                  <small>Illustrative workspace data</small>
                  <div className="proto-mini-chart">
                    {[25, 45, 37, 55, 46, 66, 53, 75, 69, 90].map((h, j) => (
                      <i key={j} style={{ height: h + "%" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {screen.kind === "form" ? (
            <div className="proto-form-grid">
              <section className="proto-panel proto-form-panel">
                <div className="proto-card-eyebrow">
                  <span>✦</span> LET’S GET YOU SET UP
                </div>
                <h2>{screen.title}</h2>
                <p className="proto-muted">
                  {screen.id === "sign-in"
                    ? "تسجيل دخول تجريبي — استخدمي أي بيانات وهمية، أو اختاري استكشاف جميع الشاشات."
                    : "Explore the full flow with fictional details. Never enter real passwords or sensitive data."}
                </p>
                {screen.id === "sign-in" && (
                  <button
                    className="proto-skip-demo"
                    onClick={() => go("overview")}
                  >
                    Explore the demo · جرّبي بدون تسجيل <ArrowRight size={16} />
                  </button>
                )}
                <form
                  key={screen.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = Object.fromEntries(
                      new FormData(event.currentTarget),
                    ) as Record<string, string>;
                    const safe = Object.fromEntries(
                      Object.entries(data).filter(
                        ([k]) => !/(password|phone|otp|code|card|cvv)/i.test(k),
                      ),
                    );
                    setSaved((old) => [
                      ...old.slice(-9),
                      { screen: screen.id, values: safe },
                    ]);
                    const target =
                      screen.actions.find((a) => a.primary) ||
                      screen.actions[0];
                    action(target.target);
                  }}
                >
                  {screen.fields?.map((field, i) => (
                    <label key={field.label}>
                      {field.label}
                      {field.required && (
                        <span className="required-mark"> *</span>
                      )}
                      {field.type === "select" ? (
                        <select name={field.label} required={field.required}>
                          <option value="">Choose an option</option>
                          {field.options?.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          name={field.label}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      ) : (
                        <input
                          name={field.label}
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          required={field.required}
                          autoComplete="off"
                          maxLength={160}
                        />
                      )}
                    </label>
                  ))}
                  <div className="proto-actions">
                    {screen.actions.map((a, i) => (
                      <button
                        key={i}
                        type={a.primary ? "submit" : "button"}
                        className={a.primary ? "primary" : "secondary"}
                        onClick={a.primary ? undefined : () => action(a.target)}
                      >
                        {a.label}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </form>
              </section>
              <aside className="proto-form-art">
                <div className="proto-orbit">
                  <span>✳</span>
                  <i>✦</i>
                  <b>
                    <LogoMark />
                  </b>
                </div>
                <h2>
                  A space for people.
                  <br />
                  Room for possibility.
                </h2>
                <p>Thoughtful tools for your team’s everyday rhythm.</p>
                <div className="proto-form-tips">
                  <Check size={16} />
                  Editable design layers
                  <Check size={16} />
                  Linked prototype screens
                  <Check size={16} />
                  No external transactions
                </div>
              </aside>
            </div>
          ) : (
            <>
              {screen.kind === "office" && (
                <section className="proto-panel">
                  <div className="proto-panel-heading">
                    <div>
                      <h2>Acme Studio · Virtual workspace</h2>
                      <p>
                        Local movement preview. Room boundaries and presence are
                        illustrative.
                      </p>
                    </div>
                    <span className="badge success">Demo office</span>
                  </div>
                  <div
                    className="proto-world"
                    tabIndex={0}
                    role="application"
                    aria-label="Demo office. Use arrow keys to move."
                    onKeyDown={(e) => {
                      if (!e.key.startsWith("Arrow")) return;
                      e.preventDefault();
                      setAvatar((p) => ({
                        x: Math.min(
                          92,
                          Math.max(
                            8,
                            p.x +
                              (e.key === "ArrowRight"
                                ? 2
                                : e.key === "ArrowLeft"
                                  ? -2
                                  : 0),
                          ),
                        ),
                        y: Math.min(
                          90,
                          Math.max(
                            12,
                            p.y +
                              (e.key === "ArrowDown"
                                ? 3
                                : e.key === "ArrowUp"
                                  ? -3
                                  : 0),
                          ),
                        ),
                      }));
                    }}
                  >
                    {[
                      "Meeting room",
                      "Focus room",
                      "Open studio",
                      "Coffee lounge",
                    ].map((r, i) => (
                      <button
                        key={r}
                        className={`proto-world-room r-${i}`}
                        onClick={() =>
                          go(
                            screens.find((s) => s.id === "meeting-prejoin")
                              ?.id || screen.actions[0].target,
                          )
                        }
                      >
                        <span>
                          {r}
                          <small>{i + 2} people · demo</small>
                        </span>
                        <div className="proto-desks">
                          {[0, 1, 2].map((j) => (
                            <div key={j}>
                              <MonitorUp size={20} />
                              <i>●</i>
                            </div>
                          ))}
                        </div>
                        <b>{["👩🏽‍💻", "🪴", "👨🏻‍💻", "☕"][i]}</b>
                      </button>
                    ))}
                    <span
                      className="proto-your-avatar"
                      style={{ left: `${avatar.x}%`, top: `${avatar.y}%` }}
                    >
                      <small>You</small>👩🏽‍💻
                    </span>
                    <span className="proto-world-hint">
                      Click a room to join · Focus map and use ↑ ← ↓ →
                    </span>
                  </div>
                </section>
              )}
              {screen.kind === "meeting" && (
                <section className="proto-meeting">
                  <div className="proto-meeting-top">
                    <span>
                      <i />
                      {screen.title} · Simulated room
                    </span>
                    <span>
                      <Clock3 size={14} />
                      12:34 · Demo
                    </span>
                  </div>
                  <div className="proto-video-grid">
                    {[
                      "You",
                      "Olivia · Mentor",
                      "Phoenix · Student",
                      "Lana · Mentor",
                    ].map((n, i) => (
                      <div key={n} className={`proto-video-tile tile-${i}`}>
                        <span>{n.split(" ")[0].slice(0, 2).toUpperCase()}</span>
                        <small>
                          {n}
                          {i === 0 && muted ? " · Muted" : ""}
                        </small>
                        <MicOff size={15} />
                      </div>
                    ))}
                  </div>
                  {sharing && (
                    <div className="proto-share-banner">
                      <MonitorUp size={16} />
                      Screen-sharing preview · no screen is being captured.
                    </div>
                  )}
                  <div className="proto-media-controls">
                    <button
                      aria-label={
                        muted
                          ? "Unmute demo microphone"
                          : "Mute demo microphone"
                      }
                      aria-pressed={muted}
                      onClick={() => setMuted(!muted)}
                    >
                      {muted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                      aria-label={
                        camera ? "Show demo camera" : "Hide demo camera"
                      }
                      aria-pressed={camera}
                      onClick={() => setCamera(!camera)}
                    >
                      {camera ? <CameraOff size={20} /> : <Camera size={20} />}
                    </button>
                    <button
                      aria-label="Toggle demo screen sharing"
                      aria-pressed={sharing}
                      onClick={() => setSharing(!sharing)}
                    >
                      <MonitorUp size={20} />
                    </button>
                    <button
                      aria-label="Leave demo meeting"
                      className="proto-hangup"
                      onClick={() => go("office")}
                    >
                      <PhoneOff size={20} />
                    </button>
                  </div>
                </section>
              )}
              {(screen.kind === "dashboard" || screen.kind === "detail") &&
                !screen.rows && (
                  <section className="proto-panel proto-welcome">
                    <div>
                      <span className="eyebrow">
                        YOUR WORKSPACE, AT A GLANCE
                      </span>
                      <h2>
                        Good things happen
                        <br />
                        when we come together.
                      </h2>
                      <p>{screen.description}</p>
                      <div className="proto-people">
                        <span>OR</span>
                        <span>PB</span>
                        <span>LS</span>
                        <span>+15</span>
                        <small>Your demo team is here.</small>
                      </div>
                    </div>
                    <div className="proto-welcome-art">
                      <div>✳</div>
                      <span>✦</span>
                      <i>✦</i>
                      <b>
                        hello,
                        <br />
                        team.
                      </b>
                    </div>
                  </section>
                )}
              {(screen.kind === "empty" || screen.kind === "success") && (
                <section className="proto-panel proto-empty">
                  <div
                    className={
                      screen.kind === "success"
                        ? "proto-success-icon"
                        : "proto-empty-icon"
                    }
                  >
                    {screen.kind === "success" ? (
                      <Check size={35} />
                    ) : (
                      <Video size={35} />
                    )}
                  </div>
                  <h2>{screen.title}</h2>
                  <p>{screen.description}</p>
                  <span className="badge neutral">
                    {screen.kind === "success"
                      ? "Prototype completed · no real service action"
                      : "Sample state"}
                  </span>
                </section>
              )}
              {screen.rows && (
                <section className="proto-panel proto-data-panel">
                  <div className="proto-panel-heading">
                    <div>
                      <h2>
                        {screen.title}{" "}
                        <span className="count-chip">
                          {screen.rows.length} sample records
                        </span>
                      </h2>
                      <p>Explore details using the connected actions below.</p>
                    </div>
                    <button className="secondary" onClick={exportReport}>
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                  <div className="proto-data-toolbar">
                    <span className="proto-table-tab">All records</span>
                    <div className="table-search">
                      <Search size={15} />
                      <input
                        aria-label="Search table"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search records..."
                      />
                    </div>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {screen.columns?.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                          <th>Explore</th>
                        </tr>
                      </thead>
                      <tbody>
                        {screen.rows
                          .filter((r) =>
                            r
                              .join(" ")
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                          )
                          .map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j}>
                                  {j === 0 ? (
                                    <div className="proto-record-name">
                                      <span>
                                        {cell.slice(0, 2).toUpperCase()}
                                      </span>
                                      {cell}
                                    </div>
                                  ) : /^(active|connected|on time|uploaded|approved|paid|healthy)$/i.test(
                                      cell,
                                    ) ? (
                                    <span className="badge success">
                                      {cell}
                                    </span>
                                  ) : /^(late|pending|retrying|uploading)$/i.test(
                                      cell,
                                    ) ? (
                                    <span className="badge warning">
                                      {cell}
                                    </span>
                                  ) : /^(failed|absent|revoked|error)$/i.test(
                                      cell,
                                    ) ? (
                                    <span className="badge danger">{cell}</span>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                              <td>
                                <button
                                  aria-label={`Explore ${row[0]}`}
                                  className="icon-button"
                                  onClick={() =>
                                    go(
                                      screen.actions.find((a) => !a.primary)
                                        ?.target || screen.actions[0].target,
                                    )
                                  }
                                >
                                  <ArrowUpRight size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {!screen.rows.some((r) =>
                      r.join(" ").toLowerCase().includes(query.toLowerCase()),
                    ) && (
                      <div className="empty">
                        No sample records match your search.
                      </div>
                    )}
                  </div>
                  <div className="proto-table-foot">
                    Illustrative records only · Exports include the current
                    search results.
                  </div>
                </section>
              )}
              <section className="proto-panel proto-next-panel">
                <div>
                  <span className="eyebrow">CONTINUE THE PROTOTYPE</span>
                  <h2>Where would you like to go next?</h2>
                  <p>Every action takes you to another designed screen.</p>
                </div>
                <ActionButtons />
              </section>
            </>
          )}
          {saved.length > 0 && (
            <details className="proto-local-changes">
              <summary>
                {saved.length} form flow(s) completed in this preview session
              </summary>
              <p>
                Temporary session data only. No backend records were created.
                Sensitive fields are excluded.
              </p>
              {saved.map((s, i) => (
                <div key={i}>
                  <b>{screens.find((x) => x.id === s.screen)?.title}</b>
                  <span>
                    {Object.values(s.values).join(" · ") ||
                      "Demo flow completed"}
                  </span>
                </div>
              ))}
            </details>
          )}
          <div className="proto-delivery">
            <div>
              <FileJson size={21} />
              <span>
                <b>Take the design with you.</b>
                <small>
                  Editable Figma layers + linked desktop and mobile flows via
                  the included importer.
                </small>
              </span>
            </div>
            <a className="secondary" download href="./design/forma-design.json">
              <Download size={14} />
              Design JSON
            </a>
            <button className="secondary" onClick={() => setDirectory(true)}>
              <Grid2X2 size={14} />
              Screen directory
            </button>
          </div>
          <footer className="page-footer">
            <span>
              <span className="mini-brand">
                <LogoMark />
              </span>
              A little closer, wherever you work.
            </span>
            <span>Forma · UI/UX delivery · No live services</span>
          </footer>
        </main>
      </div>
      {directory && (
        <div className="proto-directory-backdrop">
          <section
            className="proto-directory"
            role="dialog"
            aria-modal="true"
            aria-labelledby="screen-directory-title"
          >
            <div className="proto-directory-header">
              <div>
                <span className="eyebrow">COMPLETE PROTOTYPE DIRECTORY</span>
                <h2 id="screen-directory-title">
                  One workspace. Every journey.
                </h2>
                <p>{screens.length} connected screens · Desktop & mobile</p>
              </div>
              <button
                autoFocus
                aria-label="Close screen directory"
                className="icon-button"
                onClick={() => setDirectory(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="proto-directory-search">
              <Search size={18} />
              <input
                aria-label="Search screens"
                placeholder="Find a screen, feature, or flow…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="proto-directory-sections">
              {sections.map((section) => (
                <section key={section}>
                  <h3>{section}</h3>
                  <div>
                    {filtered
                      .filter((s) => s.section === section)
                      .map((s) => (
                        <button key={s.id} onClick={() => go(s.id)}>
                          <span>
                            <b>{s.title}</b>
                            <small>
                              {s.kind} · {s.actions.length} linked actions
                            </small>
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                  </div>
                </section>
              ))}
              {!filtered.length && (
                <div className="empty">No screens match your search.</div>
              )}
            </div>
            <div className="proto-directory-footer">
              <a href="./design/forma-design.json" download>
                Download editable design data <FileJson size={14} />
              </a>
              <button onClick={() => go("original-demo")}>
                Open original dashboard <ExternalLink size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
