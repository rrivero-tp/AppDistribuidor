import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, CheckCircle, Lock } from 'lucide-react';
import Button from '../../components/Button';

export default function DNIStep({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const country = location.state?.country || { code: 'PE' };

  const isPE = country.code === 'PE';
  const label = isPE ? 'Número de DNI' : 'Número de INE';
  const maxLen = isPE ? 8 : 18;
  const placeholder = isPE ? '12345678' : 'ABCD123456EFGHI789';

  const [doc, setDoc] = useState('');
  const [livenessStatus, setLivenessStatus] = useState(null); // null | 'loading' | 'done'
  const [loading, setLoading] = useState(false);

  const isDocValid = doc.length === maxLen;
  const canContinue = isDocValid && livenessStatus === 'done';

  const handleLiveness = () => {
    setLivenessStatus('loading');
    setTimeout(() => setLivenessStatus('done'), 2000);
  };

  const handleContinue = () => {
    if (onNext) onNext({ doc, country });
    else navigate('/onboarding/tipo', { state: { ...location.state, doc } });
  };

  return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-6">
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 2 ? '#EE7623' : '#E5E3DC' }} />
          ))}
        </div>
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">{label}</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">Ingresa tu documento de identidad</p>
      </div>

      {/* DNI Input */}
      <div className="mb-3">
        <input
          type="text"
          value={doc}
          onChange={e => setDoc(e.target.value.toUpperCase())}
          placeholder={placeholder}
          maxLength={maxLen}
          className="w-full border-2 border-[#E5E3DC] rounded-2xl px-4 py-3.5 text-[#1A1A1A] text-base font-mono tracking-widest outline-none focus:border-[#EE7623] transition-colors"
        />
      </div>

      {isDocValid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ backgroundColor: '#E8F5EE' }}>
          <CheckCircle size={16} color="#2E7D52" />
          <span className="text-sm font-medium" style={{ color: '#2E7D52' }}>
            {isPE ? '✓ Válido en RENIEC' : '✓ Válido en INE · primera vez en el sistema'}
          </span>
        </div>
      )}

      {/* Selfie button */}
      <div className="mt-2">
        {livenessStatus === null && (
          <button
            onClick={handleLiveness}
            disabled={!isDocValid}
            className="w-full flex items-center justify-center gap-2.5 border-2 rounded-2xl py-4 font-medium text-sm transition-all"
            style={{
              borderColor: isDocValid ? '#EE7623' : '#E5E3DC',
              color: isDocValid ? '#EE7623' : '#9A9A9A',
              backgroundColor: 'white',
            }}
          >
            <Camera size={18} />
            Tomar selfie de verificación
          </button>
        )}
        {livenessStatus === 'loading' && (
          <div className="w-full flex items-center justify-center gap-2 py-4 border-2 border-[#E5E3DC] rounded-2xl text-[#9A9A9A] text-sm">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
            Verificando identidad…
          </div>
        )}
        {livenessStatus === 'done' && (
          <div className="flex items-center gap-2.5 border-2 border-[#2E7D52] rounded-2xl py-4 px-4" style={{ backgroundColor: '#E8F5EE' }}>
            <Camera size={18} color="#2E7D52" />
            <span className="text-sm font-medium" style={{ color: '#2E7D52' }}>✓ Liveness verificado</span>
          </div>
        )}
      </div>

      <p className="flex items-center gap-2 text-xs text-[#9A9A9A] mt-3 px-1">
        <Lock size={12} />
        Tu foto no se almacena · solo se verifica en el momento
      </p>

      <div className="mt-auto pb-6 pt-8">
        <Button label="Continuar" disabled={!canContinue} loading={loading} onClick={handleContinue} />
      </div>
    </div>
  );
}
