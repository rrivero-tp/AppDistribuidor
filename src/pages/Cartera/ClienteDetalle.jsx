import { useParams, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import { useApp as useAppCtx } from '../../context/AppContext';

const dateStr = (d) => d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const diffDays = (a, b = new Date()) => Math.floor((new Date(b) - new Date(a)) / 86400000);

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, showToast } = useAppCtx();
  const cliente = state.clientes.find(c => c.id === id);

  if (!cliente) return (
    <div className="flex items-center justify-center h-full text-[#9A9A9A]">
      Cliente no encontrado
    </div>
  );

  const { estado_credito: estado } = cliente;

  const handleTakePedido = () => navigate(`/pedidos/nuevo?clienteId=${cliente.id}`);
  const handleReferir = () => navigate(`/referir?clienteId=${cliente.id}`);
  const handleReenviarLink = () => showToast(`Link reenviado por SMS a ${cliente.nombre_dueno}`, 'success');

  const plazoProgress = (() => {
    if (!cliente.fecha_desembolso || !cliente.fecha_vencimiento) return 0;
    const total = new Date(cliente.fecha_vencimiento) - new Date(cliente.fecha_desembolso);
    const elapsed = new Date() - new Date(cliente.fecha_desembolso);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  })();

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2]">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-4 border-b border-[#E5E3DC]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-[#1A1A1A] leading-tight">{cliente.nombre_bodega}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-[#5F6B6D]">{cliente.nombre_dueno}</p>
              {cliente.telefono && (
                <a href={`tel:${cliente.telefono}`} className="flex items-center gap-1 text-xs text-[#EE7623]">
                  <Phone size={12} /> {cliente.telefono}
                </a>
              )}
            </div>
          </div>
          <Badge label={null} variant={estado} />
        </div>
        {cliente.ruc && <p className="text-xs text-[#9A9A9A] mt-1 font-mono">RUC {cliente.ruc}</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* SIN CRÉDITO */}
        {estado === 'sin_credito' && (
          <>
            <InfoBox variant="info" text="Este cliente no tiene crédito con Tienda Pago. Puedes referirlo para evaluación." />
            <Button label="Referir para crédito" onClick={handleReferir} />
            <Button label="Tomar pedido" variant="outline" onClick={handleTakePedido} />
          </>
        )}

        {/* EN EVALUACIÓN */}
        {estado === 'en_evaluacion' && (
          <>
            <InfoBox variant="info" text={`Tienda Pago está evaluando a ${cliente.nombre_dueno}. Referido hace ${diffDays(cliente.fecha_referido)} días.`} />
            <Card border>
              <div className="space-y-2">
                <Row label="Fecha de referido" value={dateStr(cliente.fecha_referido)} />
                <Row label="Resultado" value="Pendiente" />
              </div>
            </Card>
            <Button label="Tomar pedido" variant="outline" onClick={handleTakePedido} />
          </>
        )}

        {/* PREAPROBADO */}
        {estado === 'preaprobado' && (() => {
          const daysLeft = cliente.oferta_vence_at ? Math.ceil((new Date(cliente.oferta_vence_at) - new Date()) / 86400000) : 0;
          const vencida = daysLeft <= 0;
          if (vencida) return (
            <>
              <InfoBox variant="neutral" text="La oferta de crédito ha vencido. Puedes re-referir a este cliente." />
              <Button label="Re-referir" onClick={handleReferir} />
              <Button label="Tomar pedido" variant="outline" onClick={handleTakePedido} />
            </>
          );
          return (
            <>
              <InfoBox variant="warning" text={`${cliente.nombre_dueno} tiene una oferta lista. Avísale que la active desde el link que llegó por SMS.`} />
              <Card border style={{ borderColor: '#FAA21B' }}>
                <div className="space-y-2">
                  <Row label="Monto oferta" value={`S/ ${cliente.monto_oferta?.toLocaleString()}`} />
                  <Row label="Plazo" value={`${cliente.plazo_oferta_dias} días`} />
                  <Row label="Vence oferta" value={`En ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`} />
                </div>
              </Card>
              <Button label={`Reenviar link a ${cliente.nombre_dueno}`} variant="amber" onClick={handleReenviarLink} />
              <Button label="Tomar pedido" variant="outline" onClick={handleTakePedido} />
            </>
          );
        })()}

        {/* ACTIVO */}
        {estado === 'activo' && (
          <>
            <Card border style={{ borderColor: '#2E7D52' }}>
              <div className="space-y-2 mb-3">
                <Row label="Monto crédito" value={`S/ ${cliente.monto_credito?.toLocaleString()}`} bold />
                <Row label="Vencimiento" value={dateStr(cliente.fecha_vencimiento)} />
                <Row label="Días restantes" value={`${Math.max(0, Math.ceil((new Date(cliente.fecha_vencimiento) - new Date()) / 86400000))} días`} />
              </div>
              <ProgressBar value={plazoProgress} color="#2E7D52" animated />
              <p className="text-[10px] text-[#9A9A9A] mt-1">Progreso del plazo</p>
            </Card>
            <Button label="Tomar pedido" onClick={handleTakePedido} />
            <Button label="Ver historial de pedidos" variant="outline" onClick={() => navigate(`/pedidos?clienteId=${cliente.id}`)} />
          </>
        )}

        {/* MORA */}
        {estado === 'mora' && (
          <>
            <InfoBox variant="coral" text={`S/ ${cliente.monto_credito} vencidos hace ${cliente.dias_mora || diffDays(cliente.fecha_vencimiento)} días. Recuerda gestionar el cobro durante esta visita.`} />
            <Card border style={{ borderColor: '#C33C32' }}>
              <div className="space-y-2">
                <Row label="Monto vencido" value={`S/ ${cliente.monto_credito?.toLocaleString()}`} bold />
                <Row label="Días en mora" value={`${cliente.dias_mora || 0} días`} />
                <Row label="Venció el" value={dateStr(cliente.fecha_vencimiento)} />
              </div>
            </Card>
            <Button label="Tomar pedido" onClick={handleTakePedido} />
          </>
        )}

        {/* RECHAZADO */}
        {estado === 'rechazado' && (() => {
          const diasRest = cliente.dias_para_reevaluar
            ? Math.max(0, cliente.dias_para_reevaluar - diffDays(cliente.fecha_evaluacion))
            : 0;
          return (
            <>
              <InfoBox variant="neutral" text={`No calificó en esta evaluación. Podrás referirlo nuevamente en ${diasRest} día${diasRest !== 1 ? 's' : ''}.`} />
              <Card border>
                <div className="space-y-2">
                  <Row label="Fecha evaluación" value={dateStr(cliente.fecha_evaluacion)} />
                  <Row label="Días para re-evaluar" value={`${diasRest} días`} />
                </div>
              </Card>
              <Button label="Tomar pedido" onClick={handleTakePedido} />
            </>
          );
        })()}
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#9A9A9A]">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-[#1A1A1A]' : 'text-[#5F6B6D]'} font-mono`}>{value}</span>
    </div>
  );
}
