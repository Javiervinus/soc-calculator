'use client';

import { usePWA } from '@/lib/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Monitor, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PWASettings() {
  const {
    isSupported,
    isBadgeSupported,
    isAndroid,
    currentSOC,
    notificationsEnabled,
    notificationPermission,
    toggleNotifications,
    requestNotificationPermission,
  } = usePWA();

  // Detectar plataforma
  const getPlatform = () => {
    if (typeof window === 'undefined') return 'Desconocido';
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS';
    if (/android/.test(userAgent)) return 'Android';
    if (/mac/.test(userAgent)) return 'macOS';
    if (/windows/.test(userAgent)) return 'Windows';
    return 'Otro';
  };

  const platform = getPlatform();
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  const handleToggleNotifications = async () => {
    const success = await toggleNotifications(!notificationsEnabled);
    if (success) {
      if (!notificationsEnabled) {
        toast.success('Notificaciones activadas', {
          description: isAndroid ? 'Verás el SOC en la barra de notificaciones' : 'El badge mostrará el SOC',
        });
      } else {
        toast.success('Notificaciones desactivadas');
      }
    } else {
      toast.error('No se pudieron cambiar las notificaciones');
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      toast.success('Permisos concedidos');
    } else if (permission === 'denied') {
      toast.error('Permisos denegados', {
        description: 'Debes habilitarlos en la configuración del navegador',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Estado de la PWA</h3>
        <div className="grid gap-2">
          {/* Estado de instalación */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">App instalada</span>
            <Badge variant={isPWA ? 'default' : 'secondary'}>
              {isPWA ? 'Sí' : 'No'}
            </Badge>
          </div>

          {/* Plataforma */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Plataforma</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {platform === 'Android' && <Smartphone className="h-3 w-3" />}
              {platform === 'iOS' && <span className="text-xs">🍎</span>}
              {!['Android', 'iOS'].includes(platform) && <Monitor className="h-3 w-3" />}
              {platform}
            </Badge>
          </div>

          {/* Service Worker */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Service Worker</span>
            <Badge variant={isSupported ? 'default' : 'destructive'}>
              {isSupported ? 'Activo' : 'No disponible'}
            </Badge>
          </div>

          {/* Badge API */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Soporte de Badge</span>
            <div className="flex items-center gap-2">
              {isBadgeSupported ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Soportado
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  No soportado
                </Badge>
              )}
            </div>
          </div>

          {/* SOC actual */}
          {currentSOC !== null && currentSOC !== undefined && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">SOC en Badge</span>
              <Badge variant="outline" className="font-mono">
                {Math.round(currentSOC)}%
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Notificaciones */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notificaciones</h3>
        
        {/* Aviso para Android */}
        {isAndroid && isPWA && (
          <Card className="p-3 bg-muted/50">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Limitación de Android</p>
                <p className="mt-1">
                  La mayoría de dispositivos Android no muestran números en el ícono de la app.
                  Las notificaciones te permiten ver el SOC exacto en la barra de estado.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Aviso para iOS */}
        {platform === 'iOS' && isPWA && notificationPermission !== 'granted' && (
          <Card className="p-3 bg-muted/50">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Permisos requeridos en iOS</p>
                <p className="mt-1">
                  iOS requiere permisos de notificación para mostrar badges numéricos en el ícono.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-2">
          {/* Estado de permisos */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Permisos</span>
            <div className="flex items-center gap-2">
              {notificationPermission === 'granted' && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Concedidos
                </Badge>
              )}
              {notificationPermission === 'denied' && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Denegados
                </Badge>
              )}
              {notificationPermission === 'default' && (
                <Badge variant="secondary">No solicitados</Badge>
              )}
            </div>
          </div>

          {/* Botón para solicitar permisos */}
          {notificationPermission === 'default' && (
            <Button
              onClick={handleRequestPermission}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Solicitar permisos de notificación
            </Button>
          )}

          {/* Toggle de notificaciones (solo si tiene permisos) */}
          {notificationPermission === 'granted' && isAndroid && (
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Notificaciones activas</span>
                <span className="text-xs text-muted-foreground">
                  Muestra el SOC en la barra de notificaciones
                </span>
              </div>
              <Button
                onClick={handleToggleNotifications}
                variant={notificationsEnabled ? 'default' : 'outline'}
                size="sm"
              >
                {notificationsEnabled ? (
                  <>
                    <BellOff className="h-4 w-4 mr-1" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-1" />
                    Activar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      {!isPWA && (
        <Card className="p-3 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Para instalar la app:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>En iOS: Toca el botón compartir y "Añadir a pantalla de inicio"</li>
              <li>En Android: Menú del navegador → "Instalar app"</li>
              <li>En Desktop: Busca el ícono de instalación en la barra de direcciones</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}