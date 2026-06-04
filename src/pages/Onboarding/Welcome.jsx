import { useNavigate } from 'react-router-dom';
import { Store, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';

export default function Welcome() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  // Si hay sesión existente, este es un preview desde el panel demo
  const isDemo = !!(state.session && !state.session.onboarding_completo);

  const handleExitDemo = async () => {
    try {
      await db.patchSingleton('session', { onboarding_completo: true });
      dispatch({ type: 'UPDATE_SESSION', payload: { onboarding_completo: true } });
    } catch {}
    navigate('/cartera');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: '#EE7623' }}>
          <Store size={40} color="white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-center text-[#1A1A1A] mb-2">
          Tienda Pago
        </h1>
        <p className="text-[#5F6B6D] text-center text-base mb-10">
          Tu herramienta de preventas, ahora en tu bolsillo
        </p>

        <div className="w-full space-y-3">
          {[
            { Icon: TrendingUp,   text: 'Gestiona tu cartera de bodegas' },
            { Icon: Zap,          text: 'Toma pedidos y referidos al instante' },
            { Icon: ShieldCheck,  text: 'Accede a beneficios y crédito exclusivo' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-[#F7F6F2] rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF0E6' }}>
                <Icon size={16} color="#EE7623" />
              </div>
              <span className="text-sm text-[#1A1A1A] font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-5 pb-6 pt-4 space-y-3">
        {isDemo && (
          <button
            onClick={handleExitDemo}
            className="w-full text-center text-sm text-[#9A9A9A] py-2 active:text-[#5F6B6D]"
          >
            ← Volver a la app (modo demo)
          </button>
        )}
        <Button label="Comenzar" onClick={() => navigate('/onboarding/otp')} />
        <p className="text-center text-xs text-[#9A9A9A]">
          Al continuar, aceptas los{' '}
          <span className="text-[#EE7623]">Términos y condiciones</span>
        </p>
      </div>
    </div>
  );
}
