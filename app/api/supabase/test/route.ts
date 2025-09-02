import { NextResponse } from 'next/server'
import { checkSupabaseConnection } from '@/lib/supabase/server'

export async function GET() {
  const result = await checkSupabaseConnection()
  
  return NextResponse.json(result)
}