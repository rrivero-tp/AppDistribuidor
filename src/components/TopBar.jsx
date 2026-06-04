import { ArrowLeft, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Badge from './Badge';

export default function TopBar({ title, subtitle, showBack = false, showUser = false, showDemo = true }) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { session } = state;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="bg-white border-b border-[#E5E3DC] px-4 py-3 flex items-center gap-3 shrink-0">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-xl text-[#5F6B6D] active:bg-[#F7F6F2]"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {showUser && session ? (
          <>
            <p className="text-xs text-[#9A9A9A]">{getGreeting()}</p>
            <p className="font-display font-bold text-[#1A1A1A] text-base leading-tight">
              {session.nombre} {session.apellido}
            </p>
          </>
        ) : (
          <>
            {title && <p className="font-display font-bold text-[#1A1A1A] text-base leading-tight">{title}</p>}
            {subtitle && <p className="text-xs text-[#9A9A9A] mt-0.5">{subtitle}</p>}
          </>
        )}
      </div>
      {showUser && session && (
        <Badge
          label={session.tipo === 'aliado' ? `${session.marca_nombre}` : 'Independiente'}
          variant={session.tipo === 'aliado' ? 'info' : 'sin_credito'}
        />
      )}
      {showDemo && import.meta.env.DEV && (
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DEMO' })}
          className="p-1.5 rounded-xl text-[#5F6B6D] active:bg-[#F7F6F2] ml-1"
          title="Panel de demo"
        >
          <FlaskConical size={18} />
        </button>
      )}
    </div>
  );
}
