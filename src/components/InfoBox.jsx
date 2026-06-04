const variantMap = {
  success: { bg: '#E8F5EE', border: '#2E7D52', text: '#1B5C35' },
  warning: { bg: '#FFF9E6', border: '#FAA21B', text: '#7A5010' },
  danger:  { bg: '#FEF0EF', border: '#C33C32', text: '#9B2B22' },
  info:    { bg: '#E3F0FA', border: '#1A6FA8', text: '#144F78' },
  neutral: { bg: '#F2F2F2', border: '#C8C8C8', text: '#5F6B6D' },
  coral:   { bg: '#FEF0EF', border: '#F0483E', text: '#C33C32' },
  amber:   { bg: '#FFF5E6', border: '#EE7623', text: '#8A4410' },
};

export default function InfoBox({ text, variant = 'info', icon, className = '' }) {
  const s = variantMap[variant] || variantMap.info;
  return (
    <div
      className={`rounded-xl p-3.5 flex items-start gap-2.5 text-sm leading-relaxed ${className}`}
      style={{ backgroundColor: s.bg, borderLeft: `3px solid ${s.border}` }}
    >
      {icon && <span className="mt-0.5 shrink-0" style={{ color: s.border }}>{icon}</span>}
      <p style={{ color: s.text }}>{text}</p>
    </div>
  );
}
