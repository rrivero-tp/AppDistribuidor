import { useEffect, useRef, useState } from 'react';

export default function ProgressBar({ value = 0, color = '#EE7623', height = 6, animated = true, className = '' }) {
  const [width, setWidth] = useState(0);
  const clamped = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setWidth(clamped), 50);
      return () => clearTimeout(t);
    } else {
      setWidth(clamped);
    }
  }, [clamped, animated]);

  return (
    <div className={`rounded-full bg-[#E5E3DC] overflow-hidden ${className}`} style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: animated ? 'width 0.8s ease-in-out' : 'none',
        }}
      />
    </div>
  );
}
