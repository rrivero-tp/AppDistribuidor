import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db';
import Button from '../../components/Button';

const PROPÓSITOS = ['Pedidos', 'Referir', 'Ambos'];

const BARRIOS = ['Independencia', 'Los Olivos', 'Comas', 'San Martín', 'Rimac', 'Surco', 'Villa María', 'El Agustino'];

export default function AgregarCliente() {
  const navigate = useNavigate();
  const { state, dispatch, showToast } = useApp();
  const [ruc, setRuc] = useState('');
  const [rucStatus, setRucStatus] = useState(null);
  const [form, setForm] = useState({ nombre_bodega: '', nombre_dueno: '', telefono: '' });
  const [proposito, setPropósito] = useState('Ambos');
  const [fotoStatus, setFotoStatus] = useState(null); // null | 'loading' | 'done'
  const [loading, setLoading] = useState(false);

  const needsReferir = proposito === 'Referir' || proposito === 'Ambos';

  const handleRucChange = async (val) => {
    setRuc(val);
    if (val.length === 11) {
      const found = state.bodegas_sunat.find(b => b.ruc === val);
      if (found) {
        setForm(f => ({ ...f, nombre_bodega: found.nombre }));
        setRucStatus('found');
      } else {
        const barrio = BARRIOS[Math.floor(Math.random() * BARRIOS.length)];
        setForm(f => ({ ...f, nombre_bodega: `Bodega ${barrio}` }));
        setRucStatus('generated');
      }
    } else {
      setRucStatus(null);
    }
  };

  const handleFoto = () => {
    setFotoStatus('loading');
    setTimeout(() => setFotoStatus('done'), 1500);
  };

  const canSubmit = form.nombre_bodega && form.nombre_dueno && form.telefono && ruc.length === 11
    && (!needsReferir || fotoStatus === 'done');

  const handleSubmit = async () => {
    if (needsReferir && fotoStatus !== 'done') {
      showToast('Toma la foto del local primero', 'error');
      return;
    }
    setLoading(true);
    const nuevo = {
      preventa_id: state.session?.preventa_id || 'p1',
      nombre_bodega: form.nombre_bodega,
      nombre_dueno: form.nombre_dueno,
      telefono: form.telefono,
      ruc,
      estado_credito: 'sin_credito',
      dias_mora: 0,
      foto_url: fotoStatus === 'done' ? `foto_${Date.now()}.jpg` : null,
      created_at: new Date().toISOString(),
    };
    try {
      const created = await db.post('clientes', nuevo);
      dispatch({ type: 'ADD_CLIENTE', payload: created });
      showToast('Cliente agregado a tu cartera', 'success');
      if (needsReferir) {
        navigate(`/referir?clienteId=${created.id}`);
      } else {
        navigate('/cartera');
      }
    } catch {
      showToast('Error al guardar el cliente', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* RUC */}
        <div>
          <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">RUC / RFC</label>
          <div className="flex items-center gap-2 bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 focus-within:border-[#EE7623] transition-colors">
            <Search size={16} className="text-[#9A9A9A] shrink-0" />
            <input
              type="tel"
              value={ruc}
              onChange={e => handleRucChange(e.target.value)}
              placeholder="11 dígitos"
              maxLength={11}
              className="flex-1 outline-none font-mono text-[#1A1A1A] bg-transparent"
            />
          </div>
          {rucStatus === 'found' && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#E8F5EE' }}>
              <CheckCircle size={14} color="#2E7D52" />
              <span className="text-xs font-medium text-[#2E7D52]">SUNAT ok · {state.session?.pais === 'MX' ? 'SAT' : 'RENIEC'} verificado</span>
            </div>
          )}
          {rucStatus === 'generated' && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#E8F5EE' }}>
              <CheckCircle size={14} color="#2E7D52" />
              <span className="text-xs font-medium text-[#2E7D52]">Registrado · nombre generado automáticamente</span>
            </div>
          )}
        </div>

        {/* Fields */}
        {[
          { key: 'nombre_bodega', label: 'Nombre del negocio', placeholder: 'Bodega El Sol' },
          { key: 'nombre_dueno', label: 'Nombre del dueño', placeholder: 'Juan Pérez' },
          { key: 'telefono', label: 'Teléfono', placeholder: '987 654 321', type: 'tel' },
        ].map(({ key, label, placeholder, type = 'text' }) => (
          <div key={key}>
            <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-white border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#EE7623] transition-colors"
            />
          </div>
        ))}

        {/* Propósito */}
        <div>
          <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">Propósito</label>
          <div className="flex gap-2">
            {PROPÓSITOS.map(p => (
              <button
                key={p}
                onClick={() => setPropósito(p)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all border-2"
                style={{
                  borderColor: proposito === p ? '#EE7623' : '#E5E3DC',
                  backgroundColor: proposito === p ? '#EE7623' : 'white',
                  color: proposito === p ? 'white' : '#5F6B6D',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Foto del local */}
        {needsReferir && (
          <div>
            <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-2 block">Foto del local <span className="text-[#C33C32]">*</span></label>
            {fotoStatus === null && (
              <button
                onClick={handleFoto}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E3DC] rounded-2xl py-5 text-sm text-[#9A9A9A] font-medium active:bg-[#F7F6F2] transition-colors bg-white"
              >
                <Camera size={18} /> Tomar foto del local
              </button>
            )}
            {fotoStatus === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-5 border-2 border-[#E5E3DC] rounded-2xl text-[#9A9A9A] text-sm bg-white">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
                Tomando foto…
              </div>
            )}
            {fotoStatus === 'done' && (
              <div className="flex items-center gap-2 border-2 border-[#2E7D52] rounded-2xl py-4 px-4" style={{ backgroundColor: '#E8F5EE' }}>
                <Camera size={16} color="#2E7D52" />
                <div>
                  <p className="text-sm font-medium text-[#2E7D52]">✓ Foto tomada · GPS verificado</p>
                  <p className="text-xs text-[#5F6B6D]">Ubicación confirmada</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 bg-[#F7F6F2] border-t border-[#E5E3DC]">
        <Button
          label="Agregar a mi cartera"
          disabled={!canSubmit}
          loading={loading}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
