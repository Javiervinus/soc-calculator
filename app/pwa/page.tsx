import { PWASettings } from '@/components/pwa-settings';
import { Card } from '@/components/ui/card';

export default function PWAPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Configuración PWA</h1>
        <p className="text-muted-foreground">
          Gestiona las funciones de la aplicación instalable
        </p>
      </div>

      <Card className="p-6">
        <PWASettings />
      </Card>
    </div>
  );
}