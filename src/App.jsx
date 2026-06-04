import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';

import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import DemoControls from './pages/Demo/DemoControls';

// Onboarding
import Welcome from './pages/Onboarding/Welcome';
import OTPStep from './pages/Onboarding/OTPStep';
import DNIStep from './pages/Onboarding/DNIStep';
import TipoStep from './pages/Onboarding/TipoStep';
import JerarquiaStep from './pages/Onboarding/JerarquiaStep';
import ActivacionStep from './pages/Onboarding/ActivacionStep';

// App pages
import CarteraPage from './pages/Cartera/CarteraPage';
import ClienteDetalle from './pages/Cartera/ClienteDetalle';
import AgregarCliente from './pages/Cartera/AgregarCliente';
import PedidosPage from './pages/Pedidos/PedidosPage';
import NuevoPedido from './pages/Pedidos/NuevoPedido';
import DetallePedido from './pages/Pedidos/DetallePedido';
import ReferirPage from './pages/Referir/ReferirPage';
import BeneficiosPage from './pages/Beneficios/BeneficiosPage';
import DetalleBeneficio from './pages/Beneficios/DetalleBeneficio';
import MisCupones from './pages/Beneficios/MisCupones';
import CreditoPage from './pages/Credito/CreditoPage';

// Top bar config per route
const TOP_BAR_CONFIG = {
  '/cartera':           { showUser: true },
  '/pedidos':           { title: 'Pedidos' },
  '/referir':           { title: 'Referir' },
  '/beneficios':        { title: 'Beneficios & Score' },
  '/credito':           { title: 'Mi Crédito' },
  '/cartera/agregar':   { title: 'Nuevo cliente', showBack: true },
  '/pedidos/nuevo':     { title: 'Nuevo pedido', showBack: true },
  '/referir/nuevo':     { title: 'Referir bodega', showBack: true },
  '/beneficios/cupones':{ title: 'Mis cupones', showBack: true },
};

function StatusBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex items-center justify-between px-5 py-2 shrink-0 bg-white" style={{ height: 28 }}>
      <span className="text-xs font-semibold text-[#1A1A1A]">{time}</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <rect x="0" y="5" width="3" height="6" rx="0.5" fill="#1A1A1A" />
          <rect x="4" y="3" width="3" height="8" rx="0.5" fill="#1A1A1A" />
          <rect x="8" y="1" width="3" height="10" rx="0.5" fill="#1A1A1A" />
          <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#C8C8C8" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2.5C10.5 2.5 12.7 3.7 14.1 5.5L15.5 4C13.7 1.9 11 0.5 8 0.5C5 0.5 2.3 1.9 0.5 4L2 5.5C3.3 3.7 5.5 2.5 8 2.5Z" fill="#1A1A1A" />
          <path d="M8 6C9.7 6 11.2 6.8 12.2 8L13.7 6.5C12.3 5 10.3 4 8 4C5.7 4 3.7 5 2.3 6.5L3.8 8C4.8 6.8 6.3 6 8 6Z" fill="#1A1A1A" />
          <circle cx="8" cy="10" r="1.5" fill="#1A1A1A" />
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-3 rounded border border-[#1A1A1A] p-0.5 flex items-center">
            <div className="h-full rounded-sm bg-[#1A1A1A]" style={{ width: '75%' }} />
          </div>
          <div className="w-0.5 h-1.5 bg-[#1A1A1A] rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}

function AppLayout({ children, topBarConfig }) {
  const { state } = useApp();
  const location = useLocation();
  const isDetail = /\/(cartera|pedidos|beneficios)\/.+/.test(location.pathname);

  const config = (() => {
    for (const [key, val] of Object.entries(TOP_BAR_CONFIG)) {
      if (location.pathname === key || location.pathname.startsWith(key + '/')) {
        const alreadySpecific = Object.keys(TOP_BAR_CONFIG).find(
          k => k !== key && location.pathname === k
        );
        if (!alreadySpecific) return val;
      }
    }
    return topBarConfig || {};
  })();

  const finalConfig = topBarConfig || config;

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      {state.isOffline && (
        <div className="bg-[#FAA21B] text-white text-xs font-medium text-center py-1.5 px-4 shrink-0 flex items-center justify-center gap-1.5">
          <span>✈️</span> Sin conexión · Guardando en local
        </div>
      )}
      <TopBar {...finalConfig} />
      <div className="flex-1 overflow-hidden relative">
        {children}
        <ToastContainer />
      </div>
      <BottomNav />
      {state.demoOpen && <DemoControls />}
    </div>
  );
}

function OnboardingLayout({ children }) {
  const { state } = useApp();
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { state } = useApp();
  const { session } = state;

  if (session === undefined) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#EE7623' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 8H5v-2h14v2zm0-4H5v-2h14v2z"/>
          </svg>
        </div>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#EE7623" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
        </svg>
      </div>
    );
  }

  if (!session || !session.onboarding_completo) {
    return (
      <OnboardingLayout>
        <Routes>
          <Route path="/onboarding/welcome"    element={<Welcome />} />
          <Route path="/onboarding/otp"        element={<OTPStep />} />
          <Route path="/onboarding/dni"        element={<DNIStep />} />
          <Route path="/onboarding/tipo"       element={<TipoStep />} />
          <Route path="/onboarding/jerarquia"  element={<JerarquiaStep />} />
          <Route path="/onboarding/activacion" element={<ActivacionStep />} />
          <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
        </Routes>
      </OnboardingLayout>
    );
  }

  return (
    <Routes>
      {/* Cartera */}
      <Route path="/cartera" element={
        <AppLayout topBarConfig={{ showUser: true }}>
          <CarteraPage />
        </AppLayout>
      } />
      <Route path="/cartera/agregar" element={
        <AppLayout topBarConfig={{ title: 'Nuevo cliente', showBack: true }}>
          <AgregarCliente />
        </AppLayout>
      } />
      <Route path="/cartera/:id" element={
        <AppLayout topBarConfig={{ title: 'Detalle', showBack: true }}>
          <ClienteDetalle />
        </AppLayout>
      } />

      {/* Pedidos */}
      <Route path="/pedidos" element={
        <AppLayout topBarConfig={{ title: 'Pedidos' }}>
          <PedidosPage />
        </AppLayout>
      } />
      <Route path="/pedidos/nuevo" element={
        <AppLayout topBarConfig={{ title: 'Nuevo pedido', showBack: true }}>
          <NuevoPedido />
        </AppLayout>
      } />
      <Route path="/pedidos/:id" element={
        <AppLayout topBarConfig={{ title: 'Pedido', showBack: true }}>
          <DetallePedido />
        </AppLayout>
      } />

      {/* Referir */}
      <Route path="/referir" element={
        <AppLayout topBarConfig={{ title: 'Referir bodega' }}>
          <ReferirPage />
        </AppLayout>
      } />

      {/* Beneficios */}
      <Route path="/beneficios" element={
        <AppLayout topBarConfig={{ title: 'Beneficios & Score' }}>
          <BeneficiosPage />
        </AppLayout>
      } />
      <Route path="/beneficios/cupones" element={
        <AppLayout topBarConfig={{ title: 'Mis cupones', showBack: true }}>
          <MisCupones />
        </AppLayout>
      } />
      <Route path="/beneficios/:id" element={
        <AppLayout topBarConfig={{ title: 'Beneficio', showBack: true }}>
          <DetalleBeneficio />
        </AppLayout>
      } />

      {/* Crédito */}
      <Route path="/credito" element={
        <AppLayout topBarConfig={{ title: 'Mi Crédito' }}>
          <CreditoPage />
        </AppLayout>
      } />

      {/* Default */}
      <Route path="*" element={<Navigate to="/cartera" replace />} />
    </Routes>
  );
}
