import { useNavigate, useLocation } from 'react-router-dom';
import { Users, ClipboardList, UserPlus, Gift, CreditCard, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { hasAccesoCompleto } from '../theme';

const tabs = [
  { path: '/cartera',    label: 'Cartera',    Icon: Users,          restricted: false },
  { path: '/pedidos',    label: 'Pedidos',    Icon: ClipboardList,  restricted: false },
  { path: '/referir',    label: 'Referir',    Icon: UserPlus,       restricted: true  },
  { path: '/beneficios', label: 'Beneficios', Icon: Gift,           restricted: true  },
  { path: '/credito',    label: 'Crédito',    Icon: CreditCard,     restricted: true  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const acceso = hasAccesoCompleto(state.session);

  return (
    <div
      className="bg-white border-t border-[#E5E3DC] flex items-stretch shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {tabs.map(({ path, label, Icon, restricted }) => {
        const active  = location.pathname.startsWith(path);
        const locked  = restricted && !acceso;
        const color   = active ? '#EE7623' : locked ? '#C8C8C8' : '#9A9A9A';

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors relative"
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} color={color} />
              {locked && (
                <div className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                  <Lock size={8} color="#C8C8C8" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium" style={{ color }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
