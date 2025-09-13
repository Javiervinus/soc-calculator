-- Add missing prediction parameters to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS prediction_eta_soil numeric DEFAULT 0.94,
ADD COLUMN IF NOT EXISTS prediction_eta_ctrl numeric DEFAULT 0.85,
ADD COLUMN IF NOT EXISTS prediction_eta_aoi numeric DEFAULT 0.93,
ADD COLUMN IF NOT EXISTS prediction_svf numeric DEFAULT 0.65,
ADD COLUMN IF NOT EXISTS prediction_mid_start integer DEFAULT 9,
ADD COLUMN IF NOT EXISTS prediction_mid_end integer DEFAULT 14;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.prediction_eta_soil IS 'Soil efficiency - dirt losses on panels (0-1)';
COMMENT ON COLUMN user_preferences.prediction_eta_ctrl IS 'MPPT controller efficiency (0-1)';
COMMENT ON COLUMN user_preferences.prediction_eta_aoi IS 'Angle of incidence efficiency (0-1)';
COMMENT ON COLUMN user_preferences.prediction_svf IS 'Sky View Factor (0-1)';
COMMENT ON COLUMN user_preferences.prediction_mid_start IS 'Direct sun start hour (6-12)';
COMMENT ON COLUMN user_preferences.prediction_mid_end IS 'Direct sun end hour (12-18)';