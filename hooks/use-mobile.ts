import * as React from "react"

const MOBILE_BREAKPOINT = 1280

export function useIsMobile() {
  // Inicializar con valor correcto para evitar re-render inicial
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Solo actualizar si el valor inicial fue incorrecto
    const currentIsMobile = window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile(currentIsMobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
