'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Cliente para uso en componentes del lado del cliente
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton para mantener una única instancia
let browserClient: ReturnType<typeof createClient> | undefined

export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

// Verificar conexión
export async function checkSupabaseConnection() {
  const supabase = getSupabase()
  
  try {
    const { error } = await supabase.from('user_preferences').select('count').single()
    
    // Si la tabla no existe, es normal en el primer setup
    if (error?.code === 'PGRST116') {
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