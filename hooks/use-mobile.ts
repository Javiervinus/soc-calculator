import * as React from "react"

const MOBILE_BREAKPOINT = 1280

export function useIsMobile() {
  // IMPORTANTE: Siempre inicializar en false para evitar hidratación
  // El valor real se establecerá después del montaje
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Actualizar inmediatamente después del montaje
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Verificar inmediatamente
    checkIsMobile()
    
    // Escuchar cambios
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)
    
    // Escuchar resize también para mayor confiabilidad
    window.addEventListener("resize", checkIsMobile)
    
    return () => {
      mql.removeEventListener("change", checkIsMobile)
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
