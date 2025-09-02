-- Cambiar el tipo de calculated_soc de integer a decimal(5,2) para permitir decimales
-- Esto permite valores de SOC con hasta 2 decimales (ej: 85.47%)

ALTER TABLE voltage_readings
ALTER COLUMN calculated_soc TYPE DECIMAL(5,2);

-- Agregar comentario para documentar el cambio
COMMENT ON COLUMN voltage_readings.calculated_soc IS 'SOC calculado basado en el voltaje al momento de la lectura (permite hasta 2 decimales)';