'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDebouncedMutation } from '@/lib/hooks/use-debounced-mutation';
import { useUserPreferences } from '@/lib/hooks/use-user-preferences';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeSelector() {
  const { theme, appTheme, updateTheme, updateAppTheme } = useUserPreferences();
  
  // Estados locales para UI inmediata
  const [localTheme, setLocalTheme] = useState(theme);
  const [localAppTheme, setLocalAppTheme] = useState(appTheme);
  
  // Sincronizar con datos del servidor
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);
  
  useEffect(() => {
    setLocalAppTheme(appTheme);
  }, [appTheme]);
  
  // Aplicar cambios de tema al DOM inmediatamente
  useEffect(() => {
    const root = document.documentElement;
    if (localTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [localTheme]);
  
  // Aplicar cambios de tema de app al DOM inmediatamente
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    if (localAppTheme && localAppTheme !== 'default') {
      root.setAttribute('data-theme', localAppTheme);
    }
  }, [localAppTheme]);
  
  // Crear versiones con debounce
  const debouncedUpdateTheme = useDebouncedMutation(updateTheme, 500);
  const debouncedUpdateAppTheme = useDebouncedMutation(updateAppTheme, 500);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Apariencia</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {localTheme === 'light' ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-blue-500" />
            )}
            <Label htmlFor="theme-switch">Modo Oscuro</Label>
          </div>
          <Switch
            id="theme-switch"
            checked={localTheme === 'dark'}
            onCheckedChange={(checked) => {
              const newTheme = checked ? 'dark' : 'light';
              // Actualizar UI inmediatamente
              setLocalTheme(newTheme);
              // Guardar con debounce
              debouncedUpdateTheme(newTheme);
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="app-theme">Tema de la Aplicación</Label>
          <Select 
            value={localAppTheme} 
            onValueChange={(value) => {
              // Actualizar UI inmediatamente
              setLocalAppTheme(value);
              // Guardar con debounce
              debouncedUpdateAppTheme(value);
            }}
          >
            <SelectTrigger id="app-theme">
              <SelectValue placeholder="Selecciona un tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span>Predeterminado</span>
                </div>
              </SelectItem>
              <SelectItem value="futuristic">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                  <span>Futurista</span>
                </div>
              </SelectItem>
              <SelectItem value="minimal">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-black dark:border-white" />
                  <span>Minimalista</span>
                </div>
              </SelectItem>
              <SelectItem value="retro">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-amber-600 border-2 border-amber-800" />
                  <span>Retro</span>
                </div>
              </SelectItem>
              <SelectItem value="hippie">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
                  <span>Hippie ✿</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Cambia el estilo visual de la aplicación
          </p>
        </div>
      </div>
    </div>
  );
}