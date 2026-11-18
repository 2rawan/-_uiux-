export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`forma-signature-mark ${className}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}
export function Logo() {
  return (
    <span className="forma-lockup forma-signature" aria-label="Forma">
      <span className="forma-wordmark">FORMA</span>
      <span className="forma-signature-rule" aria-hidden="true" />
    </span>
  );
}
