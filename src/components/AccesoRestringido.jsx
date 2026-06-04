import { useState } from 'react';
import { Lock, Camera, Building2, Unlock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db } from '../db';
import Button from './Button';

const FEATURES = {
  referir:    { icon: '👥', label: 'Referir clientes', desc: 'Para referir bodegas y ganar incentivos necesitas verificar tu relación con una marca.' },
  beneficios: { icon: '🎁', label: 'Beneficios y cupones', desc: 'Los beneficios y cupones están disponibles para preventas con acceso completo verificado.' },
  credito:    { icon: '💳', label: 'Crédito al preventa', desc: 'Para solicitar crédito personal necesitas verificar la marca con la que operas.' },
};

export default function AccesoRestringido({ feature = 'referir' }) {
  const { state, dispatch, showToast } = useApp();
  const cfg = FEATURES[feature] || FEATURES.referir;

  const [showSheet, setShowSheet] = useState(false);
  const [marca, setMarca] = useState(state.session?.marca_libre || '');
  const [fotoStatus, setFotoStatus] = useState(
    state.session?.evidencia_foto ? 'done' : null
  );
  const [loading, setLoading] = useState(false);

  const canComplete = marca.trim() && fotoStatus === 'done';

  const handleFoto = () => {
    setFotoStatus('loading');
    setTimeout(() => setFotoStatus('done'), 1500);
  };

  const handleComplete = async () => {
    if (!canComplete) return;
    setLoading(true);
    const evidencia = `evidencia_${Date.now()}.jpg`;
    try {
      await db.patchSingleton('session', {
        marca_libre: marca.trim(),
        evidencia_foto: evidencia,
        acceso_completo: true,
      });
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { marca_libre: marca.trim(), evidencia_foto: evidencia, acceso_completo: true },
      });
      showToast('¡Verificación completada! Acceso completo activado', 'success');
      setShowSheet(false);
    } catch {
      showToast('Error al guardar la verificación', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Locked state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#F2F2F2] flex items-center justify-center mb-5">
          <span className="text-4xl">{cfg.icon}</span>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#FEF0EF] flex items-center justify-center -mt-7 mb-4 border-2 border-white">
          <Lock size={18} color="#C33C32" />
        </div>

        <h3 className="font-display font-bold text-xl text-[#1A1A1A] mb-2">{cfg.label}</h3>
        <p className="text-sm text-[#5F6B6D] leading-relaxed mb-2">{cfg.desc}</p>

        <div className="w-full bg-[#FFF9E6] rounded-xl px-4 py-3 mb-6 border border-[#FAA21B]/30">
          <p className="text-xs text-[#7A5010] leading-relaxed">
            Eres preventa <strong>independiente sin verificación</strong>. Solo puedes <strong>tomar pedidos</strong>.
            Completa tu perfil para desbloquear el acceso completo.
          </p>
        </div>

        <Button label="Verificar mi marca" onClick={() => setShowSheet(true)} />
        <p className="text-xs text-[#9A9A9A] mt-3">Toma menos de 1 minuto · Solo pediremos marca + foto</p>
      </div>

      {/* Bottom sheet */}
      {showSheet && (
        <div className="absolute inset-0 bg-black/50 z-40 flex items-end">
          <div className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 space-y-4">
            <div className="w-10 h-1 bg-[#E5E3DC] rounded-full mx-auto mb-2" />

            <div className="flex items-center gap-2 mb-1">
              <Unlock size={18} color="#EE7623" />
              <h3 className="font-display font-bold text-lg text-[#1A1A1A]">Verificar acceso</h3>
            </div>

            {/* Marca */}
            <div>
              <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">
                Marca(s) con las que trabajas
              </label>
              <div className="flex items-center gap-2 bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 focus-within:border-[#EE7623] transition-colors">
                <Building2 size={16} color="#C8C8C8" className="shrink-0" />
                <input
                  type="text"
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  placeholder="Ej: Alicorp, Gloria, Nestlé…"
                  className="flex-1 outline-none text-[#1A1A1A] text-sm bg-transparent"
                  autoFocus
                />
                {marca.trim() && <CheckCircle size={16} color="#2E7D52" className="shrink-0" />}
              </div>
            </div>

            {/* Evidencia */}
            <div>
              <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">
                Foto de evidencia <span className="text-[#C33C32]">*</span>
                <span className="normal-case text-[#9A9A9A] ml-1">(credencial, contrato o carnet)</span>
              </label>
              {fotoStatus === null && (
                <button
                  onClick={handleFoto}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E3DC] rounded-2xl py-4 text-sm text-[#9A9A9A] font-medium active:bg-[#F7F6F2] bg-white"
                >
                  <Camera size={18} /> Tomar foto del documento
                </button>
              )}
              {fotoStatus === 'loading' && (
                <div className="flex items-center justify-center gap-2 py-4 border-2 border-[#E5E3DC] rounded-2xl text-[#9A9A9A] text-sm bg-white">
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Fotografiando documento…
                </div>
              )}
              {fotoStatus === 'done' && (
                <div className="flex items-center justify-between border-2 border-[#2E7D52] rounded-2xl py-3 px-4" style={{ backgroundColor: '#E8F5EE' }}>
                  <div className="flex items-center gap-2">
                    <Camera size={16} color="#2E7D52" />
                    <span className="text-sm font-medium text-[#2E7D52]">✓ Documento fotografiado</span>
                  </div>
                  <button onClick={() => setFotoStatus(null)} className="text-xs text-[#9A9A9A]">Cambiar</button>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              <Button
                label="Guardar y activar acceso completo"
                disabled={!canComplete}
                loading={loading}
                onClick={handleComplete}
              />
              <Button label="Cancelar" variant="outlineGray" onClick={() => setShowSheet(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
