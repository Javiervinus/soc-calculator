import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Listar todos los backups
    const { blobs } = await list();
    
    if (!blobs || blobs.length === 0) {
      return NextResponse.json(
        { error: 'No hay backups disponibles' },
        { status: 404 }
      );
    }

    // Filtrar solo los archivos de backup y ordenar por fecha (más reciente primero)
    const backups = blobs
      .filter(blob => blob.pathname.startsWith('backup_'))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    if (backups.length === 0) {
      return NextResponse.json(
        { error: 'No hay backups disponibles' },
        { status: 404 }
      );
    }

    // Obtener el backup más reciente
    const latestBackup = backups[0];

    // Descargar el contenido del backup
    const response = await fetch(latestBackup.url);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        filename: latestBackup.pathname,
        uploadedAt: latestBackup.uploadedAt,
        size: latestBackup.size,
        url: latestBackup.url
      }
    });
  } catch (error) {
    console.error('Error fetching from Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Error al obtener el backup' },
      { status: 500 }
    );
  }
}