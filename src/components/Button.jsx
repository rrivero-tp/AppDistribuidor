import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#EE7623] text-white active:bg-[#C85A0A]',
  outline: 'border-2 border-[#EE7623] text-[#EE7623] bg-white active:bg-[#FFF5E6]',
  ghost:   'text-[#5F6B6D] bg-transparent active:bg-[#F7F6F2]',
  danger:  'bg-[#C33C32] text-white active:bg-[#A02D24]',
  amber:   'bg-[#FAA21B] text-white active:bg-[#D4880F]',
  outlineGray: 'border-2 border-[#C8C8C8] text-[#5F6B6D] bg-white active:bg-[#F7F6F2]',
};

export default function Button({
  label, children, variant = 'primary', loading = false,
  disabled = false, onClick, className = '', type = 'button', small = false,
}) {
  const base = small ? 'py-2 px-4 text-sm rounded-xl' : 'py-3.5 px-4 text-[15px] rounded-2xl';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full font-medium transition-all flex items-center justify-center gap-2 ${base} ${variants[variant] ?? variants.primary} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {label ?? children}
    </button>
  );
}
