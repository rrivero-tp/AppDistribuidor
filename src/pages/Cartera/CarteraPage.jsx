import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Clock, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/Badge';
import { badgeConfig } from '../../theme';

const ORDER = ['mora', 'por_vencer', 'preaprobado', 'activo', 'en_evaluacion', 'sin_credito', 'rechazado'];

function getDaysLabel(cliente) {
  if (cliente.estado_credito !== 'por_vencer') return null;
  if (!cliente.fecha_vencimiento) return 'Vence pronto';
  const diff = Math.ceil((new Date(cliente.fecha_vencimiento) - new Date()) / 86400000);
  if (diff <= 0) return 'Vence hoy';
  return `Vence en ${diff} día${diff !== 1 ? 's' : ''}`;
}

function ClienteRow({ cliente }) {
  const navigate = useNavigate();
  const cfg = badgeConfig[cliente.estado_credito] || badgeConfig.sin_credito;
  const initial = cliente.nombre_bodega?.charAt(0).toUpperCase() || '?';
  const label = cliente.estado_credito === 'por_vencer' ? getDaysLabel(cliente) : cfg.label;

  return (
    <button
      onClick={() => navigate(`/cartera/${cliente.id}`)}
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F7F6F2] transition-colors border-b border-[#F0EDE6] last:border-0"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: cfg.color }}
      >
        {initial}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-[#1A1A1A] text-sm truncate">{cliente.nombre_bodega}</p>
        <p className="text-xs text-[#9A9A9A] truncate">{cliente.nombre_dueno}</p>
      </div>
      <Badge label={label} variant={cliente.estado_credito} />
    </button>
  );
}

export default function CarteraPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { session, clientes } = state;

  const myClientes = clientes.filter(c => c.preventa_id === session?.preventa_id);
  const sorted = [...myClientes].sort((a, b) => ORDER.indexOf(a.estado_credito) - ORDER.indexOf(b.estado_credito));
  const totalMora = myClientes.filter(c => c.estado_credito === 'mora').length;
  const totalPorVencer = myClientes.filter(c => c.estado_credito === 'por_vencer').length;

  const stats = [
    { label: 'Total', value: myClientes.length, color: '#1A1A1A', Icon: Users },
    { label: 'Por vencer', value: totalPorVencer, color: '#EE7623', Icon: Clock },
    { label: 'En mora', value: totalMora, color: '#C33C32', Icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="px-4 pt-3 pb-4 bg-white border-b border-[#F0EDE6]">
        <div className="flex gap-2">
          {stats.map(({ label, value, color, Icon }) => (
            <div key={label} className="flex-1 bg-[#F7F6F2] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} color={color} />
                <span className="text-[10px] text-[#9A9A9A] font-medium">{label}</span>
              </div>
              <span className="font-display font-bold text-xl" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F6F2] flex items-center justify-center mb-4">
              <Users size={28} color="#C8C8C8" />
            </div>
            <p className="font-medium text-[#1A1A1A] mb-1">Sin clientes aún</p>
            <p className="text-sm text-[#9A9A9A]">Agrega tu primera bodega tocando el botón +</p>
          </div>
        ) : (
          <div>
            {sorted.map(c => <ClienteRow key={c.id} cliente={c} />)}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/cartera/agregar')}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
        style={{ backgroundColor: '#EE7623' }}
      >
        <Plus size={24} color="white" />
      </button>
    </div>
  );
}
