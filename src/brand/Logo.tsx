import { logo } from "./logo";
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`forma-logo-mark ${className}`}
      viewBox={logo.viewBox}
      fill="none"
      aria-hidden="true"
    >
      {logo.shapes.map((shape) => (
        <rect
          key={shape.name}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.radius}
          fill={shape.accent ? logo.colors.accent : "currentColor"}
        />
      ))}
    </svg>
  );
}
export function Logo() {
  return (
    <span className="forma-lockup">
      <LogoMark />
      <span className="forma-wordmark">
        forma<span className="forma-wordmark-dot">.</span>
      </span>
    </span>
  );
}
