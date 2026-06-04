import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, X, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import Button from '../../components/Button';

function SuccessScreen({ pedido, onBack }) {
  const [nota, setNota] = useState(pedido.nota || '');
  const { dispatch, showToast } = useApp();

  const handleSaveNota = async () => {
    if (!nota.trim()) return;
    try {
      const updated = await db.patch('pedidos', pedido.id, { nota });
      dispatch({ type: 'UPDATE_PEDIDO', payload: updated });
      showToast('Nota guardada', 'success');
    } catch {}
  };

  return (
    <div className="flex flex-col h-full px-5 pt-8 items-center">
      <div className="w-20 h-20 rounded-full border-4 border-[#EE7623] flex items-center justify-center mb-4 animate-scale-in">
        <Check size={36} color="#EE7623" />
      </div>
      <h2 className="font-display font-bold text-2xl text-[#1A1A1A] text-center">Pedido confirmado</h2>
      <p className="text-sm text-[#9A9A9A] mt-1 text-center">{pedido.nombre_bodega}</p>

      <div className="w-full mt-6 bg-[#F7F6F2] rounded-2xl p-4 space-y-1.5">
        {pedido.lineas?.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs text-[#9A9A9A] w-4 shrink-0 mt-0.5">{i + 1}.</span>
            <span className="text-sm text-[#1A1A1A]">{l}</span>
          </div>
        ))}
      </div>

      <div className="w-full mt-4">
        <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">Nota para próxima visita (opcional)</label>
        <textarea
          value={nota}
          onChange={e => setNota(e.target.value)}
          onBlur={handleSaveNota}
          placeholder="Ej: Pedir más Leche Gloria la próxima visita"
          rows={3}
          className="w-full bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#EE7623] resize-none transition-colors"
        />
      </div>

      <div className="mt-auto pb-6 pt-4 w-full">
        <Button label="Volver a cartera" onClick={onBack} />
      </div>
    </div>
  );
}

function ConfirmModal({ lineas, onConfirm, onEdit }) {
  return (
    <div className="absolute inset-0 bg-black/50 z-40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl px-5 pt-6 pb-8">
        <div className="w-10 h-1 bg-[#E5E3DC] rounded-full mx-auto mb-6" />
        <h3 className="font-display font-bold text-lg text-[#1A1A1A] mb-4">Confirmar pedido</h3>
        <div className="space-y-1.5 mb-6 max-h-48 overflow-y-auto">
          {lineas.filter(l => l.trim()).map((l, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-[#9A9A9A] w-4 mt-0.5">{i + 1}.</span>
              <span className="text-sm text-[#1A1A1A]">{l}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#5F6B6D] mb-5 text-center">¿El bodeguero confirma el pedido?</p>
        <div className="space-y-2.5">
          <Button label="Confirmar" variant="primary" style={{ backgroundColor: '#2E7D52' }} onClick={onConfirm} />
          <Button label="Editar" variant="outline" onClick={onEdit} />
        </div>
      </div>
    </div>
  );
}

export default function NuevoPedido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch, showToast } = useApp();

  const clienteId = searchParams.get('clienteId');
  const pedidoId = searchParams.get('pedidoId');
  const existingPedido = pedidoId ? state.pedidos.find(p => p.id === pedidoId) : null;

  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || existingPedido?.cliente_id || '');
  const [lineas, setLineas] = useState(existingPedido?.lineas?.map(l => l) || ['']);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedPedido, setConfirmedPedido] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showClienteSelector, setShowClienteSelector] = useState(!clienteId && !existingPedido?.cliente_id);

  const myClientes = state.clientes.filter(c => c.preventa_id === state.session?.preventa_id);
  const selectedCliente = myClientes.find(c => c.id === selectedClienteId);

  const addLinea = () => {
    if (lineas.length >= 20) return;
    setLineas([...lineas, '']);
  };

  const removeLinea = (i) => setLineas(lineas.filter((_, idx) => idx !== i));

  const updateLinea = (i, val) => {
    const next = [...lineas];
    next[i] = val;
    setLineas(next);
  };

  const validLineas = lineas.filter(l => l.trim());

  const handleSaveDraft = async () => {
    if (!selectedClienteId) { showToast('Selecciona una bodega primero', 'error'); return; }
    setSavingDraft(true);
    const data = {
      preventa_id: state.session?.preventa_id,
      cliente_id: selectedClienteId,
      nombre_bodega: selectedCliente?.nombre_bodega || '',
      estado: 'borrador',
      lineas: validLineas,
      nota: existingPedido?.nota || null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (existingPedido) {
        const updated = await db.patch('pedidos', existingPedido.id, data);
        dispatch({ type: 'UPDATE_PEDIDO', payload: updated });
      } else {
        const created = await db.post('pedidos', { ...data, created_at: new Date().toISOString() });
        dispatch({ type: 'ADD_PEDIDO', payload: created });
      }
      showToast('Borrador guardado', 'success');
      navigate('/pedidos');
    } catch {
      showToast('Error al guardar', 'error');
    }
    setSavingDraft(false);
  };

  const handleConfirm = async () => {
    if (validLineas.length === 0) { showToast('Agrega al menos un producto', 'error'); return; }
    if (!selectedClienteId) { showToast('Selecciona una bodega primero', 'error'); return; }
    setLoading(true);
    setShowModal(false);
    const data = {
      preventa_id: state.session?.preventa_id,
      cliente_id: selectedClienteId,
      nombre_bodega: selectedCliente?.nombre_bodega || '',
      estado: 'confirmado',
      lineas: validLineas,
      nota: null,
      created_at: existingPedido?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      let result;
      if (existingPedido) {
        result = await db.patch('pedidos', existingPedido.id, data);
        dispatch({ type: 'UPDATE_PEDIDO', payload: result });
      } else {
        result = await db.post('pedidos', data);
        dispatch({ type: 'ADD_PEDIDO', payload: result });
      }
      setConfirmedPedido(result);
    } catch {
      showToast('Error al confirmar', 'error');
    }
    setLoading(false);
  };

  if (confirmedPedido) {
    return <SuccessScreen pedido={confirmedPedido} onBack={() => navigate('/cartera')} />;
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Bodega selector */}
      {showClienteSelector && (
        <div className="px-4 py-3 bg-[#F7F6F2] border-b border-[#E5E3DC] shrink-0">
          <label className="text-xs text-[#9A9A9A] font-medium mb-1.5 block">Seleccionar bodega</label>
          <div className="relative">
            <select
              value={selectedClienteId}
              onChange={e => { setSelectedClienteId(e.target.value); setShowClienteSelector(false); }}
              className="w-full bg-white border-2 border-[#E5E3DC] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] outline-none appearance-none focus:border-[#EE7623]"
            >
              <option value="">Elige una bodega…</option>
              {myClientes.map(c => <option key={c.id} value={c.id}>{c.nombre_bodega}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] pointer-events-none" />
          </div>
        </div>
      )}

      {selectedCliente && !showClienteSelector && (
        <div className="px-4 py-2.5 bg-[#F7F6F2] border-b border-[#E5E3DC] shrink-0 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">{selectedCliente.nombre_bodega}</p>
            <p className="text-xs text-[#9A9A9A]">Borrador</p>
          </div>
          <button onClick={() => setShowClienteSelector(true)} className="text-xs text-[#EE7623] font-medium">Cambiar</button>
        </div>
      )}

      {/* Lines */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <p className="text-xs text-[#9A9A9A] mb-3">Una fila por producto · texto libre</p>
        {lineas.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-[#C8C8C8] w-5 text-right shrink-0">#{i + 1}</span>
            <input
              type="text"
              value={l}
              onChange={e => updateLinea(i, e.target.value)}
              placeholder={`Producto ${i + 1}…`}
              className="flex-1 bg-white border-2 border-[#E5E3DC] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#EE7623] transition-colors"
            />
            <button onClick={() => removeLinea(i)} className="w-8 h-8 flex items-center justify-center text-[#F0483E] active:bg-[#FEF0EF] rounded-lg shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
        {lineas.length < 20 && (
          <button
            onClick={addLinea}
            className="flex items-center gap-2 text-sm font-medium text-[#EE7623] border-2 border-dashed border-[#EE7623] rounded-xl w-full py-2.5 px-4 mt-1 justify-center active:bg-[#FFF5E6] transition-colors"
          >
            <Plus size={16} /> Agregar fila
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-6 pt-3 space-y-2.5 bg-white border-t border-[#E5E3DC] shrink-0">
        <Button
          label="Confirmar con bodeguero"
          disabled={validLineas.length === 0}
          loading={loading}
          onClick={() => {
            if (validLineas.length === 0) { showToast('Agrega al menos un producto', 'error'); return; }
            if (!selectedClienteId) { showToast('Selecciona una bodega primero', 'error'); return; }
            setShowModal(true);
          }}
        />
        <Button label="Guardar como borrador" variant="outlineGray" loading={savingDraft} onClick={handleSaveDraft} />
      </div>

      {showModal && (
        <ConfirmModal
          lineas={validLineas}
          onConfirm={handleConfirm}
          onEdit={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
