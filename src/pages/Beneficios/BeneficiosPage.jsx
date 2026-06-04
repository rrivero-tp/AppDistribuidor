import { useNavigate } from 'react-router-dom';
import { Gift, ChevronRight, Ticket } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ScoreRing from '../../components/ScoreRing';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import AccesoRestringido from '../../components/AccesoRestringido';
import { getBanda, hasAccesoCompleto } from '../../theme';

export default function BeneficiosPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  if (!hasAccesoCompleto(state.session)) return <AccesoRestringido feature="beneficios" />;
  const { session, beneficios, cupones } = state;
  const score = session?.trust_score || 0;
  const banda = getBanda(score);

  const myCupones = cupones.filter(c => c.preventa_id === session?.preventa_id);
  const disponibles = myCupones.filter(c => c.estado === 'disponible').length;
  const asignados = myCupones.filter(c => c.estado === 'asignado').length;
  const total = banda.cuponesMax;

  return (
    <div className="flex flex-col h-full bg-[#F7F6F2] overflow-y-auto">
      {/* Score section */}
      <div className="bg-white px-4 pt-5 pb-5 border-b border-[#E5E3DC]">
        <div className="flex items-center gap-5">
          <ScoreRing score={score} size={110} />
          <div className="flex-1">
            <p className="text-xs text-[#9A9A9A] font-medium mb-1">Tu Trust Score</p>
            <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium mb-2" style={{ backgroundColor: `${banda.color}20`, color: banda.color }}>
              {banda.label}
            </div>
            <p className="text-xs text-[#5F6B6D]">
              {score >= 70 ? '3 cupones por ciclo · todos los beneficios' :
               score >= 40 ? '1 cupón por ciclo · beneficios básicos' :
               'Sin cupones · mejora tu score para desbloquear'}
            </p>
          </div>
        </div>
      </div>

      {/* Cupones card */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate('/beneficios/cupones')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF0E6' }}>
            <Ticket size={20} color="#EE7623" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm text-[#1A1A1A]">Mis cupones</p>
            <p className="text-xs text-[#9A9A9A] mt-0.5">{disponibles} disponible{disponibles !== 1 ? 's' : ''} · {asignados} asignado{asignados !== 1 ? 's' : ''}</p>
            {total > 0 && <ProgressBar value={(asignados / total) * 100} color="#EE7623" height={4} className="mt-2 max-w-32" />}
          </div>
          <ChevronRight size={18} color="#C8C8C8" />
        </button>
      </div>

      {/* Benefits list */}
      <div className="px-4 pt-4 pb-4 space-y-3">
        <p className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide">Beneficios disponibles</p>
        {beneficios.map(b => {
          const locked = b.score_minimo > score;
          return (
            <button
              key={b.id}
              onClick={() => !locked && navigate(`/beneficios/${b.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left transition-all active:scale-[0.99]"
              style={{ opacity: locked ? 0.5 : 1 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}20` }}>
                <Gift size={20} style={{ color: b.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1A1A1A] truncate">{b.nombre}</p>
                <p className="text-xs text-[#9A9A9A] truncate mt-0.5">{b.aliado}</p>
              </div>
              {locked ? (
                <div className="shrink-0">
                  <Badge label={`🔒 Score ${b.score_minimo}`} variant="sin_credito" />
                </div>
              ) : (
                <ChevronRight size={18} color="#C8C8C8" className="shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
