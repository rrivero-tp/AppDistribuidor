import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

function CheckAnimation({ onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => { setPhase(3); onDone?.(); }, 1500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24">
        <svg className="absolute inset-0" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r="44"
            fill="none"
            stroke="#EE7623"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={phase >= 1 ? 0 : 2 * Math.PI * 44}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        {phase >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-scale-in">
              <path d="M8 20l9 9 15-16" stroke="#EE7623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={50} strokeDashoffset={phase >= 3 ? 0 : 50}
                style={{ transition: 'stroke-dashoffset 0.4s ease-in-out' }}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivacionStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useApp();
  const [ready, setReady] = useState(false);

  const state = location.state || {};
  const nombre   = state.nombre   || 'Preventa';
  const apellido = state.apellido || '';
  const uid = `PRV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  // acceso_completo: aliado siempre tiene acceso; libre solo si aportó marca + evidencia
  const accesoCompleto = state.tipo === 'aliado' || !!(state.marcaLibre && state.evidenciaFoto);

  const handleStart = async () => {
    const sessionData = {
      id: 's1',
      preventa_id: 'p1',
      nombre: nombre,
      apellido: state.apellido || '',
      dni: state.doc || '',
      telefono: state.phone || '',
      tipo: state.tipo || 'libre',
      marca_codigo: state.marcaInfo?.codigo || null,
      marca_nombre: state.marcaInfo?.nombre || null,
      marca_libre: state.marcaLibre || null,
      evidencia_foto: state.evidenciaFoto || null,
      distribuidor: state.marcaInfo?.distribuidor || null,
      regional: state.marcaInfo?.regional || null,
      zonal: state.marcaInfo?.zonal || null,
      jefatura: state.marcaInfo?.jefatura || null,
      supervisor: state.marcaInfo?.supervisor || null,
      ruta: state.marcaInfo?.ruta || null,
      trust_score: 20,
      banda: 'rojo',
      pais: state.country?.code || 'PE',
      uid,
      acceso_completo: accesoCompleto,
      onboarding_completo: true,
      created_at: new Date().toISOString(),
    };
    try {
      await db.patchSingleton('session', { ...sessionData, onboarding_completo: true });
      dispatch({ type: 'SET_SESSION', payload: { ...sessionData, onboarding_completo: true } });
    } catch {}
    navigate('/cartera');
  };

  return (
    <div className="flex flex-col h-full px-5 pt-8 items-center">
      <div className="flex gap-1 w-full mb-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-[#EE7623]" />
        ))}
      </div>

      <CheckAnimation onDone={() => setReady(true)} />

      <div className="mt-6 text-center">
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">¡Ya estás listo, {nombre}!</h2>
        <p className="text-sm text-[#5F6B6D] mt-2">Tu cuenta ha sido activada</p>
      </div>

      <div className="w-full mt-6 bg-[#F7F6F2] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">Nombre completo</span>
          <span className="text-xs font-medium text-[#1A1A1A]">{nombre} {apellido}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">ID de preventa</span>
          <span className="text-xs font-mono font-medium text-[#1A1A1A]">{uid}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">Trust Score inicial</span>
          <span className="text-sm font-bold text-[#EE7623]">20 pts</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">Referidos por día</span>
          <span className="text-sm font-bold text-[#1A1A1A]">2</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">Banda inicial</span>
          <Badge label="Banda Roja" variant="danger" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9A9A9A]">Acceso</span>
          {accesoCompleto
            ? <Badge label="✓ Completo" variant="activo" />
            : <Badge label="Solo pedidos" variant="por_vencer" />
          }
        </div>
      </div>

      <div className="mt-auto pb-6 pt-6 w-full">
        <Button label="Ir al inicio" disabled={!ready} onClick={handleStart} />
      </div>
    </div>
  );
}
