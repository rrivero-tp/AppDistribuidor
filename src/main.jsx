import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <PhoneShell />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);

function PhoneShell() {
  return (
    <div className="min-h-screen bg-[#F0EDE6] flex items-start justify-center py-0 sm:py-8">
      <div
        className="relative w-full bg-white overflow-hidden flex flex-col"
        style={{
          maxWidth: 390,
          minHeight: '100dvh',
          height: '100dvh',
        }}
      >
        {/* Desktop phone frame */}
        <style>{`
          @media (min-width: 430px) {
            .phone-container {
              min-height: 844px !important;
              height: 844px !important;
              border-radius: 40px;
              box-shadow: 0 24px 80px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.08);
            }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in { animation: slide-in 0.2s ease-out; }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in { animation: scale-in 0.3s ease-out; }
        `}</style>
        <div className="phone-container relative w-full flex flex-col overflow-hidden" style={{ flex: 1 }}>
          <App />
        </div>
      </div>
    </div>
  );
}
