import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown, User } from 'lucide-react';
import Button from '../../components/Button';

const COUNTRIES = [
  { code: 'PE', flag: '🇵🇪', dial: '+51', label: 'Perú', placeholder: '987 654 321' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', label: 'México', placeholder: '55 1234 5678' },
];

const ProgressDot = () => (
  <div className="w-1/5 h-1.5 bg-[#EE7623] rounded-full mb-6" />
);

export default function OTPStep({ onNext }) {
  const navigate = useNavigate();
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [showCountries, setShowCountries] = useState(false);
  const [step, setStep] = useState('phone'); // phone | otp | nombre
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const otpRefs = useRef([]);
  const nombreRef = useRef(null);

  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Auto-focus nombre field when reaching that step
  useEffect(() => {
    if (step === 'nombre') setTimeout(() => nombreRef.current?.focus(), 100);
  }, [step]);

  const formatTimer = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSendCode = () => {
    if (phone.replace(/\D/g, '').length < 9) return;
    setStep('otp');
    setTimer(600);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('nombre');
      }, 1500);
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleNombreContinue = () => {
    const data = { country, phone, nombre: nombre.trim(), apellido: apellido.trim() };
    if (onNext) onNext(data);
    else navigate('/onboarding/dni', { state: data });
  };

  // ── Pantalla: nombre y apellido ──────────────────────────────
  if (step === 'nombre') return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-6">
        <ProgressDot />
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">¿Cómo te llamas?</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">
          Tu nombre aparecerá en tu perfil y en los reportes
        </p>
      </div>

      <div className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-1.5 block">
            Nombre(s) <span className="text-[#C33C32]">*</span>
          </label>
          <div className="flex items-center gap-3 border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 focus-within:border-[#EE7623] transition-colors bg-white">
            <User size={17} className="text-[#C8C8C8] shrink-0" />
            <input
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Juan Carlos"
              autoCapitalize="words"
              className="flex-1 outline-none text-[#1A1A1A] text-base bg-transparent placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>

        {/* Apellido */}
        <div>
          <label className="text-xs font-medium text-[#5F6B6D] uppercase tracking-wide mb-1.5 block">
            Apellido(s) <span className="text-[#C33C32]">*</span>
          </label>
          <div className="flex items-center gap-3 border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 focus-within:border-[#EE7623] transition-colors bg-white">
            <User size={17} className="text-[#C8C8C8] shrink-0" />
            <input
              type="text"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder="Pérez García"
              autoCapitalize="words"
              onKeyDown={e => e.key === 'Enter' && nombre.trim() && apellido.trim() && handleNombreContinue()}
              className="flex-1 outline-none text-[#1A1A1A] text-base bg-transparent placeholder:text-[#C8C8C8]"
            />
          </div>
        </div>

        {/* Nota de privacidad */}
        <p className="text-xs text-[#9A9A9A] px-1">
          Estos datos solo se usan para identificarte dentro de Tienda Pago.
        </p>
      </div>

      <div className="mt-auto pb-6 pt-6">
        <Button
          label="Continuar"
          disabled={!nombre.trim() || !apellido.trim()}
          onClick={handleNombreContinue}
        />
      </div>
    </div>
  );

  // ── Pantalla: verificar OTP ──────────────────────────────────
  if (step === 'otp') return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-2">
        <ProgressDot />
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">Verifica tu número</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">
          Enviamos un código a {country.dial} {phone}
        </p>
      </div>

      <div className="flex gap-2 mt-8 justify-center">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => otpRefs.current[i] = el}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleOtpChange(e.target.value, i)}
            onKeyDown={e => handleOtpKey(e, i)}
            className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none focus:border-[#EE7623] transition-colors"
            style={{ borderColor: d ? '#EE7623' : '#E5E3DC' }}
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-6 text-[#EE7623]">
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
          </svg>
          <span className="text-sm font-medium">Verificando…</span>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-[#9A9A9A] text-sm">
          {timer > 0
            ? <>Reenviar en <span className="font-mono text-[#1A1A1A]">{formatTimer(timer)}</span></>
            : <button className="text-[#EE7623] font-medium" onClick={handleSendCode}>Reenviar código</button>
          }
        </p>
      </div>

      <div className="mt-auto pb-6">
        <button
          onClick={() => setStep('phone')}
          className="w-full text-center text-sm text-[#9A9A9A] py-2"
        >
          ← Cambiar número
        </button>
      </div>
    </div>
  );

  // ── Pantalla: ingresar teléfono ──────────────────────────────
  return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-6">
        <ProgressDot />
        <h2 className="font-display font-bold text-2xl text-[#1A1A1A]">Tu número de teléfono</h2>
        <p className="text-sm text-[#5F6B6D] mt-1">Ingresa el número que usarás en la app</p>
      </div>

      {/* Country selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setShowCountries(!showCountries)}
          className="w-full flex items-center gap-3 border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 bg-white"
        >
          <span className="text-xl">{country.flag}</span>
          <span className="font-medium text-[#1A1A1A]">{country.label}</span>
          <span className="text-[#9A9A9A] text-sm">{country.dial}</span>
          <ChevronDown size={16} className="ml-auto text-[#9A9A9A]" />
        </button>
        {showCountries && (
          <div className="absolute top-full left-0 right-0 bg-white border border-[#E5E3DC] rounded-2xl shadow-lg z-10 mt-1 overflow-hidden">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setCountry(c); setShowCountries(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F2] text-left"
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-medium text-[#1A1A1A]">{c.label}</span>
                <span className="text-[#9A9A9A] text-sm ml-auto">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone input */}
      <div className="flex items-center border-2 border-[#E5E3DC] rounded-2xl px-4 py-3 gap-3 focus-within:border-[#EE7623] transition-colors bg-white">
        <Phone size={18} className="text-[#9A9A9A] shrink-0" />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder={country.placeholder}
          onKeyDown={e => e.key === 'Enter' && phone.replace(/\D/g, '').length >= 9 && handleSendCode()}
          className="flex-1 outline-none text-[#1A1A1A] text-base font-medium placeholder:text-[#C8C8C8] bg-transparent"
        />
      </div>

      <div className="mt-auto pb-6 pt-8">
        <Button
          label="Enviar código"
          disabled={phone.replace(/\D/g, '').length < 9}
          onClick={handleSendCode}
        />
      </div>
    </div>
  );
}
