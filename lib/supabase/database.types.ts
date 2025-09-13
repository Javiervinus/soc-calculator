export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: []
      }
      battery_profiles: {
        Row: {
          battery_capacity_ah: number
          battery_capacity_each: number | null
          battery_capacity_kwh: number | null
          battery_capacity_wh: number
          battery_configuration: string | null
          chemistry: string | null
          created_at: string | null
          daily_consumption_ah: number | null
          id: string
          is_active: boolean | null
          max_voltage: number
          min_voltage: number
          name: string
          nominal_voltage: number | null
          number_of_batteries: number | null
          safety_reserve_percent: number | null
          updated_at: string | null
          voltage_soc_table_id: string | null
        }
        Insert: {
          battery_capacity_ah?: number
          battery_capacity_each?: number | null
          battery_capacity_kwh?: number | null
          battery_capacity_wh?: number
          battery_configuration?: string | null
          chemistry?: string | null
          created_at?: string | null
          daily_consumption_ah?: number | null
          id?: string
          is_active?: boolean | null
          max_voltage?: number
          min_voltage?: number
          name: string
          nominal_voltage?: number | null
          number_of_batteries?: number | null
          safety_reserve_percent?: number | null
          updated_at?: string | null
          voltage_soc_table_id?: string | null
        }
        Update: {
          battery_capacity_ah?: number
          battery_capacity_each?: number | null
          battery_capacity_kwh?: number | null
          battery_capacity_wh?: number
          battery_configuration?: string | null
          chemistry?: string | null
          created_at?: string | null
          daily_consumption_ah?: number | null
          id?: string
          is_active?: boolean | null
          max_voltage?: number
          min_voltage?: number
          name?: string
          nominal_voltage?: number | null
          number_of_batteries?: number | null
          safety_reserve_percent?: number | null
          updated_at?: string | null
          voltage_soc_table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battery_profiles_voltage_soc_table_id_fkey"
            columns: ["voltage_soc_table_id"]
            isOneToOne: false
            referencedRelation: "voltage_soc_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_segments: {
        Row: {
          ah: number
          color: string | null
          created_at: string | null
          end_hour: number
          hours: number
          id: string
          is_active: boolean | null
          name: string
          period_label: string | null
          profile_id: string
          segment_id: string
          start_hour: number
          updated_at: string | null
          watts: number
          wh: number
        }
        Insert: {
          ah: number
          color?: string | null
          created_at?: string | null
          end_hour: number
          hours: number
          id?: string
          is_active?: boolean | null
          name: string
          period_label?: string | null
          profile_id: string
          segment_id: string
          start_hour: number
          updated_at?: string | null
          watts: number
          wh: number
        }
        Update: {
          ah?: number
          color?: string | null
          created_at?: string | null
          end_hour?: number
          hours?: number
          id?: string
          is_active?: boolean | null
          name?: string
          period_label?: string | null
          profile_id?: string
          segment_id?: string
          start_hour?: number
          updated_at?: string | null
          watts?: number
          wh?: number
        }
        Relationships: [
          {
            foreignKeyName: "consumption_segments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "battery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_soc_records: {
        Row: {
          created_at: string | null
          date: string
          id: string
          max_soc: number | null
          max_voltage: number | null
          min_soc: number | null
          min_voltage: number | null
          notes: string | null
          profile_id: string
          soc: number
          voltage: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          max_soc?: number | null
          max_voltage?: number | null
          min_soc?: number | null
          min_voltage?: number | null
          notes?: string | null
          profile_id: string
          soc: number
          voltage?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          max_soc?: number | null
          max_voltage?: number | null
          min_soc?: number | null
          min_voltage?: number | null
          notes?: string | null
          profile_id?: string
          soc?: number
          voltage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_soc_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "battery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          consumption_anomaly: boolean | null
          daily_summary_time: string | null
          id: string
          low_solar_prediction: boolean | null
          missing_daily_reading: boolean | null
          morning_reminder_time: string | null
          push_tokens: Json | null
          updated_at: string | null
        }
        Insert: {
          consumption_anomaly?: boolean | null
          daily_summary_time?: string | null
          id?: string
          low_solar_prediction?: boolean | null
          missing_daily_reading?: boolean | null
          morning_reminder_time?: string | null
          push_tokens?: Json | null
          updated_at?: string | null
        }
        Update: {
          consumption_anomaly?: boolean | null
          daily_summary_time?: string | null
          id?: string
          low_solar_prediction?: boolean | null
          missing_daily_reading?: boolean | null
          morning_reminder_time?: string | null
          push_tokens?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solar_predictions_cache: {
        Row: {
          cloud_cover_avg: number | null
          created_at: string | null
          effective_psh: number | null
          estimated_ah: number | null
          estimated_wh: number | null
          expires_at: string
          id: string
          latitude: number | null
          longitude: number | null
          prediction_date: string
          temperature_avg: number | null
          total_dhi_wh_m2: number | null
          total_dni_wh_m2: number | null
          total_ghi_wh_m2: number | null
          weather_data: Json
        }
        Insert: {
          cloud_cover_avg?: number | null
          created_at?: string | null
          effective_psh?: number | null
          estimated_ah?: number | null
          estimated_wh?: number | null
          expires_at: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          prediction_date: string
          temperature_avg?: number | null
          total_dhi_wh_m2?: number | null
          total_dni_wh_m2?: number | null
          total_ghi_wh_m2?: number | null
          weather_data: Json
        }
        Update: {
          cloud_cover_avg?: number | null
          created_at?: string | null
          effective_psh?: number | null
          estimated_ah?: number | null
          estimated_wh?: number | null
          expires_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          prediction_date?: string
          temperature_avg?: number | null
          total_dhi_wh_m2?: number | null
          total_dni_wh_m2?: number | null
          total_ghi_wh_m2?: number | null
          weather_data?: Json
        }
        Relationships: []
      }
      solar_system_config: {
        Row: {
          controller_capacity: number | null
          controller_type: string | null
          created_at: string | null
          id: string
          number_of_panels: number | null
          panel_configuration: string | null
          panel_current: number | null
          panel_power_each: number | null
          panel_type: string | null
          panel_voltage: number | null
          profile_id: string
          solar_power_total: number | null
          updated_at: string | null
        }
        Insert: {
          controller_capacity?: number | null
          controller_type?: string | null
          created_at?: string | null
          id?: string
          number_of_panels?: number | null
          panel_configuration?: string | null
          panel_current?: number | null
          panel_power_each?: number | null
          panel_type?: string | null
          panel_voltage?: number | null
          profile_id: string
          solar_power_total?: number | null
          updated_at?: string | null
        }
        Update: {
          controller_capacity?: number | null
          controller_type?: string | null
          created_at?: string | null
          id?: string
          number_of_panels?: number | null
          panel_configuration?: string | null
          panel_current?: number | null
          panel_power_each?: number | null
          panel_type?: string | null
          panel_voltage?: number | null
          profile_id?: string
          solar_power_total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solar_system_config_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "battery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          active_battery_profile_id: string | null
          app_theme: string | null
          created_at: string | null
          current_voltage: number | null
          id: string
          prediction_azimuth: number | null
          prediction_efficiency: number | null
          prediction_eta_aoi: number | null
          prediction_eta_ctrl: number | null
          prediction_eta_soil: number | null
          prediction_mid_end: number | null
          prediction_mid_start: number | null
          prediction_svf: number | null
          prediction_temperature_coefficient: number | null
          prediction_tilt_angle: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          active_battery_profile_id?: string | null
          app_theme?: string | null
          created_at?: string | null
          current_voltage?: number | null
          id?: string
          prediction_azimuth?: number | null
          prediction_efficiency?: number | null
          prediction_eta_aoi?: number | null
          prediction_eta_ctrl?: number | null
          prediction_eta_soil?: number | null
          prediction_mid_end?: number | null
          prediction_mid_start?: number | null
          prediction_svf?: number | null
          prediction_temperature_coefficient?: number | null
          prediction_tilt_angle?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          active_battery_profile_id?: string | null
          app_theme?: string | null
          created_at?: string | null
          current_voltage?: number | null
          id?: string
          prediction_azimuth?: number | null
          prediction_efficiency?: number | null
          prediction_eta_aoi?: number | null
          prediction_eta_ctrl?: number | null
          prediction_eta_soil?: number | null
          prediction_mid_end?: number | null
          prediction_mid_start?: number | null
          prediction_svf?: number | null
          prediction_temperature_coefficient?: number | null
          prediction_tilt_angle?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_active_battery_profile_id_fkey"
            columns: ["active_battery_profile_id"]
            isOneToOne: false
            referencedRelation: "battery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltage_readings: {
        Row: {
          calculated_soc: number | null
          created_at: string | null
          id: string
          is_manual_entry: boolean | null
          notes: string | null
          profile_id: string
          voltage: number
        }
        Insert: {
          calculated_soc?: number | null
          created_at?: string | null
          id?: string
          is_manual_entry?: boolean | null
          notes?: string | null
          profile_id: string
          voltage: number
        }
        Update: {
          calculated_soc?: number | null
          created_at?: string | null
          id?: string
          is_manual_entry?: boolean | null
          notes?: string | null
          profile_id?: string
          voltage?: number
        }
        Relationships: [
          {
            foreignKeyName: "voltage_readings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "battery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltage_soc_points: {
        Row: {
          id: string
          soc: number
          table_id: string
          voltage: number
        }
        Insert: {
          id?: string
          soc: number
          table_id: string
          voltage: number
        }
        Update: {
          id?: string
          soc?: number
          table_id?: string
          voltage?: number
        }
        Relationships: [
          {
            foreignKeyName: "voltage_soc_points_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "voltage_soc_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      voltage_soc_tables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
