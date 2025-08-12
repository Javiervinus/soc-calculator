// Utilidades para manejar estilos condicionales según el tema

export const getConditionalColor = (
  condition: boolean,
  appTheme: string,
  positiveColor: string = 'text-green-600',
  negativeColor: string = 'text-red-600'
) => {
  // Para tema minimalista, usar solo negro/gris
  if (appTheme === 'minimal') {
    return condition ? 'text-foreground' : 'text-muted-foreground';
  }
  
  // Para otros temas, usar colores
  return condition ? positiveColor : negativeColor;
};

export const getAlertStyles = (
  type: 'info' | 'warning' | 'error' | 'success',
  appTheme: string
) => {
  // Para tema minimalista, usar estilos neutros
  if (appTheme === 'minimal') {
    return {
      border: 'border-border',
      bg: 'bg-muted',
      text: 'text-foreground'
    };
  }
  
  // Para otros temas, usar colores según el tipo
  const styles = {
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-300'
    },
    warning: {
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-300'
    },
    error: {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-300'
    },
    success: {
      border: 'border-green-200 dark:border-green-800',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-300'
    }
  };
  
  return styles[type];
};

export const getBadgeStyles = (
  type: 'default' | 'success' | 'warning' | 'error',
  appTheme: string
) => {
  // Para tema minimalista, usar solo variantes de gris
  if (appTheme === 'minimal') {
    return 'bg-muted text-foreground border-border';
  }
  
  // Para otros temas
  const styles = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };
  
  return styles[type];
};