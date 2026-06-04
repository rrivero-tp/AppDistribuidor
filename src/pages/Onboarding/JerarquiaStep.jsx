import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import { useApp as useAppCtx } from '../../context/AppContext';

const CHIPS = [
  { key: 'nombre',      label: 'Marca' },
  { key: 'distribuidor', label: 'Distribuidor' },
  { key: 'regional',    label: 'Regional' },
  { key: 'zonal',       label: 'Zonal' },
  { key: 'jefatura',    label: 'Jefatura' },
  { key: 'supervisor',  label: 'Supervisor' },
  { key: 'ruta',        label: 'Ruta' },
];

export default function JerarquiaStep({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAppCtx();
  const marcaInfo = location.state?.marcaInfo;

  const handleReport = () => {
    showToast('Reporte enviado al supervisor', 'info');
  };

  const handleConfirm = () => {
    if (onNext) onNext(location.state);
    else navigate('/onboarding/activacion', { state: location.state });
  };

  return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-6">
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 4 ? '#EE7623' : '#E5E3DC' }} />
          ))}
        </div>
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">Tu jerarquía</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">Confirma la estructura de tu equipo</p>
      </div>

      <div className="bg-[#F7F6F2] rounded-2xl p-4 mb-4">
        {CHIPS.map(({ key, label }) => {
          const value = marcaInfo?.[key];
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="text-xs text-[#9A9A9A] font-medium w-24 shrink-0 pt-1.5">{label}</span>
              <span className="flex-1 bg-white rounded-xl px-3 py-1.5 text-sm font-medium text-[#1A1A1A] border border-[#E5E3DC]">
                {value}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#9A9A9A] text-center mb-4 px-4">
        Esta información fue asignada por tu marca. Si hay un error, repórtalo.
      </p>

      <div className="space-y-3 mt-auto pb-6">
        <Button label="Confirmar y continuar" onClick={handleConfirm} />
        <Button label="Reportar un error" variant="outlineGray" onClick={handleReport} />
      </div>
    </div>
  );
}
