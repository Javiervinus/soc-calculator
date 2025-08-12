import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

const ECUADOR_TIMEZONE = 'America/Guayaquil';

/**
 * Obtiene la fecha/hora actual en la zona horaria de Ecuador
 */
export function getGuayaquilTime(): Date {
  return toZonedTime(new Date(), ECUADOR_TIMEZONE);
}

/**
 * Convierte una fecha a la zona horaria de Ecuador
 */
export function toEcuadorTime(date: Date): Date {
  return toZonedTime(date, ECUADOR_TIMEZONE);
}

/**
 * Convierte una fecha de Ecuador a UTC
 */
export function fromEcuadorTime(date: Date): Date {
  return fromZonedTime(date, ECUADOR_TIMEZONE);
}

/**
 * Formatea una fecha en formato de hora de Ecuador (HH:mm)
 */
export function formatGuayaquilTime(date: Date): string {
  return formatInTimeZone(date, ECUADOR_TIMEZONE, 'HH:mm', { locale: es });
}

/**
 * Formatea una fecha completa en formato de Ecuador
 */
export function formatGuayaquilDateTime(date: Date): string {
  return formatInTimeZone(date, ECUADOR_TIMEZONE, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en zona horaria de Ecuador
 */
export function getTodayEcuadorDateString(): string {
  const ecuadorNow = getGuayaquilTime();
  return formatInTimeZone(ecuadorNow, ECUADOR_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Formatea una fecha en formato YYYY-MM-DD en zona horaria de Ecuador
 */
export function formatEcuadorDateString(date: Date): string {
  return formatInTimeZone(date, ECUADOR_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Crea una fecha en zona horaria de Ecuador a partir de componentes
 */
export function createEcuadorDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  // Crear la fecha como si fuera en Ecuador
  const ecuadorDate = new Date(year, month, day, hour, minute, 0, 0);
  // Convertir de Ecuador a UTC para almacenamiento
  return fromEcuadorTime(ecuadorDate);
}