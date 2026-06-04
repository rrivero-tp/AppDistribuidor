import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { db } from '../db';

const AppContext = createContext(null);

const initialState = {
  session: undefined, // undefined = loading, null = not found
  clientes: [],
  pedidos: [],
  referidos: [],
  beneficios: [],
  cupones: [],
  creditoPreventa: [],
  marcas: [],
  bodegas_sunat: [],
  isOffline: !navigator.onLine,
  toasts: [],
  demoOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'UPDATE_SESSION':
      return { ...state, session: { ...state.session, ...action.payload } };
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload };
    case 'ADD_PEDIDO':
      return { ...state, pedidos: [...state.pedidos, action.payload] };
    case 'UPDATE_PEDIDO':
      return { ...state, pedidos: state.pedidos.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case 'DELETE_PEDIDO':
      return { ...state, pedidos: state.pedidos.filter(p => p.id !== action.payload) };
    case 'SET_REFERIDOS':
      return { ...state, referidos: action.payload };
    case 'ADD_REFERIDO':
      return { ...state, referidos: [...state.referidos, action.payload] };
    case 'SET_BENEFICIOS':
      return { ...state, beneficios: action.payload };
    case 'SET_CUPONES':
      return { ...state, cupones: action.payload };
    case 'UPDATE_CUPON':
      return { ...state, cupones: state.cupones.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'SET_CREDITO_PREVENTA':
      return { ...state, creditoPreventa: action.payload };
    case 'ADD_CREDITO_PREVENTA':
      return { ...state, creditoPreventa: [...state.creditoPreventa, action.payload] };
    case 'UPDATE_CREDITO_PREVENTA':
      return { ...state, creditoPreventa: state.creditoPreventa.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'SET_MARCAS':
      return { ...state, marcas: action.payload };
    case 'SET_BODEGAS_SUNAT':
      return { ...state, bodegas_sunat: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'ADD_TOAST': {
      return { ...state, toasts: [...state.toasts, action.payload] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'TOGGLE_DEMO':
      return { ...state, demoOpen: !state.demoOpen };
    case 'CLOSE_DEMO':
      return { ...state, demoOpen: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    try {
      const [session, clientes, pedidos, referidos, beneficios, cupones, creditoPreventa, marcas, bodegas_sunat] =
        await Promise.all([
          db.get('session'),
          db.get('clientes'),
          db.get('pedidos'),
          db.get('referidos'),
          db.get('beneficios'),
          db.get('cupones'),
          db.get('credito_preventa'),
          db.get('marcas'),
          db.get('bodegas_sunat'),
        ]);
      dispatch({ type: 'SET_SESSION', payload: session });
      dispatch({ type: 'SET_CLIENTES', payload: clientes || [] });
      dispatch({ type: 'SET_PEDIDOS', payload: pedidos || [] });
      dispatch({ type: 'SET_REFERIDOS', payload: referidos || [] });
      dispatch({ type: 'SET_BENEFICIOS', payload: beneficios || [] });
      dispatch({ type: 'SET_CUPONES', payload: cupones || [] });
      dispatch({ type: 'SET_CREDITO_PREVENTA', payload: creditoPreventa || [] });
      dispatch({ type: 'SET_MARCAS', payload: marcas || [] });
      dispatch({ type: 'SET_BODEGAS_SUNAT', payload: bodegas_sunat || [] });
    } catch (e) {
      console.error('Error loading data:', e);
      dispatch({ type: 'SET_SESSION', payload: null });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });
    const handleOnline = async () => {
      dispatch({ type: 'SET_OFFLINE', payload: false });
      const pending = JSON.parse(localStorage.getItem('pending_pedidos') || '[]');
      for (const pedido of pending) {
        try { await db.post('pedidos', pedido); } catch {}
      }
      if (pending.length > 0) {
        localStorage.removeItem('pending_pedidos');
        loadData();
      }
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [loadData]);

  const showToast = useCallback((message, variant = 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, variant } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000);
  }, []);

  const refreshData = useCallback(() => loadData(), [loadData]);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
