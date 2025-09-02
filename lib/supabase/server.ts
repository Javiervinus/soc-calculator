import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Cliente para uso en Server Components y API Routes
export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El set de cookies puede fallar si se llama desde un Server Component
          }
        },
      },
    }
  )
}

// Wrapper síncrono para compatibilidad
export function getSupabase() {
  return createClient();
}

// Verificar conexión desde el servidor
export async function checkSupabaseConnection() {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.from('user_preferences').select('count').single()
    
    // Si la tabla no existe, es normal en el primer setup
    if (error?.code === 'PGRST116' || error?.code === 'PGRST205') {
      console.log('✅ Supabase conectado (tablas pendientes de crear)')
      return { connected: true, tablesExist: false }
    }
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error)
      return { connected: false, error }
    }
    
    console.log('✅ Supabase conectado y tablas existen')
    return { connected: true, tablesExist: true }
  } catch (err) {
    console.error('❌ Error conectando a Supabase:', err)
    return { connected: false, error: err }
  }
}