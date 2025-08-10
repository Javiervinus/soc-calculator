// Centralizar todos los datos de consumo en un solo lugar
export const NIGHT_CONSUMPTION_TRAMOS = [
  { 
    id: 'A',
    name: 'Tramo A', 
    period: '17:00-19:00',
    startHour: 17,
    endHour: 19,
    watts: 7, 
    hours: 2, 
    wh: 14, 
    ah: 1.1,
    color: 'bg-green-500'
  },
  { 
    id: 'B',
    name: 'Tramo B', 
    period: '19:00-00:00',
    startHour: 19,
    endHour: 24,
    watts: 88, 
    hours: 5, 
    wh: 440, 
    ah: 34.4,
    color: 'bg-orange-500'
  },
  { 
    id: 'C',
    name: 'Tramo C', 
    period: '00:00-06:00',
    startHour: 0,
    endHour: 6,
    watts: 17, 
    hours: 6, 
    wh: 102, 
    ah: 8.0,
    color: 'bg-yellow-500'
  },
  { 
    id: 'D',
    name: 'Tramo D', 
    period: '06:00-08:00',
    startHour: 6,
    endHour: 8,
    watts: 7, 
    hours: 2, 
    wh: 14, 
    ah: 1.1,
    color: 'bg-green-500'
  }
];

export const NIGHT_CONSUMPTION_TOTAL = {
  wh: NIGHT_CONSUMPTION_TRAMOS.reduce((sum, t) => sum + t.wh, 0),
  ah: Number(NIGHT_CONSUMPTION_TRAMOS.reduce((sum, t) => sum + t.ah, 0).toFixed(1)),
  minSOCRequired: 41.3, // Porcentaje mínimo de SOC requerido
  minAhRequired: 44.5  // Ah mínimos requeridos
};

// Convertir a formato para battery-calculations
export const getNightConsumptionProfile = () => {
  return NIGHT_CONSUMPTION_TRAMOS.map(tramo => ({
    startHour: tramo.startHour,
    endHour: tramo.endHour,
    watts: tramo.watts,
    label: `${tramo.period} (${tramo.name})`
  }));
};