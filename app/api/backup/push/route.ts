import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data, profileName } = await request.json();
    
    if (!data || !profileName) {
      return NextResponse.json(
        { error: 'Datos o nombre de perfil faltantes' },
        { status: 400 }
      );
    }

    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${profileName}_${timestamp}.json`;

    // Subir a Vercel Blob
    const blob = await put(filename, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Error al subir el backup' },
      { status: 500 }
    );
  }
}