import { useParams } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import InfoBox from '../../components/InfoBox';

export default function DetalleBeneficio() {
  const { id } = useParams();
  const { state, showToast } = useApp();
  const beneficio = state.beneficios.find(b => b.id === id);
  const [copied, setCopied] = useState(false);

  if (!beneficio) return (
    <div className="flex items-center justify-center h-full text-[#9A9A9A] text-sm">Beneficio no encontrado</div>
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(beneficio.codigo).catch(() => {});
    setCopied(true);
    showToast('Código copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const vigencia = beneficio.vigencia_hasta
    ? new Date(beneficio.vigencia_hasta).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Header card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${beneficio.color}20` }}>
            <span className="text-2xl">🎁</span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#1A1A1A]">{beneficio.nombre}</h2>
          <p className="text-sm text-[#9A9A9A] mt-1">{beneficio.aliado}</p>
          <p className="text-sm text-[#5F6B6D] mt-3 leading-relaxed">{beneficio.descripcion}</p>
        </div>

        {/* Code card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: beneficio.color }}>
          <p className="text-xs font-medium text-[#9A9A9A] uppercase tracking-wide mb-3">Código de canje</p>
          <p className="font-mono text-2xl font-bold tracking-widest text-center text-[#1A1A1A] mb-4">
            {beneficio.codigo}
          </p>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98]"
            style={{ backgroundColor: copied ? '#E8F5EE' : `${beneficio.color}15`, color: copied ? '#2E7D52' : beneficio.color }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar código'}
          </button>
        </div>

        {vigencia && (
          <InfoBox variant="warning" text={`Válido hasta el ${vigencia}. Presenta el código al momento de pagar.`} />
        )}
      </div>
    </div>
  );
}
