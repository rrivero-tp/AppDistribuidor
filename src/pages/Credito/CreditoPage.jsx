import { useState } from 'react';
import { CreditCard, TrendingUp, Check, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import ScoreRing from '../../components/ScoreRing';
import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import AccesoRestringido from '../../components/AccesoRestringido';
import { hasAccesoCompleto } from '../../theme';
import { getBanda } from '../../theme';

const SCORE_COMPONENTS = [
  { label: 'Pedidos completados', pts: 30 },
  { label: 'Referidos exitosos', pts: 25 },
  { label: 'Asistencia a capacitaciones', pts: 20 },
  { label: 'Pagos puntuales', pts: 15 },
  { label: 'Antigüedad en Tienda Pago', pts: 10 },
];

const MEJORAS = [
  { label: 'Completa 5 pedidos esta semana', puntos: '+10 pts' },
  { label: 'Refiere 2 bodegas nuevas', puntos: '+15 pts' },
  { label: 'Asiste a la próxima capacitación', puntos: '+8 pts' },
];

function OfertaModal({ oferta, onAccept, onReject }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="absolute inset-0 bg-black/50 z-40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl px-5 pt-6 pb-8">
        <div className="w-10 h-1 bg-[#E5E3DC] rounded-full mx-auto mb-5" />
        <h3 className="font-display font-bold text-lg text-[#1A1A1A] mb-4">Términos del crédito</h3>
        <div className="bg-[#F7F6F2] rounded-xl p-3 space-y-2 mb-4 text-sm text-[#5F6B6D]">
          <p>• El monto de S/ {oferta.monto} será depositado en tu cuenta registrada en Tienda Pago.</p>
          <p>• El plazo de pago es de {oferta.plazo_dias} días desde la fecha de desembolso.</p>
          <p>• El interés total aplicado es de S/ {((oferta.monto * oferta.tasa) / 100).toFixed(2)}.</p>
          <p>• En caso de mora, tu Trust Score se verá afectado.</p>
        </div>
        <label className="flex items-start gap-3 mb-5 cursor-pointer">
          <div
            onClick={() => setAccepted(!accepted)}
            className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
            style={{ borderColor: accepted ? '#2E7D52' : '#C8C8C8', backgroundColor: accepted ? '#2E7D52' : 'white' }}
          >
            {accepted && <Check size={12} color="white" strokeWidth={3} />}
          </div>
          <span className="text-sm text-[#5F6B6D]">He leído y acepto los términos del crédito</span>
        </label>
        <div className="space-y-2.5">
          <Button label="Confirmar y firmar" disabled={!accepted} onClick={onAccept}
            style={{ backgroundColor: '#2E7D52' }} />
          <Button label="Rechazar oferta" variant="outlineGray" onClick={onReject} />
        </div>
      </div>
    </div>
  );
}

export default function CreditoPage() {
  const { state, dispatch, showToast } = useApp();
  const { session, creditoPreventa } = state;

  if (!hasAccesoCompleto(session)) return <AccesoRestringido feature="credito" />;

  const score = session?.trust_score || 0;
  const banda = getBanda(score);

  const [showOferta, setShowOferta] = useState(false);
  const [loading, setLoading] = useState(false);

  const credito = creditoPreventa.find(c => c.preventa_id === session?.preventa_id && c.estado === 'activo');
  const tieneOferta = score >= 40;

  const oferta = { monto: 800, plazo_dias: 30, tasa: 8 };

  const plazoProgress = credito ? (() => {
    const total = new Date(credito.fecha_vencimiento) - new Date(credito.fecha_desembolso);
    const elapsed = new Date() - new Date(credito.fecha_desembolso);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  })() : 0;

  const handleAcceptOffer = async () => {
    setLoading(true);
    setShowOferta(false);
    try {
      const now = new Date();
      const fechaVenc = new Date(now.getTime() + oferta.plazo_dias * 86400000);
      const nuevo = await db.post('credito_preventa', {
        preventa_id: session.preventa_id,
        monto: oferta.monto,
        plazo_dias: oferta.plazo_dias,
        tasa: oferta.tasa,
        estado: 'activo',
        fecha_desembolso: now.toISOString(),
        fecha_vencimiento: fechaVenc.toISOString(),
      });
      dispatch({ type: 'ADD_CREDITO_PREVENTA', payload: nuevo });
      showToast('¡Crédito activado exitosamente!', 'success');
    } catch {
      showToast('Error al procesar el crédito', 'error');
    }
    setLoading(false);
  };

  if (credito) {
    const diasRest = Math.max(0, Math.ceil((new Date(credito.fecha_vencimiento) - new Date()) / 86400000));
    const enMora = credito.estado === 'mora' || diasRest <= 0;

    return (
      <div className="flex flex-col h-full bg-[#F7F6F2] overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          <Card border style={{ borderColor: enMora ? '#C33C32' : '#2E7D52' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-[#9A9A9A]">Tu crédito activo</p>
                <p className="font-display font-bold text-2xl text-[#1A1A1A] mt-1">S/ {credito.monto?.toLocaleString()}</p>
              </div>
              <Badge label={enMora ? 'En mora' : 'Al día'} variant={enMora ? 'mora' : 'activo'} />
            </div>
            <ProgressBar value={plazoProgress} color={enMora ? '#C33C32' : '#2E7D52'} animated />
            <div className="flex justify-between mt-1.5 text-xs text-[#9A9A9A]">
              <span>Desembolso: {new Date(credito.fecha_desembolso).toLocaleDateString('es-PE')}</span>
              <span>{diasRest} días restantes</span>
            </div>
          </Card>

          {enMora && (
            <>
              <InfoBox variant="danger" text="Tu crédito está en mora. Tu Trust Score está disminuyendo cada día. Contacta a Tienda Pago para regularizar tu situación." />
              <Button
                label="Contactar a Tienda Pago"
                variant="danger"
                onClick={() => window.location.href = 'tel:+5116000000'}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2] overflow-y-auto relative">
      <div className="px-4 py-4 space-y-4">
        {/* Score */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <ScoreRing score={score} size={100} />
          <div className="flex-1">
            <p className="text-xs text-[#9A9A9A] mb-1">Tu Trust Score</p>
            <div className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2"
              style={{ backgroundColor: `${banda.color}20`, color: banda.color }}>
              {banda.label}
            </div>
          </div>
        </div>

        {/* Score components */}
        <Card border>
          <p className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-3">Composición del score</p>
          <div className="space-y-3">
            {SCORE_COMPONENTS.map(({ label, pts }) => {
              const val = Math.round((score / 100) * pts);
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#5F6B6D]">{label}</span>
                    <span className="font-mono text-[#1A1A1A]">{val}/{pts}</span>
                  </div>
                  <ProgressBar value={(val / pts) * 100} color={banda.color} height={4} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Offer or improve */}
        {tieneOferta ? (
          <div className="bg-[#EE7623] rounded-2xl p-4 text-white">
            <p className="font-bold text-sm mb-1">¡Tienes una oferta disponible!</p>
            <p className="text-xs opacity-80 mb-3">Basada en tu historial y score actual</p>
            <div className="bg-white/20 rounded-xl p-3 mb-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Monto</span>
                <span className="font-bold">S/ {oferta.monto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Plazo</span>
                <span className="font-bold">{oferta.plazo_dias} días</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Interés total</span>
                <span className="font-bold">S/ {((oferta.monto * oferta.tasa) / 100).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowOferta(true)}
              className="w-full bg-white text-[#EE7623] font-bold py-3 rounded-xl text-sm active:bg-[#F7F6F2] transition-colors"
            >
              Aceptar y firmar
            </button>
          </div>
        ) : (
          <Card border>
            <p className="text-sm font-medium text-[#1A1A1A] mb-3">Mejora tu score para acceder</p>
            <div className="space-y-2.5">
              {MEJORAS.map(({ label, puntos }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EE7623] shrink-0" />
                    <span className="text-sm text-[#5F6B6D]">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#2E7D52] font-mono shrink-0">{puntos}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {showOferta && (
        <OfertaModal
          oferta={oferta}
          onAccept={handleAcceptOffer}
          onReject={() => { setShowOferta(false); showToast('Oferta rechazada', 'info'); }}
        />
      )}
    </div>
  );
}
