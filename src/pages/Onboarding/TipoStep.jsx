import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, User, CheckCircle, XCircle, AlertCircle, Camera, Lock, Unlock } from 'lucide-react';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

export default function TipoStep({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: appState } = useApp();
  const [tipo, setTipo] = useState(null);

  // Aliado fields
  const [codigo, setCodigo] = useState('');
  const [marcaInfo, setMarcaInfo] = useState(null);

  // Libre fields (opcionales)
  const [marcaLibre, setMarcaLibre] = useState('');
  const [evidenciaStatus, setEvidenciaStatus] = useState(null); // null | 'loading' | 'done'

  const handleCodigoChange = (val) => {
    setCodigo(val.toUpperCase());
    const marc = appState.marcas.find(m => m.codigo === val.toUpperCase());
    if (marc) setMarcaInfo({ valid: true, ...marc });
    else if (val.length >= 10) setMarcaInfo({ valid: false });
    else setMarcaInfo(null);
  };

  const handleEvidencia = () => {
    setEvidenciaStatus('loading');
    setTimeout(() => setEvidenciaStatus('done'), 1500);
  };

  const canContinue = tipo === 'libre' || (tipo === 'aliado' && marcaInfo?.valid);

  // Para libre: acceso completo solo si tiene marca + evidencia
  const libreAccesoCompleto = tipo === 'libre' && marcaLibre.trim() && evidenciaStatus === 'done';
  const libreAccesoParcial  = tipo === 'libre' && (marcaLibre.trim() || evidenciaStatus === 'done') && !libreAccesoCompleto;

  const handleNext = () => {
    const data = {
      ...location.state,
      tipo,
      marcaInfo,
      marcaLibre: marcaLibre.trim() || null,
      evidenciaFoto: evidenciaStatus === 'done' ? `evidencia_${Date.now()}.jpg` : null,
    };
    if (tipo === 'aliado') navigate('/onboarding/jerarquia', { state: data });
    else if (onNext) onNext(data);
    else navigate('/onboarding/activacion', { state: data });
  };

  return (
    <div className="flex flex-col h-full px-5 pt-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 3 ? '#EE7623' : '#E5E3DC' }} />
          ))}
        </div>
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">¿Cómo trabajas?</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">Selecciona tu tipo de preventa</p>
      </div>

      {/* Tipo cards */}
      <div className="space-y-3 mb-4">
        {[
          { value: 'aliado', Icon: Building2, title: 'Trabajo con una Marca aliada', desc: 'Alicorp, Gloria, Bimbo y más marcas asociadas' },
          { value: 'libre',  Icon: User,      title: 'Soy preventa independiente',   desc: 'Gestiono mis clientes de forma autónoma' },
        ].map(({ value, Icon, title, desc }) => (
          <button
            key={value}
            onClick={() => setTipo(value)}
            className="w-full flex items-start gap-4 border-2 rounded-2xl p-4 text-left transition-all"
            style={{ borderColor: tipo === value ? '#EE7623' : '#E5E3DC', backgroundColor: tipo === value ? '#FFF5E6' : 'white' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: tipo === value ? '#EE7623' : '#F7F6F2' }}>
              <Icon size={20} color={tipo === value ? 'white' : '#5F6B6D'} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1A1A1A] text-sm">{title}</p>
              <p className="text-xs text-[#9A9A9A] mt-0.5">{desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${tipo === value ? 'border-[#EE7623] bg-[#EE7623]' : 'border-[#C8C8C8]'}`}>
              {tipo === value && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      {/* Aliado: código de marca */}
      {tipo === 'aliado' && (
        <div className="space-y-2 mb-4">
          <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide">Código de tu Marca</label>
          <input
            type="text"
            value={codigo}
            onChange={e => handleCodigoChange(e.target.value)}
            placeholder="Ej: MRC-ALICORP-PE"
            className="w-full border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 text-[#1A1A1A] font-mono text-sm outline-none focus:border-[#EE7623] transition-colors uppercase"
          />
          {marcaInfo?.valid && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#E8F5EE' }}>
              <CheckCircle size={14} color="#2E7D52" />
              <span className="text-xs font-medium text-[#2E7D52]">✓ {marcaInfo.nombre} · {marcaInfo.distribuidor}</span>
            </div>
          )}
          {marcaInfo && !marcaInfo.valid && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FEF0EF' }}>
              <XCircle size={14} color="#C33C32" />
              <span className="text-xs font-medium text-[#C33C32]">Código no reconocido</span>
            </div>
          )}
        </div>
      )}

      {/* Libre: campos opcionales */}
      {tipo === 'libre' && (
        <div className="space-y-3 mb-4">
          {/* Acceso info banner */}
          {!libreAccesoCompleto ? (
            <div className="rounded-xl border-2 border-dashed border-[#FAA21B] bg-[#FFF9E6] p-3.5">
              <div className="flex items-start gap-2">
                <Lock size={15} color="#FAA21B" className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#7A5010] mb-1">Acceso limitado por defecto</p>
                  <p className="text-xs text-[#7A5010] leading-relaxed">
                    Sin evidencia solo podrás <strong>tomar pedidos</strong>. Para referir clientes, acceder a beneficios y solicitar crédito, completa los campos opcionales de abajo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 px-3 py-3 rounded-xl border border-[#2E7D52]" style={{ backgroundColor: '#E8F5EE' }}>
              <Unlock size={15} color="#2E7D52" className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-[#1B5C35]">¡Acceso completo desbloqueado! Tendrás acceso a referidos, beneficios y crédito.</p>
            </div>
          )}

          {/* Campo: marca (opcional) */}
          <div>
            <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-1.5 block">
              Marca(s) con las que trabajas
              <span className="normal-case text-[#9A9A9A] ml-1">(opcional)</span>
            </label>
            <div className="flex items-center gap-2 bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 focus-within:border-[#EE7623] transition-colors">
              <Building2 size={16} color="#C8C8C8" className="shrink-0" />
              <input
                type="text"
                value={marcaLibre}
                onChange={e => setMarcaLibre(e.target.value)}
                placeholder="Ej: Alicorp, Gloria, Nestlé…"
                className="flex-1 outline-none text-[#1A1A1A] text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Campo: evidencia (opcional, pero requerida para acceso completo) */}
          <div>
            <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-1.5 block">
              Evidencia de trabajo
              <span className="normal-case text-[#9A9A9A] ml-1">(credencial, contrato o carnet · opcional)</span>
            </label>
            {evidenciaStatus === null && (
              <button
                onClick={handleEvidencia}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E3DC] rounded-2xl py-4 text-sm text-[#9A9A9A] font-medium active:bg-[#F7F6F2] bg-white transition-colors"
              >
                <Camera size={18} /> Tomar foto del documento
              </button>
            )}
            {evidenciaStatus === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-4 border-2 border-[#E5E3DC] rounded-2xl text-[#9A9A9A] text-sm bg-white">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
                Fotografiando documento…
              </div>
            )}
            {evidenciaStatus === 'done' && (
              <div className="flex items-center justify-between border-2 border-[#2E7D52] rounded-2xl py-3 px-4" style={{ backgroundColor: '#E8F5EE' }}>
                <div className="flex items-center gap-2">
                  <Camera size={16} color="#2E7D52" />
                  <span className="text-sm font-medium text-[#2E7D52]">✓ Documento fotografiado</span>
                </div>
                <button onClick={() => setEvidenciaStatus(null)} className="text-xs text-[#9A9A9A]">Cambiar</button>
              </div>
            )}
          </div>

          {/* Resumen de acceso */}
          <div className="bg-[#F7F6F2] rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-semibold text-[#5F6B6D] mb-2">Acceso según lo completado</p>
            {[
              { label: 'Tomar pedidos',        ok: true },
              { label: 'Referir clientes',      ok: libreAccesoCompleto },
              { label: 'Beneficios y cupones',  ok: libreAccesoCompleto },
              { label: 'Crédito al preventa',   ok: libreAccesoCompleto },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: ok ? '#E8F5EE' : '#F2F2F2' }}>
                  {ok
                    ? <CheckCircle size={12} color="#2E7D52" />
                    : <Lock size={9} color="#9A9A9A" />}
                </div>
                <span className="text-xs" style={{ color: ok ? '#1A1A1A' : '#9A9A9A' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pb-6 pt-4">
        <Button label="Continuar" disabled={!canContinue} onClick={handleNext} />
        {tipo === 'libre' && !libreAccesoCompleto && (
          <p className="text-center text-xs text-[#9A9A9A] mt-3">
            Puedes completar la verificación más adelante desde la app
          </p>
        )}
      </div>
    </div>
  );
}
