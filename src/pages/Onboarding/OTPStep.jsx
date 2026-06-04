import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown } from 'lucide-react';
import Button from '../../components/Button';

const COUNTRIES = [
  { code: 'PE', flag: '🇵🇪', dial: '+51', label: 'Perú', placeholder: '987 654 321' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', label: 'México', placeholder: '55 1234 5678' },
];

export default function OTPStep({ onNext }) {
  const navigate = useNavigate();
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [showCountries, setShowCountries] = useState(false);
  const [step, setStep] = useState('phone'); // phone | otp
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
        if (onNext) onNext({ country, phone });
        else navigate('/onboarding/dni', { state: { country, phone } });
      }, 1500);
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  if (step === 'otp') return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-2">
        <div className="w-1/5 h-1.5 bg-[#EE7623] rounded-full mb-6" />
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
          {timer > 0 ? <>Reenviar en <span className="font-mono text-[#1A1A1A]">{formatTimer(timer)}</span></> : (
            <button className="text-[#EE7623] font-medium" onClick={handleSendCode}>Reenviar código</button>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full px-5 pt-6">
      <div className="mb-6">
        <div className="w-1/5 h-1.5 bg-[#EE7623] rounded-full mb-6" />
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
