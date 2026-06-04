export const colors = {
  primary:       '#EE7623',
  primaryDk:     '#C85A0A',
  danger:        '#C33C32',
  dangerLt:      '#F0483E',
  warning:       '#FAA21B',
  yellow:        '#FDDA00',
  slate:         '#5F6B6D',
  slateLight:    '#C8C8C8',
  white:         '#FFFFFF',
  offwhite:      '#F7F6F2',
  border:        '#E5E3DC',
  success:       '#2E7D52',
  successLt:     '#E8F5EE',
  info:          '#1A6FA8',
  infoLt:        '#E3F0FA',
  textPrimary:   '#1A1A1A',
  textSecondary: '#5F6B6D',
  textTertiary:  '#9A9A9A',
};

export const badgeConfig = {
  mora:          { bg: '#FEF0EF', color: '#C33C32', label: 'En mora' },
  por_vencer:    { bg: '#FFF5E6', color: '#EE7623', label: 'Vence pronto' },
  preaprobado:   { bg: '#FFF9E6', color: '#FAA21B', label: '⭐ Preaprobada' },
  activo:        { bg: '#E8F5EE', color: '#2E7D52', label: 'Al día' },
  en_evaluacion: { bg: '#E3F0FA', color: '#1A6FA8', label: 'En evaluación' },
  sin_credito:   { bg: '#F2F2F2', color: '#5F6B6D', label: 'Sin crédito' },
  rechazado:     { bg: '#F2F2F2', color: '#9A9A9A', label: 'No calificó' },
  success:       { bg: '#E8F5EE', color: '#2E7D52', label: 'Éxito' },
  warning:       { bg: '#FFF9E6', color: '#FAA21B', label: 'Atención' },
  info:          { bg: '#E3F0FA', color: '#1A6FA8', label: 'Info' },
  danger:        { bg: '#FEF0EF', color: '#C33C32', label: 'Error' },
};

// Acceso completo: aliados siempre; libres solo si verificaron marca + evidencia
export const hasAccesoCompleto = (session) => {
  if (!session) return false;
  if (session.tipo === 'aliado') return true;
  return session.acceso_completo === true;
};

export const getBanda = (score) => {
  if (score >= 70) return { name: 'verde', color: '#2E7D52', cuponesMax: 3, label: 'Banda Verde' };
  if (score >= 40) return { name: 'ambar', color: '#FAA21B', cuponesMax: 1, label: 'Banda Ámbar' };
  return { name: 'rojo', color: '#C33C32', cuponesMax: 0, label: 'Banda Roja' };
};
