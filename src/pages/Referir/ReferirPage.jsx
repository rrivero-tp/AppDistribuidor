import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
import Card from '../../components/Card';
import AccesoRestringido from '../../components/AccesoRestringido';
import { hasAccesoCompleto } from '../../theme';

function Countdown({ from }) {
  const [secs, setSecs] = useState(from);
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return <span className="font-mono">{h}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s</span>;
}

export default function ReferirPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch, showToast } = useApp();
  const clienteId = searchParams.get('clienteId');

  const [fotoStatus, setFotoStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || '');

  if (!hasAccesoCompleto(state.session)) return <AccesoRestringido feature="referir" />;

  const myClientes = state.clientes.filter(c => c.preventa_id === state.session?.preventa_id);
  const cliente = myClientes.find(c => c.id === selectedClienteId);

  const yaReferido = cliente && !['sin_credito'].includes(cliente.estado_credito);
  const hasFoto = fotoStatus === 'done' || (cliente?.foto_url != null);
  const canSend = cliente && hasFoto && !yaReferido;

  const handleFoto = () => {
    setFotoStatus('loading');
    setTimeout(() => setFotoStatus('done'), 1500);
  };

  const handleEnviar = async () => {
    if (!cliente) return;
    if (!hasFoto) { showToast('Toma la foto del local primero', 'error'); return; }
    if (yaReferido) { showToast('Esta bodega ya está en evaluación', 'error'); return; }
    setLoading(true);
    const now = new Date().toISOString();
    try {
      const updatedCliente = await db.patch('clientes', cliente.id, {
        estado_credito: 'en_evaluacion',
        fecha_referido: now,
      });
      dispatch({ type: 'UPDATE_CLIENTE', payload: updatedCliente });

      const referido = await db.post('referidos', {
        preventa_id: state.session?.preventa_id,
        cliente_id: cliente.id,
        estado: 'en_evaluacion',
        bodeguero_confirmo: true,
        fecha_referido: now,
        foto_url: cliente.foto_url || `foto_${Date.now()}.jpg`,
        incentivo_estado: 'pendiente',
      });
      dispatch({ type: 'ADD_REFERIDO', payload: referido });
      setDone(true);
    } catch {
      showToast('Error al enviar el referido', 'error');
    }
    setLoading(false);
  };

  if (done) return (
    <div className="flex flex-col h-full items-center justify-center px-5 pb-10">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF0E6' }}>
        <Send size={36} color="#EE7623" />
      </div>
      <h2 className="font-display font-bold text-2xl text-[#1A1A1A] text-center">¡Referido enviado!</h2>
      <p className="text-sm text-[#9A9A9A] mt-2 text-center">
        {cliente?.nombre_dueno} recibirá un SMS para confirmar
      </p>
      <div className="mt-6 flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#E5E3DC] bg-[#F7F6F2]">
        <div className="w-2 h-2 rounded-full bg-[#FAA21B] animate-pulse shrink-0" />
        <span className="text-sm text-[#5F6B6D]">En espera · <Countdown from={48 * 3600} /></span>
      </div>
      <div className="mt-auto w-full">
        <Button label="Volver a cartera" onClick={() => navigate('/cartera')} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Cliente selector if not pre-loaded */}
        {!clienteId && (
          <div>
            <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">Bodega a referir</label>
            <select
              value={selectedClienteId}
              onChange={e => setSelectedClienteId(e.target.value)}
              className="w-full bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#EE7623]"
            >
              <option value="">Selecciona una bodega…</option>
              {myClientes.filter(c => c.estado_credito === 'sin_credito').map(c => (
                <option key={c.id} value={c.id}>{c.nombre_bodega} — {c.nombre_dueno}</option>
              ))}
            </select>
          </div>
        )}

        {cliente && (
          <>
            {/* Client card */}
            <Card border>
              <p className="font-bold text-[#1A1A1A]">{cliente.nombre_bodega}</p>
              <p className="text-sm text-[#5F6B6D] mt-0.5">{cliente.nombre_dueno}</p>
              {cliente.ruc && <p className="text-xs font-mono text-[#9A9A9A] mt-1">RUC {cliente.ruc}</p>}
            </Card>

            {/* Validation */}
            {yaReferido && (
              <InfoBox variant="danger" text="Esta bodega ya fue referida y está en evaluación o tiene crédito activo." />
            )}

            {/* Foto */}
            <div>
              <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">
                Foto del local <span className="text-[#C33C32]">*</span>
              </label>
              {cliente.foto_url || fotoStatus === 'done' ? (
                <div className="flex items-center gap-2 border-2 border-[#2E7D52] rounded-2xl py-4 px-4" style={{ backgroundColor: '#E8F5EE' }}>
                  <Camera size={16} color="#2E7D52" />
                  <p className="text-sm font-medium text-[#2E7D52]">✓ Foto del local verificada · GPS confirmado</p>
                </div>
              ) : fotoStatus === 'loading' ? (
                <div className="flex items-center justify-center gap-2 py-5 border-2 border-[#E5E3DC] rounded-2xl text-[#9A9A9A] text-sm bg-white">
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Tomando foto y verificando ubicación…
                </div>
              ) : (
                <button
                  onClick={handleFoto}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E3DC] rounded-2xl py-5 text-sm text-[#9A9A9A] font-medium active:bg-[#F7F6F2] bg-white"
                >
                  <Camera size={18} /> Tomar foto del local
                </button>
              )}
            </div>

            <InfoBox
              variant="success"
              icon={<CheckCircle size={16} />}
              text={`${cliente.nombre_dueno} recibirá un SMS para confirmar. Tiene 48h para aceptar.`}
            />
          </>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 bg-[#F7F6F2] border-t border-[#E5E3DC]">
        <Button
          label="Enviar referido"
          disabled={!canSend}
          loading={loading}
          onClick={handleEnviar}
        />
      </div>
    </div>
  );
}
