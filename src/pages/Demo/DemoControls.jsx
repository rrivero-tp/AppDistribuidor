import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';

export default function DemoControls() {
  const navigate = useNavigate();
  const { state, dispatch, showToast, refreshData } = useApp();
  const [score, setScore] = useState(state.session?.trust_score || 78);
  const [loading, setLoading] = useState(false);

  const close = () => dispatch({ type: 'CLOSE_DEMO' });

  const getBandaLabel = (s) => s >= 70 ? '🟢 Banda Verde (3 cupones)' : s >= 40 ? '🟡 Banda Ámbar (1 cupón)' : '🔴 Banda Roja (0 cupones)';

  const handleScoreChange = async (val) => {
    setScore(val);
    const banda = val >= 70 ? 'verde' : val >= 40 ? 'ambar' : 'rojo';
    try {
      await db.patchSingleton('session', { trust_score: val, banda });
      dispatch({ type: 'UPDATE_SESSION', payload: { trust_score: val, banda } });
    } catch {}
  };

  const handleUserSwitch = async (tipo) => {
    const updates = tipo === 'aliado'
      ? { tipo: 'aliado', marca_codigo: 'MRC-ALICORP-PE', marca_nombre: 'Alicorp Perú', distribuidor: 'Drokasa Lima Norte', acceso_completo: true }
      : { tipo: 'libre', marca_codigo: null, marca_nombre: null, distribuidor: null };
    try {
      await db.patchSingleton('session', updates);
      dispatch({ type: 'UPDATE_SESSION', payload: updates });
      showToast(`Cambiado a ${tipo === 'aliado' ? 'Aliado Alicorp' : 'Independiente'}`, 'success');
    } catch {}
  };

  const handleAccesoToggle = async () => {
    const nuevo = !state.session?.acceso_completo;
    try {
      await db.patchSingleton('session', { acceso_completo: nuevo });
      dispatch({ type: 'UPDATE_SESSION', payload: { acceso_completo: nuevo } });
      showToast(nuevo ? '✓ Acceso completo activado' : '🔒 Acceso limitado (solo pedidos)', nuevo ? 'success' : 'warning');
    } catch {}
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await refreshData();
      showToast('Datos recargados desde db.json', 'success');
    } catch {
      showToast('Error al recargar datos', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 z-40" onClick={close} />

      {/* Drawer */}
      <div className="absolute top-0 right-0 bottom-0 w-[85%] bg-white z-50 flex flex-col shadow-2xl rounded-l-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E3DC] bg-[#F7F6F2]">
          <span className="font-display font-bold text-sm text-[#1A1A1A]">⚗ Panel de Demo</span>
          <button onClick={close} className="p-1.5 rounded-lg active:bg-[#E5E3DC]">
            <X size={18} color="#5F6B6D" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Usuario */}
          <Section title="Usuario">
            <div className="space-y-2">
              <p className="text-xs text-[#9A9A9A]">Tipo actual: <strong className="text-[#1A1A1A]">{state.session?.tipo === 'aliado' ? 'Aliado' : 'Independiente'}</strong></p>
              <div className="flex gap-2">
                <Chip label="Aliado (Alicorp)" active={state.session?.tipo === 'aliado'} onClick={() => handleUserSwitch('aliado')} />
                <Chip label="Independiente" active={state.session?.tipo === 'libre'} onClick={() => handleUserSwitch('libre')} />
              </div>
              {state.session?.tipo === 'libre' && (
                <button
                  onClick={handleAccesoToggle}
                  className="w-full py-2 rounded-xl text-xs font-medium border-2 transition-all flex items-center justify-between px-3"
                  style={{
                    borderColor: state.session?.acceso_completo ? '#2E7D52' : '#FAA21B',
                    backgroundColor: state.session?.acceso_completo ? '#E8F5EE' : '#FFF9E6',
                    color: state.session?.acceso_completo ? '#2E7D52' : '#7A5010',
                  }}
                >
                  <span>{state.session?.acceso_completo ? '✓ Acceso completo' : '🔒 Solo pedidos'}</span>
                  <span className="text-[10px] opacity-70">Tocar para cambiar</span>
                </button>
              )}
            </div>
          </Section>

          {/* Score */}
          <Section title="Trust Score">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono" style={{
                  color: score >= 70 ? '#2E7D52' : score >= 40 ? '#FAA21B' : '#C33C32'
                }}>{score}</span>
                <span className="text-xs text-[#9A9A9A]">{getBandaLabel(score)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={e => handleScoreChange(Number(e.target.value))}
                className="w-full accent-[#EE7623]"
              />
              <div className="flex justify-between text-xs text-[#9A9A9A]">
                <span>0</span><span>40</span><span>70</span><span>100</span>
              </div>
            </div>
          </Section>

          {/* Navigation shortcuts */}
          <Section title="Estados de prueba">
            <div className="space-y-2">
              <NavBtn label="Ver cliente en mora" onClick={() => { navigate('/cartera/c1'); close(); }} />
              <NavBtn label="Ver preaprobado (María)" onClick={() => { navigate('/cartera/c4'); close(); }} />
              <NavBtn label="Ver en evaluación (Jorge)" onClick={() => { navigate('/cartera/c6'); close(); }} />
              <NavBtn label="Ver beneficios" onClick={() => { navigate('/beneficios'); close(); }} />
              <NavBtn label="Ver crédito" onClick={() => { navigate('/credito'); close(); }} />
              <NavBtn label="Ir al Onboarding" onClick={async () => {
                try {
                  await db.patchSingleton('session', { onboarding_completo: false });
                  dispatch({ type: 'UPDATE_SESSION', payload: { onboarding_completo: false } });
                } catch {}
                close();
                navigate('/onboarding/welcome');
              }} />
            </div>
          </Section>

          {/* Offline simulation */}
          <Section title="Simulación">
            <button
              onClick={() => {
                dispatch({ type: 'SET_OFFLINE', payload: !state.isOffline });
                showToast(state.isOffline ? 'Conexión restaurada' : 'Modo offline activado', 'warning');
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
              style={{
                borderColor: state.isOffline ? '#FAA21B' : '#E5E3DC',
                backgroundColor: state.isOffline ? '#FFF5E6' : 'white',
                color: state.isOffline ? '#FAA21B' : '#5F6B6D',
              }}
            >
              {state.isOffline ? '📡 Restaurar conexión' : '✈️ Simular offline'}
            </button>
          </Section>

          {/* Reset */}
          <Section title="Reset">
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-[#FEF0EF] text-[#C33C32] border-2 border-[#F0483E]/30 active:bg-[#C33C32]/10 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Recargar datos de db.json
            </button>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
      style={{
        borderColor: active ? '#EE7623' : '#E5E3DC',
        backgroundColor: active ? '#EE7623' : 'white',
        color: active ? 'white' : '#5F6B6D',
      }}
    >
      {label}
    </button>
  );
}

function NavBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 px-3 rounded-xl text-sm text-left text-[#1A1A1A] bg-[#F7F6F2] active:bg-[#E5E3DC] transition-colors"
    >
      {label} →
    </button>
  );
}
