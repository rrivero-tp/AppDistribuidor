import { badgeConfig } from '../theme';

export default function Badge({ label, variant, className = '' }) {
  const cfg = badgeConfig[variant] || badgeConfig.sin_credito;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {label ?? cfg.label}
    </span>
  );
}
