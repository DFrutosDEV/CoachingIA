# Tipos Centralizados

Este archivo contiene todas las interfaces y tipos utilizados en la aplicación CoachingIA. Al centralizar los tipos, evitamos duplicación y mantenemos consistencia en toda la aplicación.

## Estructura

### Tipos Base para Sesiones

- `NextSession`: Información de la próxima sesión
- `UpcomingSession`: Sesiones programadas
- `Note`: Notas del coach sobre el cliente

### Tipos para Objetivos y Metas

- `Goal`: Meta individual con estado de completado
- `GoalWithProgress`: Meta con información de progreso
- `Objective`: Objetivo principal que contiene múltiples metas
- `ObjectiveProgress`: Progreso de un objetivo

### Tipos para Clientes

- `Client`: Información completa del cliente
- `ClientBasicData`: Datos básicos del cliente para el dashboard

### Tipos para Usuarios y Perfiles

- `User`: Usuario del sistema
- `Profile`: Perfil de usuario
- `Enterprise`: Empresa
- `Coach`: Información del coach

### Tipos para Props de Componentes

- `ClientDetailProps`: Props para el componente ClientDetail
- `GoalProgress`: Progreso de una meta
- `ClientGoal`: Meta del cliente

## Uso

Para usar estos tipos en cualquier archivo:

```typescript
import { Client, Goal, User } from '@/types';
```

## Mantenimiento

Cuando necesites agregar nuevos tipos:

1. Agrega la interfaz al archivo `src/types/index.ts`
2. Documenta el propósito de la interfaz
3. Actualiza este README si es necesario
4. Reemplaza las interfaces duplicadas en otros archivos con imports

## Beneficios

- **Consistencia**: Todos los componentes usan las mismas definiciones
- **Mantenibilidad**: Cambios en un solo lugar
- **Reutilización**: Fácil importar en cualquier archivo
- **Type Safety**: Mejor detección de errores en tiempo de compilación
