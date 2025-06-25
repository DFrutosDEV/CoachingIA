# Sistema de Migraciones

Este proyecto incluye un sistema completo de migraciones que maneja tanto la creación de modelos/colecciones como la ejecución de scripts de migración específicos.

## Comandos Disponibles

### `npm run migrate`
Ejecuta el proceso completo de migración:
1. **Migración de Modelos**: Crea/actualiza colecciones e índices basados en los modelos en `src/models/`
2. **Migraciones Específicas**: Ejecuta scripts de migración en la carpeta `migrate/`

### `npm run migrate:rollback`
Revierte la última migración ejecutada.

## Estructura de Archivos

```
├── src/models/           # Modelos de Mongoose
│   ├── User.ts
│   ├── Role.ts
│   └── Logs.ts
├── migrate/              # Scripts de migración específicos
│   ├── 1-migrate-roles-20250623.ts
│   ├── 1-migrate-users-20250623.ts
│   └── 2-migrate-profile-20250623.ts
├── scripts/
│   ├── migrate.ts        # Script principal de migración
│   └── rollback.ts       # Script de rollback
└── tsconfig.migrate.json # Configuración TypeScript para migraciones
```

## Cómo Funciona

### 1. Migración de Modelos
- El orden lo marca el primer numero del nombre del archivo
- Lee todos los archivos `.ts` y `.js` en `src/models/`
- Crea las colecciones correspondientes si no existen
- Sincroniza los índices definidos en los esquemas

### 2. Migraciones Específicas
- Lee todos los archivos que empiecen con `migrate-` en la carpeta `migrate/`
- Verifica en la colección `Logs` si ya fueron ejecutadas
- Ejecuta solo las migraciones pendientes
- Registra cada migración ejecutada en `Logs`

### 3. Control de Ejecución
- Cada migración se ejecuta solo una vez
- Se registra en la colección `Logs` con:
  - `fileName`: Nombre del archivo de migración
  - `date`: Fecha y hora de ejecución

## Crear una Nueva Migración

1. **Crear el archivo** en la carpeta `migrate/` con el formato:
   ```
   migrate-[descripcion]-YYYYMMDD.ts
   ```

2. **Estructura del archivo**:
   ```typescript
   import mongoose from 'mongoose';
   import Model from '../src/models/Model';

   export const migrateName = 'migrate-descripcion-YYYYMMDD';

   export async function up(): Promise<void> {
     // Lógica para aplicar la migración
   }

   export async function down(): Promise<void> {
     // Lógica para revertir la migración
   }
   ```

## Migraciones Incluidas

### `migrate-roles-20250608.ts`
Crea los roles básicos del sistema:
- **Admin** (código: 1)
- **Coach** (código: 2) 
- **Coachee** (código: 3)
- **Enterprise** (código: 4)

### `migrate-users-20250608.ts`
Crea un usuario de prueba:
- **Nombre**: Prueba Usuario
- **Email**: prueba@ej.com
- **Contraseña**: admin
- **Rol**: Admin

## Variables de Entorno

Asegúrate de tener configurada la variable `MONGODB_URI` en tu archivo `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/tu-base-de-datos
```

## Ejemplos de Uso

### Ejecutar migraciones
```bash
npm run migrate
```

### Revertir última migración
```bash
npm run migrate:rollback
```

## Características

- ✅ **Idempotente**: Las migraciones se ejecutan solo una vez
- ✅ **Ordenado**: Las migraciones se ejecutan en orden alfabético
- ✅ **Rollback**: Posibilidad de revertir migraciones
- ✅ **Logging**: Registro completo de todas las operaciones
- ✅ **Colores**: Salida colorizada para mejor legibilidad
- ✅ **TypeScript**: Soporte completo para TypeScript
- ✅ **Manejo de Errores**: Gestión robusta de errores

## Notas Importantes

1. **Orden de Ejecución**: Las migraciones se ejecutan en orden alfabético, por eso es importante usar fechas en el formato YYYYMMDD
2. **Función `down`**: Siempre implementa la función `down` para poder revertir cambios
3. **Backup**: Siempre haz backup de tu base de datos antes de ejecutar migraciones en producción
4. **Testing**: Prueba las migraciones en un entorno de desarrollo antes de aplicarlas en producción 