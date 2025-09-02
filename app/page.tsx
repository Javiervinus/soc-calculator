import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/server';
import { CURRENT_USER_ID, CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { HomeClient } from './home-client';

export default async function Home() {
  const queryClient = new QueryClient();
  const supabase = await getSupabase();
  const today = new Date().toISOString().split('T')[0];

  console.log('🚀 [SSR] Starting parallel prefetch on server...');
  
  // PARALELIZAR TODOS LOS PREFETCH PARA MÁXIMA PERFORMANCE
  await Promise.all([
    // 1. Voltage data
    queryClient.prefetchQuery({
      queryKey: ['voltage', CURRENT_USER_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching voltage from Supabase (server-side)...');
        const { data, error } = await supabase
          .from('user_preferences')
          .select('id, current_voltage')
          .eq('id', CURRENT_USER_ID)
          .single();

        if (error) {
          console.error('❌ [SSR] Error obteniendo voltaje:', error);
          throw error;
        }

        const voltage = data?.current_voltage || 13.2;
        console.log('✅ [SSR] Voltage prefetched on server:', voltage);
        return voltage;
      },
    }),

    // 2. Battery profile data
    queryClient.prefetchQuery({
      queryKey: ['battery-profile', CURRENT_BATTERY_PROFILE_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching battery profile from Supabase (server-side)...');
        
        // 1. Obtener el perfil de batería directamente con su ID
        const { data: profile, error: profileError } = await supabase
          .from('battery_profiles')
          .select('*')
          .eq('id', CURRENT_BATTERY_PROFILE_ID)
          .single();

        if (profileError) {
          console.error('❌ [SSR] Error obteniendo perfil:', profileError);
          throw profileError;
        }

        // 2. Obtener los puntos de la tabla SOC si existe
        let voltageSOCPoints: any[] = [];
        
        if (profile.voltage_soc_table_id) {
          const { data: points, error: pointsError } = await supabase
            .from('voltage_soc_points')
            .select('*')
            .eq('table_id', profile.voltage_soc_table_id)
            .order('voltage', { ascending: false });

          if (pointsError) {
            console.error('❌ [SSR] Error obteniendo puntos SOC:', pointsError);
          } else if (points) {
            voltageSOCPoints = points;
          }
        }

        console.log('✅ [SSR] Battery profile prefetched on server');
        return {
          profile,
          voltageSOCPoints,
        };
      },
    }),

    // 3. Daily SOC data
    queryClient.prefetchQuery({
      queryKey: ['daily-soc', CURRENT_BATTERY_PROFILE_ID, today],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching daily SOC from Supabase (server-side)...');
        const { data, error } = await supabase
          .from('daily_soc_records')
          .select('*')
          .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
          .eq('date', today)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('❌ [SSR] Error obteniendo SOC de hoy:', error);
          throw error;
        }
        
        console.log('✅ [SSR] Daily SOC prefetched on server:', data ? data.soc : 'No data for today');
        return data;
      },
    }),

    // 4. SOC history
    queryClient.prefetchQuery({
      queryKey: ['daily-soc-history', CURRENT_BATTERY_PROFILE_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching SOC history from Supabase (server-side)...');
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const fromDate = ninetyDaysAgo.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('daily_soc_records')
          .select('*')
          .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
          .gte('date', fromDate)
          .order('date', { ascending: false });
        
        if (error) {
          console.error('❌ [SSR] Error obteniendo historial SOC:', error);
          throw error;
        }
        
        console.log('✅ [SSR] SOC history prefetched on server:', data?.length || 0, 'records');
        return data || [];
      },
    }),

    // 5. Consumption segments
    queryClient.prefetchQuery({
      queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching consumption segments from Supabase (server-side)...');
        const { data: segments, error } = await supabase
          .from('consumption_segments')
          .select('*')
          .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ [SSR] Error prefetching segments:', error);
          throw error;
        }

        console.log('✅ [SSR] Consumption segments prefetched on server:', segments?.length || 0, 'segments');
        return segments || [];
      },
    }),

    // 6. Solar configuration
    queryClient.prefetchQuery({
      queryKey: ['solar-config', CURRENT_BATTERY_PROFILE_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching solar config from Supabase (server-side)...');
        const { data, error } = await supabase
          .from('solar_system_config')
          .select('*')
          .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [SSR] Error obteniendo configuración solar:', error);
          throw error;
        }

        console.log('✅ [SSR] Solar config prefetched on server');
        return data;
      },
    }),

    // 7. User preferences (themes)
    queryClient.prefetchQuery({
      queryKey: ['user-preferences', CURRENT_USER_ID],
      queryFn: async () => {
        console.log('🔄 [SSR] Fetching user preferences from Supabase (server-side)...');
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('id', CURRENT_USER_ID)
          .single();

        if (error) {
          console.error('❌ [SSR] Error obteniendo preferencias:', error);
          throw error;
        }

        console.log('✅ [SSR] User preferences prefetched on server');
        return data;
      },
    }),
  ]);

  console.log('🎯 [SSR] All data prefetched IN PARALLEL, sending to client with HydrationBoundary');
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}
