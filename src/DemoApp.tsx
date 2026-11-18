import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Video,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Bell,
  Clock3,
  Check,
  X,
  Download,
  Plug,
  Mic,
  MapPin,
  LogIn,
  Menu,
  Leaf,
  Coffee,
  Monitor,
} from "lucide-react";
import { toCsv } from "./lib/attendance";
import "./styles.css";

type Page =
  | "Overview"
  | "Virtual office"
  | "Schedule"
  | "Members"
  | "Attendance"
  | "Recordings"
  | "Settings";
type Member = {
  name: string;
  initials: string;
  role: string;
  team: string;
  status: string;
  joined: string;
  time: string;
  color: string;
};
const members: Member[] = [
  {
    name: "Olivia Rhye",
    initials: "OR",
    role: "Mentor",
    team: "Design",
    status: "On time",
    joined: "09:00 AM",
    time: "3h 24m",
    color: "peach",
  },
  {
    name: "Phoenix Baker",
    initials: "PB",
    role: "Student",
    team: "Engineering",
    status: "On time",
    joined: "08:57 AM",
    time: "3h 27m",
    color: "lavender",
  },
  {
    name: "Lana Steiner",
    initials: "LS",
    role: "Mentor",
    team: "Engineering",
    status: "Late",
    joined: "09:18 AM",
    time: "3h 06m",
    color: "rose",
  },
  {
    name: "Demi Wilkinson",
    initials: "DW",
    role: "Student",
    team: "Design",
    status: "On time",
    joined: "08:59 AM",
    time: "3h 25m",
    color: "sage",
  },
  {
    name: "Drew Cano",
    initials: "DC",
    role: "Student",
    team: "Marketing",
    status: "Absent",
    joined: "—",
    time: "—",
    color: "sand",
  },
];
type Session = {
  id: string;
  title: string;
  team: string;
  start: string;
  duration: string;
  color: string;
  date: string;
};
const today = new Date().toISOString().slice(0, 10);
const initialSessions: Session[] = [
  {
    id: "1",
    title: "Design standup",
    team: "Design team",
    start: "10:00",
    duration: "30",
    color: "purple",
    date: today,
  },
  {
    id: "2",
    title: "Frontend mentorship",
    team: "Engineering",
    start: "11:30",
    duration: "60",
    color: "green",
    date: today,
  },
  {
    id: "3",
    title: "A little coffee break",
    team: "Everyone is welcome",
    start: "14:00",
    duration: "15",
    color: "orange",
    date: today,
  },
];
function readSessions() {
  try {
    const value = JSON.parse(localStorage.getItem("forma-sessions") || "null");
    return Array.isArray(value) &&
      value.every(
        (s) =>
          typeof s.title === "string" &&
          typeof s.start === "string" &&
          typeof s.date === "string" &&
          typeof s.id === "string" &&
          typeof s.team === "string" &&
          typeof s.duration === "string" &&
          ["purple", "green", "orange"].includes(s.color),
      )
      ? (value as Session[])
      : initialSessions;
  } catch {
    return initialSessions;
  }
}
const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Virtual office", icon: Building2 },
  { name: "Schedule", icon: CalendarDays },
  { name: "Members", icon: Users },
  { name: "Attendance", icon: ChartNoAxesCombined },
  { name: "Recordings", icon: Video },
] as const;
function Avatar({
  member,
  small = false,
}: {
  member: Member;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${member.color} ${small ? "small" : ""}`}>
      {member.initials}
      <i />
    </span>
  );
}
function OfficeMap({
  large = false,
  onRoom,
}: {
  large?: boolean;
  onRoom: (r: string) => void;
}) {
  const [pos, setPos] = useState({ x: 53, y: 67 });
  return (
    <div
      className={`office-map ${large ? "large" : ""}`}
      tabIndex={0}
      role="application"
      aria-label="Demo office map. Focus and use arrow keys to move your avatar."
      onKeyDown={(e) => {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          setPos((p) => ({
            x: Math.min(
              95,
              Math.max(
                5,
                p.x +
                  (e.key === "ArrowRight" ? 2 : e.key === "ArrowLeft" ? -2 : 0),
              ),
            ),
            y: Math.min(
              92,
              Math.max(
                10,
                p.y +
                  (e.key === "ArrowDown" ? 3 : e.key === "ArrowUp" ? -3 : 0),
              ),
            ),
          }));
        }
      }}
    >
      <div className="map-grid" />
      <button className="room room-focus" onClick={() => onRoom("Focus room")}>
        <span className="room-name">
          FOCUS ROOM <span>2/6</span>
        </span>
        <div className="round-table">
          <i />
          <i />
          <i />
        </div>
        <span className="map-person person-a">🧑🏽‍💻</span>
        <span className="map-person person-b">👩🏻‍💻</span>
      </button>
      <button
        className="room room-meeting"
        onClick={() => onRoom("Meeting room")}
      >
        <span className="room-name">
          MEETING ROOM <span>3/8</span>
        </span>
        <div className="meeting-table">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="map-person person-c">👨🏽‍💻</span>
      </button>
      <div className="room room-open">
        <span className="room-name">THE OPEN SPACE</span>
        <div className="desk desk-1">
          <Monitor size={17} />
        </div>
        <div className="desk desk-2">
          <Monitor size={17} />
        </div>
        <div className="desk desk-3">
          <Monitor size={17} />
        </div>
        <div className="desk desk-4">
          <Monitor size={17} />
        </div>
        <span className="map-person person-d">👩🏾‍💻</span>
        <span className="map-person person-e">👨🏻‍💻</span>
      </div>
      <button
        className="room room-lounge"
        onClick={() => onRoom("Coffee lounge")}
      >
        <span className="room-name">
          COFFEE LOUNGE <span>2/8</span>
        </span>
        <div className="sofa" />
        <div className="coffee-table" />
        <Coffee className="coffee-machine" size={25} />
        <span className="map-person person-f">👩🏼‍💻</span>
      </button>
      <div className="plant plant-1">🪴</div>
      <div className="plant plant-2">🪴</div>
      <div className="plant plant-3">🪴</div>
      <div className="plant plant-4">🪴</div>
      <div className="you-pin" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
        <span>You</span>
        <b>👩🏽‍💻</b>
      </div>
      <div className="map-controls">
        <span>
          <i /> Demo office
        </span>
        <span>
          Use arrow keys to explore <kbd>↑</kbd>
          <kbd>←</kbd>
          <kbd>↓</kbd>
          <kbd>→</kbd>
        </span>
        <span className="zoom">
          − <b>80%</b> +
        </span>
      </div>
    </div>
  );
}
export function DemoApp() {
  const [page, setPage] = useState<Page>("Overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All members");
  const [sessions, setSessions] = useState<Session[]>(readSessions);
  const [modal, setModal] = useState<
    "schedule" | "notifications" | "help" | null
  >(null);
  const [room, setRoom] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);
  useEffect(() => {
    try {
      localStorage.setItem("forma-sessions", JSON.stringify(sessions));
    } catch {
      setToast("Browser storage is unavailable. Changes will not persist.");
    }
  }, [sessions]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setRoom(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    if (!modal && !room) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button, input, select, [tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal, room]);
  const visible = members.filter(
    (m) =>
      (filter === "All members" || m.role === filter || m.status === filter) &&
      `${m.name} ${m.team}`.toLowerCase().includes(query.toLowerCase()),
  );
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dateOffset);
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const daySessions = sessions
    .filter((s) => s.date === dateKey)
    .sort((a, b) => a.start.localeCompare(b.start));
  function go(p: Page) {
    setPage(p);
    setQuery("");
    setFilter("All members");
    setMobileNav(false);
  }
  function exportCsv() {
    const csv = toCsv([
      ["Name", "Role", "Team", "Status", "First join", "Connected time"],
      ...visible.map((m) => [
        m.name,
        m.role,
        m.team,
        m.status,
        m.joined,
        m.time,
      ]),
    ]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "forma-demo-attendance.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("Demo attendance report exported.");
  }
  const attendanceTable = (
    <>
      <div className="table-tools">
        <div className="segmented">
          {["All members", "Mentor", "Student"].map((f) => (
            <button
              key={f}
              className={filter === f ? "selected" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "Mentor" ? "Mentors" : f === "Student" ? "Students" : f}
            </button>
          ))}
        </div>
        <div className="table-search">
          <Search size={15} />
          <input
            aria-label="Search members"
            placeholder="Search members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Team</th>
              <th>Status</th>
              <th>
                First joined <ChevronDown size={12} />
              </th>
              <th>Connected time</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => (
              <tr key={m.name}>
                <td>
                  <div className="member-cell">
                    <Avatar member={m} />
                    <span>
                      <b>{m.name}</b>
                      <small>{m.role}</small>
                    </span>
                  </div>
                </td>
                <td>{m.team}</td>
                <td>
                  <span
                    className={`badge ${m.status === "On time" ? "success" : m.status === "Late" ? "warning" : "danger"}`}
                  >
                    <i />
                    {m.status}
                  </span>
                </td>
                <td>{m.joined}</td>
                <td>{m.time}</td>
                <td>
                  <ArrowUpRight size={15} className="muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <div className="empty">No members match your search.</div>
        )}
      </div>
    </>
  );
  return (
    <div className="app">
      <aside
        inert={Boolean(modal || room)}
        className={mobileNav ? "sidebar mobile-open" : "sidebar"}
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Overview");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-dot">®</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() =>
            setToast("Acme Studio is the only workspace in this demo.")
          }
        >
          <span className="workspace-logo">
            a<span>✳</span>
          </span>
          <span>
            <b>Acme Studio</b>
            <small>Workspace · Demo</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={page === name ? "nav-item active" : "nav-item"}
              onClick={() => go(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Virtual office" && (
                <span className="nav-count">18</span>
              )}
              {name === "Recordings" && <span className="new-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="together-card">
            <div className="together-art">
              <Leaf size={26} />
              <span>✦</span>
            </div>
            <b>Better, together.</b>
            <p>
              A shared space for your
              <br />
              team to do great things.
            </p>
            <button onClick={() => setModal("help")}>
              Explore your workspace <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className={`nav-item ${page === "Settings" ? "active" : ""}`}
            onClick={() => go("Settings")}
          >
            <Settings size={19} />
            Settings
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <HelpCircle size={19} />
            Help & getting started
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <Avatar
              member={{ ...members[0], initials: "RJ", color: "lavender" }}
            />
            <span>
              <b>Rawan Jarada</b>
              <small>Workspace admin</small>
            </span>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={Boolean(modal || room)}>
        <header className="topbar">
          <div>
            <button
              className="mobile-toggle icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb">Workspace</span>
            <span className="slash">/</span>
            <span>{page}</span>
          </div>
          <div className="topbar-right">
            <span className="demo-tag">Interactive demo</span>
            <span className="topbar-date">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="divider" />
            <button
              className="notification icon-button"
              aria-label="Notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={19} />
              <i />
            </button>
            <Avatar
              member={{ ...members[0], initials: "RJ", color: "lavender" }}
              small
            />
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR TEAM. ONE SPACE.</div>
              <h1>
                {page === "Overview"
                  ? "A good day starts together."
                  : page === "Virtual office"
                    ? "Your office, wherever you are."
                    : page === "Schedule"
                      ? "Make time for great things."
                      : page === "Attendance"
                        ? "Every connection counts."
                        : page === "Members"
                          ? "Good people. Great possibilities."
                          : page === "Recordings"
                            ? "Keep the conversation going."
                            : "Make yourself at home."}
                <span className="heading-spark">✳</span>
              </h1>
              <p>
                {page === "Overview"
                  ? "Welcome back, Rawan. Here’s what’s happening in your workspace today."
                  : page === "Virtual office"
                    ? "Explore the demo workspace. Select a room or move around with your arrow keys."
                    : page === "Schedule"
                      ? "A little structure. A lot more connection. Plan your team’s next session."
                      : page === "Attendance"
                        ? "A clear view of attendance, punctuality, and confirmed connected time."
                        : page === "Members"
                          ? "Meet the people who make your workspace feel like your workspace."
                          : page === "Recordings"
                            ? "Your team’s shared knowledge, all in one place."
                            : "Workspace preferences and connected services."}
              </p>
            </div>
            <button className="primary" onClick={() => setModal("schedule")}>
              <Plus size={17} />
              Schedule session
            </button>
          </div>
          {(page === "Overview" || page === "Attendance") && (
            <section className="stats-grid">
              {[
                {
                  label: "In the office",
                  value: "18",
                  suffix: "/ 24",
                  change: "+3 from yesterday",
                  icon: Building2,
                  tone: "purple",
                  foot: "75% of your team is here",
                  bars: [24, 35, 29, 49, 41, 60, 54, 72, 62, 82, 75, 88],
                },
                {
                  label: "On-time arrivals",
                  value: "92",
                  suffix: "%",
                  change: "+8% this week",
                  icon: Clock3,
                  tone: "green",
                  foot: "Looking good, team!",
                  bars: [30, 39, 28, 44, 50, 45, 61, 57, 72, 67, 84, 91],
                },
                {
                  label: "Avg. connected time",
                  value: "5h",
                  suffix: " 42m",
                  change: "+36m this week",
                  icon: ChartNoAxesCombined,
                  tone: "orange",
                  foot: "Per member · daily average",
                  bars: [50, 40, 55, 42, 62, 56, 49, 72, 65, 80, 71, 86],
                },
                {
                  label: "Sessions today",
                  value: String(
                    sessions.filter((s) => s.date === today).length,
                  ),
                  suffix: "",
                  change: "View schedule",
                  icon: CalendarDays,
                  tone: "blue",
                  foot: "Make room for collaboration",
                  bars: [],
                },
              ].map((s, i) => (
                <div className={`stat-card ${s.tone}`} key={s.label}>
                  <div className="stat-top">
                    <span>{s.label}</span>
                    <s.icon size={17} />
                  </div>
                  <div className="stat-middle">
                    <div className="stat-number">
                      {s.value}
                      <span>{s.suffix}</span>
                    </div>
                    {i < 3 ? (
                      <div className="spark-bars">
                        {s.bars.map((h, n) => (
                          <i key={n} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    ) : (
                      <div className="calendar-symbol">
                        <CalendarDays size={35} />
                      </div>
                    )}
                  </div>
                  <div className="stat-change">
                    {i < 3 ? (
                      <>
                        <ArrowUpRight size={13} />
                        {s.change}
                      </>
                    ) : (
                      <button onClick={() => go("Schedule")}>
                        {s.change}
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                  <div className="stat-foot">{s.foot}</div>
                </div>
              ))}
            </section>
          )}
          {(page === "Overview" ||
            page === "Virtual office" ||
            page === "Schedule") && (
            <div
              className={page === "Overview" ? "middle-grid" : "single-grid"}
            >
              {page !== "Schedule" && (
                <section className="panel office-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Your virtual office{" "}
                        <span className="live-label">
                          <i />
                          Live preview
                        </span>
                      </h2>
                      <p>A place to connect, create, and just be together.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        if (page === "Overview") go("Virtual office");
                        else setRoom("The open space");
                      }}
                    >
                      Enter office <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <OfficeMap
                    large={page === "Virtual office"}
                    onRoom={setRoom}
                  />
                  <div className="office-footer">
                    <div className="avatar-stack">
                      {members.slice(0, 4).map((m) => (
                        <Avatar key={m.name} member={m} small />
                      ))}
                      <span>+14</span>
                      <p>
                        <b>18 people</b> are making things happen
                      </p>
                    </div>
                    <span className="office-key">
                      <i />
                      Open space <i />
                      Meeting room <i />
                      Focus room
                    </span>
                  </div>
                  {joined && (
                    <div className="joined-banner">
                      <Check size={16} /> You’re exploring {joined}. This is a
                      local preview; audio and video are not connected.
                      <button onClick={() => setJoined(null)}>Leave</button>
                    </div>
                  )}
                </section>
              )}
              {page !== "Virtual office" && (
                <section className="panel schedule-panel">
                  <div className="panel-heading">
                    <h2>Today’s schedule</h2>
                    <button
                      className="icon-button"
                      aria-label="Add session"
                      onClick={() => setModal("schedule")}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                  <div className="schedule-date">
                    <CalendarDays size={15} />
                    <span>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <button
                      aria-label="Previous day"
                      onClick={() => setDateOffset((n) => n - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      aria-label="Next day"
                      onClick={() => setDateOffset((n) => n + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="sessions">
                    {daySessions.map((s) => (
                      <div className={`session ${s.color}`} key={s.id}>
                        <div className="session-time">
                          {s.start}
                          <span>{s.duration} min</span>
                        </div>
                        <div className="session-info">
                          <b>{s.title}</b>
                          <small>{s.team}</small>
                          <span className="session-room">
                            <MapPin size={11} />
                            {s.team === "Everyone is welcome"
                              ? "Coffee lounge"
                              : s.team === "Engineering"
                                ? "Focus room"
                                : "Meeting room"}
                          </span>
                        </div>
                        <button
                          aria-label={`Explore room for ${s.title}`}
                          onClick={() =>
                            setRoom(
                              s.team === "Everyone is welcome"
                                ? "Coffee lounge"
                                : s.team === "Engineering"
                                  ? "Focus room"
                                  : "Meeting room",
                            )
                          }
                        >
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    ))}
                    {!daySessions.length && (
                      <div className="empty">
                        A little breathing room.
                        <br />
                        No sessions scheduled for this day.
                      </div>
                    )}
                  </div>
                  <button
                    className="full-schedule"
                    onClick={() =>
                      page === "Overview"
                        ? go("Schedule")
                        : setModal("schedule")
                    }
                  >
                    {page === "Overview"
                      ? "View full schedule"
                      : "Plan a new session"}
                    <ArrowRight size={14} />
                  </button>
                </section>
              )}
            </div>
          )}
          {(page === "Overview" ||
            page === "Attendance" ||
            page === "Members") && (
            <section className="panel attendance-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {page === "Members"
                      ? "Workspace members"
                      : "Today’s attendance"}
                    <span className="count-chip">24 members</span>
                  </h2>
                  <p>
                    {page === "Members"
                      ? "Demo team directory · 5 sample members shown"
                      : "A little visibility goes a long way. · Sample report"}
                  </p>
                </div>
                <button className="secondary" onClick={exportCsv}>
                  <Download size={15} />
                  Export report
                </button>
              </div>
              {attendanceTable}
              <div className="table-footer">
                <span>
                  Showing {visible.length} of 5 sample members{" "}
                  <span className="sample-divider">·</span> All times in
                  workspace timezone (UTC)
                </span>
                <button
                  className="text-button"
                  onClick={() =>
                    page === "Overview"
                      ? go("Attendance")
                      : setToast(
                          "All sample records are shown. Real reports will use verified server events.",
                        )
                  }
                >
                  View attendance report <ArrowRight size={14} />
                </button>
              </div>
            </section>
          )}
          {page === "Recordings" && (
            <section className="panel integration-page">
              <div className="integration-icon">
                <Video size={32} />
              </div>
              <h2>A home for every conversation.</h2>
              <p>
                Connect your organization’s Google Drive to automatically store
                completed recordings. Recording and uploads need backend and
                media services before they can be enabled.
              </p>
              <span className="badge warning">Not connected</span>
              <button className="primary" onClick={() => go("Settings")}>
                <Plug size={16} />
                View integration setup
              </button>
              <small>
                No recordings yet. Demo sessions are never recorded.
              </small>
            </section>
          )}
          {page === "Settings" && (
            <section className="panel settings-panel">
              <h2>Workspace settings</h2>
              <div className="setting-row">
                <div>
                  <b>Workspace</b>
                  <p>Acme Studio · Demonstration environment</p>
                </div>
                <span className="badge neutral">Demo</span>
              </div>
              <div className="setting-row">
                <div>
                  <b>Google Drive</b>
                  <p>
                    OAuth credentials, secure token storage, and an upload
                    worker are required.
                  </p>
                </div>
                <span className="badge warning">Not connected</span>
              </div>
              <div className="setting-row">
                <div>
                  <b>Audio, video & recording</b>
                  <p>
                    A media provider and server-issued room permissions are
                    required.
                  </p>
                </div>
                <span className="badge neutral">Not configured</span>
              </div>
              <div className="setting-row">
                <div>
                  <b>Phone login & password reset</b>
                  <p>
                    Authentication API and an SMS provider are required. No real
                    accounts are stored here.
                  </p>
                </div>
                <span className="badge neutral">Not configured</span>
              </div>
              <div className="setting-row">
                <div>
                  <b>Local demo data</b>
                  <p>
                    Added schedules are saved only in this browser, not shared
                    with a team.
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => {
                    setSessions(initialSessions);
                    setToast("Demo schedule restored.");
                  }}
                >
                  Reset demo
                </button>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>
              <span className="mini-brand">✳</span> A little closer, wherever
              you work.
            </span>
            <span>
              Made for human connection{" "}
              <span className="footer-flower">✳</span>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {(modal || room) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(null);
            setRoom(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => {
                setModal(null);
                setRoom(null);
              }}
            >
              <X size={20} />
            </button>
            {room ? (
              <>
                <div className="modal-icon">
                  <Building2 size={26} />
                </div>
                <h2 id="dialog-title">{room}</h2>
                <p>
                  A shared space for a little more connection. Explore this room
                  in the local demo.
                </p>
                <div className="demo-notice">
                  <Mic size={18} />
                  Audio, video, recording, and other participants are not
                  connected in this preview.
                </div>
                <button
                  className="primary wide"
                  onClick={() => {
                    setJoined(room);
                    setRoom(null);
                    go("Virtual office");
                    setToast("Room opened in local demo mode.");
                  }}
                >
                  <LogIn size={17} />
                  Explore room
                </button>
              </>
            ) : modal === "schedule" ? (
              <>
                <div className="modal-icon">
                  <CalendarDays size={25} />
                </div>
                <h2 id="dialog-title">Make time to connect.</h2>
                <p>Add a session to your local demo schedule.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setSessions((s) => [
                      ...s,
                      {
                        id: crypto.randomUUID(),
                        title: String(f.get("title")).trim(),
                        team: String(f.get("team")),
                        date: String(f.get("date")),
                        start: String(f.get("time")),
                        duration: String(f.get("duration")),
                        color: "purple",
                      },
                    ]);
                    setModal(null);
                    setToast("Session added to your local demo schedule.");
                  }}
                >
                  <label>
                    Session name
                    <input
                      name="title"
                      placeholder="e.g. Weekly design catch-up"
                      required
                      maxLength={80}
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    Team
                    <select name="team">
                      <option>Design team</option>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Everyone is welcome</option>
                    </select>
                  </label>
                  <div className="form-row">
                    <label>
                      Date
                      <input
                        name="date"
                        type="date"
                        required
                        defaultValue={today}
                      />
                    </label>
                    <label>
                      Start time (UTC)
                      <input
                        name="time"
                        type="time"
                        required
                        defaultValue="10:00"
                      />
                    </label>
                  </div>
                  <label>
                    Duration
                    <select name="duration">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                    </select>
                  </label>
                  <button className="primary wide" type="submit">
                    <Plus size={16} />
                    Create session
                  </button>
                </form>
              </>
            ) : modal === "notifications" ? (
              <>
                <div className="modal-icon">
                  <Bell size={25} />
                </div>
                <h2 id="dialog-title">You’re all caught up.</h2>
                <p>
                  This is a demo workspace. Real attendance alerts and recording
                  upload notifications will appear here once the backend is
                  connected.
                </p>
              </>
            ) : (
              <>
                <div className="modal-icon">
                  <Leaf size={26} />
                </div>
                <h2 id="dialog-title">Welcome to your shared space.</h2>
                <p>
                  Explore your office, browse sample attendance, export a
                  report, or add a session. Schedules are saved in this browser.
                </p>
                <div className="demo-notice">
                  This first interactive prototype uses illustrative team data.
                  It does not authenticate users, measure real attendance, or
                  connect to external services.
                </div>
                <button
                  className="primary wide"
                  onClick={() => {
                    setModal(null);
                    go("Virtual office");
                  }}
                >
                  Explore the office <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
