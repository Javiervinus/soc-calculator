# SOC Calculator - LiFePO₄ Battery System

Calculadora de Estado de Carga (SOC) para sistema de batería LiFePO₄ de 12.8V con capacidad de 108 Ah (1380 Wh). Aplicación web móvil-first para monitoreo en tiempo real del estado de la batería, proyección de consumo nocturno y predicciones de generación solar.

## ✨ Características Principales

### 🔋 Monitoreo de Batería
- **Entrada de voltaje múltiple**: Manual, slider y reconocimiento de voz en español
- **Cálculo SOC preciso**: Interpolación lineal con tabla de 100+ puntos
- **Proyección nocturna**: Estimación en tiempo real del consumo hasta las 8:00 AM
- **Histórico diario**: Registro automático del SOC máximo del día

### ☀️ Predicciones Solares (NUEVO)
- **Pronóstico de generación**: Predicción de Ah y Wh para los próximos 7 días
- **Datos meteorológicos**: Integración con Open-Meteo API (gratuito)
- **Vista dual**: Análisis de día específico y vista semanal completa
- **Parámetros ajustables**: Eficiencia, ángulo, orientación y temperatura del panel
- **Métricas detalladas**: PSH efectivas, radiación directa/difusa, nubosidad

### ⚙️ Gestión Avanzada
- **Perfiles múltiples**: Soporte para diferentes configuraciones de sistema
- **Tramos de consumo editables**: Configuración personalizada del consumo nocturno
- **Sistema de backup**: Local (clipboard/compartir) y en la nube (Vercel Blob)
- **5 temas únicos**: Default, Futurista, Minimalista, Retro y Hippie (con modo claro/oscuro)

## 🛠️ Stack Técnico

- **Framework**: Next.js 15.4.6 con App Router + SSR
- **TypeScript**: Modo estricto para máxima seguridad de tipos
- **Base de datos**: Supabase (PostgreSQL) - ✅ Migración completada
- **Gestor de paquetes**: pnpm (recomendado)
- **UI**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Estado**: React Query v5 + Supabase (sin Zustand)
- **Caché**: React Query con persistencia automática en localStorage
- **Gráficos**: Recharts para visualizaciones interactivas
- **Fechas**: date-fns con soporte para zona horaria Ecuador
- **Notificaciones**: Sonner con temas personalizados
- **Cloud Storage**: Vercel Blob (backups) + Supabase (datos principales)

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Configuración
```bash
# Clonar el repositorio
git clone [repository-url]
cd soc-calculator

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase y Vercel Blob

# Ejecutar en modo desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🗄️ Base de Datos - Modelo Híbrido

### ⚠️ **IMPORTANTE: NO HAY BASE DE DATOS LOCAL**
Este proyecto usa **ÚNICAMENTE la base de datos de producción** de Supabase. NO se usa ninguna base de datos local, contenedores Docker para BD, ni ambientes de desarrollo separados.

### 🔄 **Estrategia de Desarrollo Híbrido**

#### **Cambios Estructurales Grandes → Migraciones SQL**
Para cambios que afectan múltiples tablas, relaciones o reestructuración:
```bash
# 1. Crear archivo de migración
pnpm db:migration:new descripcion_del_cambio

# 2. Editar el archivo .sql en supabase/migrations/

# 3. ⚠️ APLICAR EN PRODUCCIÓN (ten cuidado!)
pnpm db:push

# 4. Actualizar tipos TypeScript
pnpm db:types
```

#### **Cambios Pequeños → Dashboard de Supabase**
Para agregar columnas, cambios de tipos simples, etc.:
```bash
# 1. Hacer cambio en https://supabase.com/dashboard
# 2. Actualizar tipos en el código
pnpm db:types
```

### Scripts de Base de Datos - USAR SOLO ESTOS
```bash
# ✅ SEGUROS
pnpm db:types            # Generar tipos TypeScript
pnpm db:migration:new    # Crear migración (solo archivo local)
pnpm db:migration:list   # Ver migraciones existentes

# ⚠️ PELIGROSOS (ejecutan en producción)
pnpm db:push             # Aplicar migraciones pendientes
pnpm db:remote:set       # Configurar conexión remota

# 🚨 EXTREMOS
pnpm db:reset            # Reset completo (NUNCA usar)

# REGLA: Si necesitas otros comandos supabase, agrégalos al package.json
# NO ejecutes comandos supabase CLI directos
```

### Scripts de Desarrollo
```bash
pnpm dev         # Servidor de desarrollo con Turbopack
pnpm build       # Build de producción
pnpm start       # Servidor de producción
pnpm lint        # Linting con ESLint
```

## 📱 Características Móvil-First

- **Diseño responsivo**: Optimizado para móviles, tablets y desktop
- **PWA ready**: Instalable como aplicación web progresiva
- **Prevención de zoom**: Inputs con font-size: 16px para iOS
- **Navegación intuitiva**: Sidebar con navegación fácil entre páginas
- **Reconocimiento de voz**: Entrada de voltaje por voz en español

## 🎨 Sistema de Temas

La aplicación incluye 5 temas únicos, cada uno con modo claro y oscuro:

1. **Default**: Diseño profesional con fuente Geist Sans
2. **Futurista**: Estilo sci-fi con efectos neón y fuente Orbitron
3. **Minimalista**: Ultra limpio con solo grises/blancos/negros
4. **Retro**: Estilo arcade 8-bit con fuente pixelada Press Start 2P
5. **Hippie**: Estilo tropical hawaiano con elementos florales animados

## 🔧 Configuración del Sistema

### Batería LiFePO₄
- **Capacidad**: 108 Ah (1380 Wh / 1.38 kWh)
- **Configuración**: 6 baterías de 18 Ah en paralelo
- **Voltaje operativo**: 10.0V - 14.6V
- **Reserva configurable**: 0-30%

### Sistema Solar
- **Paneles**: 12 × 60W = 720W total
- **Controlador**: MPPT 30A
- **Ubicación**: Ecuador (America/Guayaquil UTC-5)

## 📊 Datos y Cálculos

### Proyección Nocturna (17:00 - 08:00)
- **Tramo A**: 17:00-19:00 → 7W (14 Wh)
- **Tramo B**: 19:00-00:00 → 88W (440 Wh) 
- **Tramo C**: 00:00-06:00 → 17W (102 Wh)
- **Tramo D**: 06:00-08:00 → 7W (14 Wh)

### Predicciones Solares
- **Fórmula**: `Ah = (PSH × Watts × Eficiencia) / Voltaje`
- **PSH efectivas**: Directa + (Difusa × 0.8)
- **Correcciones**: Temperatura, ángulo, orientación
- **Horario solar**: 06:00-18:00 Ecuador

## 🌐 Despliegue

### Vercel (Recomendado)
```bash
# Configurar proyecto en Vercel
vercel

# Variables de entorno requeridas en Vercel:
# NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
# BLOB_READ_WRITE_TOKEN=tu_token_de_vercel_blob (opcional)
```

**Nota**: Las migraciones de base de datos se ejecutan localmente con `pnpm db:push`. Vercel se conecta directamente a la base de datos remota de Supabase.

### Docker
```bash
# Build imagen
docker build -t soc-calculator .

# Ejecutar contenedor
docker run -p 3000:3000 soc-calculator
```

---

**Calculadora SOC para sistema LiFePO₄ - Desarrollado para optimizar el uso de energía solar**