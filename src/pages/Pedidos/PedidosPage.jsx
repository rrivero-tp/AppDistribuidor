import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/Badge';

const TABS = ['Todos', 'Borradores', 'Confirmados'];

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

export default function PedidosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useApp();
  const [tab, setTab] = useState('Todos');

  const clienteId = searchParams.get('clienteId');
  let pedidos = state.pedidos.filter(p => p.preventa_id === state.session?.preventa_id);
  if (clienteId) pedidos = pedidos.filter(p => p.cliente_id === clienteId);
  if (tab === 'Borradores') pedidos = pedidos.filter(p => p.estado === 'borrador');
  if (tab === 'Confirmados') pedidos = pedidos.filter(p => p.estado === 'confirmado');

  const sorted = [...pedidos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E3DC] px-4 pt-1 flex gap-1 shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-t-lg"
            style={{ color: tab === t ? '#EE7623' : '#9A9A9A', borderBottom: tab === t ? '2px solid #EE7623' : '2px solid transparent' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-[#F7F6F2]">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
              <ClipboardList size={28} color="#C8C8C8" />
            </div>
            <p className="font-medium text-[#1A1A1A] mb-1">Sin pedidos</p>
            <p className="text-sm text-[#9A9A9A]">Toca el botón + para crear un pedido</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {sorted.map(p => (
              <button
                key={p.id}
                onClick={() => p.estado === 'borrador' ? navigate(`/pedidos/nuevo?pedidoId=${p.id}`) : navigate(`/pedidos/${p.id}`)}
                className="w-full bg-white rounded-2xl px-4 py-3.5 text-left shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A1A] text-sm truncate">{p.nombre_bodega}</p>
                    <p className="text-xs text-[#9A9A9A] mt-0.5">{p.lineas?.length || 0} producto{p.lineas?.length !== 1 ? 's' : ''} · {formatRelative(p.updated_at)}</p>
                  </div>
                  <Badge
                    label={p.estado === 'borrador' ? 'Borrador' : 'Confirmado'}
                    variant={p.estado === 'borrador' ? 'por_vencer' : 'activo'}
                  />
                </div>
                {p.lineas?.length > 0 && (
                  <p className="text-xs text-[#5F6B6D] mt-2 truncate">{p.lineas[0]}{p.lineas.length > 1 ? ` +${p.lineas.length - 1} más` : ''}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/pedidos/nuevo')}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
        style={{ backgroundColor: '#EE7623' }}
      >
        <Plus size={24} color="white" />
      </button>
    </div>
  );
}
