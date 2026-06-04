import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function MisCupones() {
  const navigate = useNavigate();
  const { state, dispatch, showToast } = useApp();
  const { session, cupones, clientes } = state;

  const myCupones = cupones.filter(c => c.preventa_id === session?.preventa_id);
  const eligiblesClientes = clientes.filter(c =>
    c.preventa_id === session?.preventa_id &&
    ['activo'].includes(c.estado_credito)
  );

  const [assigning, setAssigning] = useState(null);
  const [selectedBodega, setSelectedBodega] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async (cuponId) => {
    if (!selectedBodega) return;
    const ya = myCupones.find(c => c.asignado_a === selectedBodega && c.estado === 'asignado');
    if (ya) { showToast('Esta bodega ya tiene un cupón este ciclo', 'error'); return; }
    const bodega = clientes.find(c => c.id === selectedBodega);
    if (!bodega || !['activo'].includes(bodega.estado_credito)) {
      showToast('Solo puedes asignar cupones a clientes con crédito previo', 'error');
      return;
    }
    setLoading(true);
    try {
      const updated = await db.patch('cupones', cuponId, {
        estado: 'asignado',
        asignado_a: selectedBodega,
        nombre_bodega_asignada: bodega.nombre_bodega,
      });
      dispatch({ type: 'UPDATE_CUPON', payload: updated });
      showToast(`Cupón asignado a ${bodega.nombre_bodega}`, 'success');
      setAssigning(null);
      setSelectedBodega('');
    } catch {
      showToast('Error al asignar cupón', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2] overflow-y-auto">
      <div className="px-4 py-4 space-y-3">
        {myCupones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
              <Ticket size={28} color="#C8C8C8" />
            </div>
            <p className="font-medium text-[#1A1A1A] mb-1">Sin cupones disponibles</p>
            <p className="text-sm text-[#9A9A9A]">Mejora tu score para desbloquear cupones</p>
          </div>
        ) : (
          myCupones.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
                    <Ticket size={16} color="#EE7623" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{c.valor}% descuento</p>
                    <p className="text-xs text-[#9A9A9A]">Ciclo {c.ciclo}</p>
                  </div>
                </div>
                <Badge
                  label={c.estado === 'disponible' ? 'Disponible' : c.estado === 'asignado' ? 'Asignado' : 'Canjeado'}
                  variant={c.estado === 'disponible' ? 'activo' : c.estado === 'asignado' ? 'por_vencer' : 'sin_credito'}
                />
              </div>

              {c.estado === 'asignado' && c.nombre_bodega_asignada && (
                <p className="text-xs text-[#5F6B6D] mt-1">Asignado a: <strong>{c.nombre_bodega_asignada}</strong></p>
              )}

              {c.estado === 'disponible' && (
                assigning === c.id ? (
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <select
                        value={selectedBodega}
                        onChange={e => setSelectedBodega(e.target.value)}
                        className="w-full bg-[#F7F6F2] border-2 border-[#E5E3DC] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#EE7623] appearance-none"
                      >
                        <option value="">Selecciona una bodega…</option>
                        {eligiblesClientes.map(cl => (
                          <option key={cl.id} value={cl.id}>{cl.nombre_bodega}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] pointer-events-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button label="Asignar" loading={loading} disabled={!selectedBodega} onClick={() => handleAssign(c.id)} className="flex-1" />
                      <Button label="Cancelar" variant="outlineGray" onClick={() => { setAssigning(null); setSelectedBodega(''); }} className="flex-1" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAssigning(c.id)}
                    className="mt-3 w-full text-sm font-medium text-[#EE7623] border-2 border-[#EE7623] rounded-xl py-2 active:bg-[#FFF5E6] transition-colors"
                  >
                    Asignar a bodega
                  </button>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
