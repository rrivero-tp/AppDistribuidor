import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const toastVariants = {
  success: { bg: '#2E7D52', Icon: CheckCircle },
  error:   { bg: '#C33C32', Icon: XCircle },
  warning: { bg: '#FAA21B', Icon: AlertCircle },
  info:    { bg: '#1A6FA8', Icon: Info },
};

function ToastItem({ toast }) {
  const { dispatch } = useApp();
  const cfg = toastVariants[toast.variant] || toastVariants.info;
  const { Icon } = cfg;

  return (
    <div
      className="flex items-center gap-2.5 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg animate-slide-in"
      style={{ backgroundColor: cfg.bg }}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { state } = useApp();
  if (state.toasts.length === 0) return null;
  return (
    <div className="absolute top-16 left-3 right-3 z-50 flex flex-col gap-2 pointer-events-auto">
      {state.toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
