export default function Card({ children, padding = 'p-4', shadow = true, border = false, className = '', style }) {
  return (
    <div
      className={`bg-white rounded-2xl ${padding} ${shadow ? 'shadow-sm' : ''} ${border ? 'border border-[#E5E3DC]' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
