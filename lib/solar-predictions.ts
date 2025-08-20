// Sistema de predicciones solares con caché inteligente
import { getTodayEcuadorDateString } from './timezone-utils';

// Configuración base del sitio (coordenadas de Guayaquil)
export const SITE_CONFIG = {
  coords: { lat: -2.129189, lon: -79.913596 },
  timezone: 'America/Guayaquil',
  tzOffsetHours: -5,
} as const;

// Parámetros ajustables para simulación
export interface PredictionParams {
  // Pérdidas del sistema (ajustables por el usuario)
  etaElec: number;    // Eficiencia eléctrica (cables, mismatch) [0.85-0.95]
  etaSoil: number;    // Factor de suciedad [0.90-0.97]
  etaCtrl: number;    // Eficiencia del controlador MPPT [0.70-0.90]
  etaAOI: number;     // Pérdidas por ángulo de incidencia [0.90-0.97]
  
  // Geometría y sombras
  svf: number;        // Sky View Factor (fracción de cielo visible) [0.50-0.80]
  midStart: number;   // Hora inicio sol directo [8-10]
  midEnd: number;     // Hora fin sol directo [13-15]
  
  // Configuración del sistema (tomado del store)
  nPanels: number;
  pPanelSTC_W: number;
}

// Valores por defecto para parámetros ajustables
export const DEFAULT_PREDICTION_PARAMS: Omit<PredictionParams, 'nPanels' | 'pPanelSTC_W'> = {
  etaElec: 0.90,
  etaSoil: 0.94,
  etaCtrl: 0.85,
  etaAOI: 0.93,
  svf: 0.65,
  midStart: 9,
  midEnd: 14,
};

// Resultado de una predicción
export interface PredictionResult {
  date: string;
  ahEstimated: number;        // Amperios-hora estimados (resultado principal)
  whEstimated: number;        // Watts-hora estimados
  pshEffective: number;       // Peak Sun Hours efectivas
  pshDirect: number;          // PSH componente directa
  pshDiffuse: number;         // PSH componente difusa
  daylightHours: number;      // Horas de luz del día
  cloudCoverMedian: number;   // Mediana de nubosidad al mediodía (%)
  dataQuality: {
    isValid: boolean;        // Si los datos son confiables
    validFraction: number;   // Fracción de horas válidas
    source: 'archive' | 'forecast';
  };
}

// Entrada de caché para predicciones
export interface PredictionCacheEntry {
  date: string;
  paramsHash: string;
  timestamp: number;
  result: PredictionResult;
  ttl: number; // Time to live en horas
}

// Caché de predicciones con TTL variable según distancia temporal
export class PredictionCache {
  private cache: Map<string, PredictionCacheEntry> = new Map();
  
  private getCacheKey(date: string, paramsHash: string): string {
    return `${date}:${paramsHash}`;
  }
  
  private calculateTTL(date: string): number {
    const today = getTodayEcuadorDateString();
    const targetDate = new Date(date + 'T12:00:00-05:00');
    const todayDate = new Date(today + 'T12:00:00-05:00');
    const daysDiff = Math.floor((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 24;     // Pasado: 24 horas
    if (daysDiff === 0) return 2;    // Hoy: 2 horas
    if (daysDiff <= 3) return 6;     // 1-3 días: 6 horas
    return 12;                       // 4-7 días: 12 horas
  }
  
  private hashParams(params: PredictionParams): string {
    const relevant = {
      etaElec: params.etaElec.toFixed(2),
      etaSoil: params.etaSoil.toFixed(2),
      etaCtrl: params.etaCtrl.toFixed(2),
      etaAOI: params.etaAOI.toFixed(2),
      svf: params.svf.toFixed(2),
      midStart: params.midStart,
      midEnd: params.midEnd,
      nPanels: params.nPanels,
      pPanelSTC_W: params.pPanelSTC_W,
    };
    return JSON.stringify(relevant);
  }
  
  get(date: string, params: PredictionParams): PredictionResult | null {
    const paramsHash = this.hashParams(params);
    const key = this.getCacheKey(date, paramsHash);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const age = (now - entry.timestamp) / (1000 * 60 * 60); // edad en horas
    
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }
  
  set(date: string, params: PredictionParams, result: PredictionResult): void {
    const paramsHash = this.hashParams(params);
    const key = this.getCacheKey(date, paramsHash);
    const ttl = this.calculateTTL(date);
    
    this.cache.set(key, {
      date,
      paramsHash,
      timestamp: Date.now(),
      result,
      ttl,
    });
    
    // Limitar tamaño del caché a 50 entradas
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
  }
  
  invalidate(date?: string): void {
    if (date) {
      // Invalidar todas las entradas de una fecha específica
      for (const [key] of this.cache) {
        if (key.startsWith(date + ':')) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpiar todo el caché
      this.cache.clear();
    }
  }
  
  // Serialización para persistencia en localStorage
  toJSON(): string {
    return JSON.stringify(Array.from(this.cache.entries()));
  }
  
  fromJSON(json: string): void {
    try {
      const entries = JSON.parse(json);
      this.cache = new Map(entries);
    } catch {
      this.cache.clear();
    }
  }
}

// Utilidades matemáticas
const clip = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const RAD = Math.PI / 180;

// Funciones de geometría solar
function dayOfYear(isoDate: string): number {
  const d = new Date(isoDate + 'T12:00:00Z');
  const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.floor((d.getTime() - y0.getTime()) / 86400000) + 1;
}

function solarParams(n: number, localHour: number) {
  const g = 2 * Math.PI / 365 * (n - 1 + (localHour - 12) / 24);
  const E = 229.18 * (0.000075 + 0.001868*Math.cos(g) - 0.032077*Math.sin(g)
    - 0.014615*Math.cos(2*g) - 0.040849*Math.sin(2*g));
  const d = 0.006918 - 0.399912*Math.cos(g) + 0.070257*Math.sin(g)
    - 0.006758*Math.cos(2*g) + 0.000907*Math.sin(2*g)
    - 0.002697*Math.cos(3*g) + 0.00148*Math.sin(3*g);
  const E0 = 1.00011 + 0.034221*Math.cos(g) + 0.00128*Math.sin(g)
    + 0.000719*Math.cos(2*g) + 0.000077*Math.sin(2*g);
  return { E, delta: d, E0 };
}

function solarHourAngle(localHour: number, tzOffsetHours: number, lonDeg: number, E_min: number) {
  const Lstm = 15 * tzOffsetHours;
  const timeOffsetMin = E_min + 4 * (lonDeg - Lstm);
  const LST = localHour + timeOffsetMin / 60;
  return (LST - 12) * 15 * RAD;
}

function extraterrestrialHorizontal(n: number, hourLocal: number, latDeg: number, lonDeg: number, tzOffsetHours: number) {
  const { E: E_min, delta, E0 } = solarParams(n, hourLocal);
  const phi = latDeg * RAD;
  const omega = solarHourAngle(hourLocal, tzOffsetHours, lonDeg, E_min);
  const cosZ = Math.sin(phi)*Math.sin(delta) + Math.cos(phi)*Math.cos(delta)*Math.cos(omega);
  if (cosZ <= 0) return { I0h: 0, cosZ: 0 };
  const Gsc = 1367;
  const I0n = Gsc * E0;
  return { I0h: I0n * cosZ, cosZ };
}

function clearSkyHaurwitz(cosZ: number): number {
  return 1098 * cosZ * Math.exp(-0.059 / Math.max(1e-6, cosZ));
}

function erbsDiffuseFraction(kt: number): number {
  const lo = 0.20, hi = 0.85;
  if (kt <= 0.22) return clip(1 - 0.09*kt, lo, hi);
  if (kt <= 0.80) {
    const F = 0.9511 - 0.1604*kt + 4.388*kt*kt - 16.638*Math.pow(kt,3) + 12.336*Math.pow(kt,4);
    return clip(F, lo, hi);
  }
  return clip(0.165, lo, hi);
}

// API de Open-Meteo
interface OpenMeteoHourlyData {
  time: string;
  shortwave_radiation: number;
  cloud_cover: number;
  temperature_2m: number;
}

async function fetchOpenMeteo(
  lat: number, 
  lon: number, 
  date: string, 
  timezone: string
): Promise<OpenMeteoHourlyData[]> {
  const today = getTodayEcuadorDateString();
  const isHistorical = date < today;
  
  const endpoint = isHistorical
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';
  
  const url = `${endpoint}?` + new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'shortwave_radiation,cloud_cover,temperature_2m',
    timezone: timezone,
    start_date: date,
    end_date: date,
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  
  const data = await response.json();
  const hourly = data.hourly;
  
  if (!hourly || !hourly.time) {
    throw new Error('Invalid response from Open-Meteo');
  }
  
  return hourly.time.map((time: string, i: number) => ({
    time,
    shortwave_radiation: hourly.shortwave_radiation[i] ?? 0,
    cloud_cover: hourly.cloud_cover[i] ?? 0,
    temperature_2m: hourly.temperature_2m[i] ?? 25,
  }));
}

// Cálculo principal de predicción
export async function calculateSolarPrediction(
  date: string,
  params: PredictionParams
): Promise<PredictionResult> {
  const { coords, tzOffsetHours } = SITE_CONFIG;
  const n = dayOfYear(date);
  const P0_W = params.nPanels * params.pPanelSTC_W * 0.9; // 0.9 es etaPanels fijo
  
  // Obtener datos de Open-Meteo
  const hourlyData = await fetchOpenMeteo(coords.lat, coords.lon, date, SITE_CONFIG.timezone);
  
  // Variables de validación
  const daylight: typeof hourlyData = [];
  const midday: typeof hourlyData = [];
  
  // Filtrar horas con luz solar
  for (const row of hourlyData) {
    const hour = parseInt(row.time.slice(11, 13));
    const { I0h, cosZ } = extraterrestrialHorizontal(n, hour, coords.lat, coords.lon, tzOffsetHours);
    
    if (I0h > 0 && cosZ > 0) {
      daylight.push(row);
      if (hour >= params.midStart && hour < params.midEnd) {
        midday.push(row);
      }
    }
  }
  
  // Validación de calidad de datos
  const validHours = daylight.filter(h => h.shortwave_radiation >= 20).length;
  const validFraction = daylight.length ? validHours / daylight.length : 0;
  const dataIsValid = validFraction >= 0.30;
  
  // Cálculo de energía
  let E_Wh = 0;
  let sumGdir = 0;
  let sumGdif = 0;
  
  for (const row of daylight) {
    const hour = parseInt(row.time.slice(11, 13));
    const { I0h, cosZ } = extraterrestrialHorizontal(n, hour, coords.lat, coords.lon, tzOffsetHours);
    
    // GHI por nubes
    const GHI_cs = clearSkyHaurwitz(cosZ);
    const c = clip(row.cloud_cover / 100, 0, 1);
    const trans = clip(1 - 0.75 * Math.pow(c, 3.4), 0, 1);
    const GHI_clouds = GHI_cs * trans;
    
    // Fusión inteligente
    let GHI_used: number;
    if (!dataIsValid) {
      GHI_used = 0.30 * GHI_clouds; // Fallback conservador
    } else {
      GHI_used = Math.min(row.shortwave_radiation, GHI_clouds);
    }
    
    // ERBS: partición difusa/directa
    const kt = clip(GHI_used / Math.max(I0h, 1e-6), 0, 1.2);
    const Fd = erbsDiffuseFraction(kt);
    const GdH = Fd * GHI_used;
    const GbH = Math.max(0, GHI_used - GdH);
    
    // Geometría del sitio
    const shadeDirectMid = 0.9;
    const shadeDirectOff = 0.1;
    const Gd_eff = GdH * params.svf;
    const Gb_eff = GbH * ((hour >= params.midStart && hour < params.midEnd) ? shadeDirectMid : shadeDirectOff);
    const G_eff = Math.max(0, Gd_eff + Gb_eff);
    
    // Térmico
    const noct_C = 45;
    const gammaPmp_perC = -0.0042;
    const Tcell = row.temperature_2m + ((noct_C - 20) / 800) * G_eff;
    const eta_T = Math.max(0, 1 + gammaPmp_perC * (Tcell - 25));
    
    // Potencia con pérdidas
    const P_hour_W = P0_W * (G_eff / 1000) * 
      params.etaElec * params.etaSoil * params.etaCtrl * params.etaAOI * eta_T;
    
    E_Wh += Math.max(0, P_hour_W);
    sumGdir += Gb_eff;
    sumGdif += Gd_eff;
  }
  
  // Resultados finales
  const PSH_direct = sumGdir / 1000;
  const PSH_diffuse = sumGdif / 1000;
  const PSH_eff = PSH_direct + PSH_diffuse;
  const Ah_batt = E_Wh / 13.6; // Voltaje de referencia para conversión
  
  // Mediana de nubosidad al mediodía
  const cloudCoverMedian = midday.length > 0
    ? midday.map(h => h.cloud_cover).sort((a, b) => a - b)[Math.floor(midday.length / 2)]
    : 0;
  
  const today = getTodayEcuadorDateString();
  const source = date < today ? 'archive' : 'forecast';
  
  return {
    date,
    ahEstimated: Math.round(Ah_batt * 10) / 10,
    whEstimated: Math.round(E_Wh),
    pshEffective: Math.round(PSH_eff * 100) / 100,
    pshDirect: Math.round(PSH_direct * 100) / 100,
    pshDiffuse: Math.round(PSH_diffuse * 100) / 100,
    daylightHours: daylight.length,
    cloudCoverMedian: Math.round(cloudCoverMedian),
    dataQuality: {
      isValid: dataIsValid,
      validFraction: Math.round(validFraction * 100) / 100,
      source,
    },
  };
}

// Función para obtener múltiples predicciones
export async function getMultiplePredictions(
  dates: string[],
  params: PredictionParams,
  cache: PredictionCache,
  onProgress?: (completed: number, total: number) => void
): Promise<PredictionResult[]> {
  const results: PredictionResult[] = [];
  let completed = 0;
  
  for (const date of dates) {
    // Verificar caché primero
    let result = cache.get(date, params);
    
    if (!result) {
      // No está en caché, calcular
      try {
        result = await calculateSolarPrediction(date, params);
        cache.set(date, params, result);
      } catch (error) {
        console.error(`Error calculating prediction for ${date}:`, error);
        // Crear resultado con error
        result = {
          date,
          ahEstimated: 0,
          whEstimated: 0,
          pshEffective: 0,
          pshDirect: 0,
          pshDiffuse: 0,
          daylightHours: 0,
          cloudCoverMedian: 0,
          dataQuality: {
            isValid: false,
            validFraction: 0,
            source: 'forecast',
          },
        };
      }
    }
    
    results.push(result);
    completed++;
    onProgress?.(completed, dates.length);
  }
  
  return results;
}

// Función helper para generar fechas de los próximos N días
export function getNextNDays(n: number, includeToday: boolean = false): string[] {
  const dates: string[] = [];
  const startOffset = includeToday ? 0 : 1;
  
  for (let i = startOffset; i < startOffset + n; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    // Ajustar a zona horaria de Ecuador
    date.setHours(date.getHours() - 5);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}