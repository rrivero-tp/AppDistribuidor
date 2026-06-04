import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const pedido = state.pedidos.find(p => p.id === id);

  if (!pedido) return (
    <div className="flex items-center justify-center h-full text-[#9A9A9A] text-sm">Pedido no encontrado</div>
  );

  const dateStr = (d) => d ? new Date(d).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Header info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-display font-bold text-[#1A1A1A]">{pedido.nombre_bodega}</p>
            <Badge
              label={pedido.estado === 'borrador' ? 'Borrador' : 'Confirmado'}
              variant={pedido.estado === 'borrador' ? 'por_vencer' : 'activo'}
            />
          </div>
          <p className="text-xs text-[#9A9A9A]">Actualizado: {dateStr(pedido.updated_at)}</p>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-3">Productos</p>
          <div className="space-y-2">
            {pedido.lineas?.map((l, i) => (
              <div key={i} className="flex gap-2 items-start py-1 border-b border-[#F7F6F2] last:border-0">
                <span className="text-xs text-[#C8C8C8] w-5 shrink-0 mt-0.5">{i + 1}.</span>
                <span className="text-sm text-[#1A1A1A]">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {pedido.nota && (
          <div className="bg-[#FFF9E6] rounded-2xl p-4 border border-[#FAA21B]/30">
            <p className="text-xs font-medium text-[#7A5010] mb-1">Nota para próxima visita</p>
            <p className="text-sm text-[#1A1A1A]">{pedido.nota}</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-3">
        <Button label="Volver" variant="outlineGray" onClick={() => navigate(-1)} />
      </div>
    </div>
  );
}
