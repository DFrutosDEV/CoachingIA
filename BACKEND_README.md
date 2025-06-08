# Backend MongoDB - Guía de Uso

Este backend básico está configurado para conectarse a MongoDB usando la variable de entorno `MONGODB_URI`.

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp env.example .env.local
```

Edita `.env.local` y configura tu URI de MongoDB:

```env
MONGODB_URI=mongodb+srv://tu_usuario:tu_contraseña@tu_cluster.mongodb.net/tu_base_datos?retryWrites=true&w=majority
```

### 3. Ejecutar Migraciones

Antes de usar el backend, ejecuta las migraciones para crear las colecciones en MongoDB:

```bash
npm run migrate
```

Este comando:
- 🔍 Detecta automáticamente todos los modelos en `src/lib/models/`
- 🏗️ Crea las colecciones correspondientes en MongoDB
- 📊 Sincroniza los índices definidos en los esquemas
- 📋 Muestra un resumen detallado del proceso

### 4. Ejecutar el Servidor

```bash
npm run dev
```

## 📡 Endpoints Disponibles

### Health Check
- **GET** `/api/health`
- Verifica el estado de la conexión a la base de datos

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "database": {
    "status": "conectado",
    "connected": true,
    "host": "cluster.mongodb.net",
    "name": "tu_base_datos"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Base de datos conectada correctamente"
}
```

### Usuarios

#### Obtener todos los usuarios
- **GET** `/api/users`

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "edad": 30,
      "activo": true,
      "fechaCreacion": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Crear un nuevo usuario
- **POST** `/api/users`

**Body de ejemplo:**
```json
{
  "nombre": "María García",
  "email": "maria@ejemplo.com",
  "edad": 25
}
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "María García",
    "email": "maria@ejemplo.com",
    "edad": 25,
    "activo": true,
    "fechaCreacion": "2024-01-15T10:35:00.000Z",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Usuario creado exitosamente"
}
```

#### Obtener un usuario específico
- **GET** `/api/users/[id]`

#### Actualizar un usuario
- **PUT** `/api/users/[id]`

**Body de ejemplo:**
```json
{
  "nombre": "María García López",
  "edad": 26
}
```

#### Eliminar un usuario (soft delete)
- **DELETE** `/api/users/[id]`

## 🧪 Ejemplos de Uso con cURL

### Verificar conexión
```bash
curl http://localhost:3000/api/health
```

### Crear un usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Martínez",
    "email": "ana@ejemplo.com",
    "edad": 28
  }'
```

### Obtener todos los usuarios
```bash
curl http://localhost:3000/api/users
```

### Obtener un usuario específico
```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

### Actualizar un usuario
```bash
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "edad": 31
  }'
```

### Eliminar un usuario
```bash
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

## 📁 Estructura del Backend

```
src/
├── models/
│   └── User.ts          # Modelo de Usuario con Mongoose
├── lib/
│   └── mongodb.ts          # Configuración de conexión a MongoDB
└── app/
    └── api/
        ├── health/
        │   └── route.ts    # Health check endpoint
        └── users/
            ├── route.ts    # CRUD de usuarios (GET, POST)
            └── [id]/
                └── route.ts # Operaciones por ID (GET, PUT, DELETE)
scripts/
└── migrate.ts              # Script de migración automática
```

## 🔧 Características del Backend

- ✅ Conexión optimizada a MongoDB con cache de conexión
- ✅ Validaciones de datos con Mongoose
- ✅ Manejo de errores robusto
- ✅ Soft delete (eliminación lógica)
- ✅ Validación de ObjectIds de MongoDB
- ✅ Respuestas JSON consistentes
- ✅ Health check para monitoreo
- ✅ Índices de base de datos para mejor rendimiento
- ✅ **Migración automática de modelos** con `npm run migrate`

## 🚀 Comando de Migración

El comando `npm run migrate` es una herramienta poderosa que:

### ¿Qué hace?
- 🔍 **Detecta automáticamente** todos los archivos `.ts` y `.js` en `src/lib/models/`
- 🏗️ **Crea las colecciones** correspondientes en MongoDB si no existen
- 📊 **Sincroniza los índices** definidos en los esquemas de Mongoose
- 📋 **Muestra un resumen detallado** del proceso con colores

### Ejemplo de salida:
```bash
🚀 Iniciando migración de modelos...

📡 Conectando a MongoDB...
✅ Conectado a MongoDB exitosamente

📁 Modelos encontrados: 2
   - User.ts
   - Product.ts

🔄 Procesando modelo: User
   ✅ Colección 'users' creada exitosamente
   ✅ Índices sincronizados para 'users'

📊 Resumen de la migración:
✅ Colecciones nuevas creadas: 2
   - users
   - products

📋 Colecciones en la base de datos:
   - users
   - products

🎉 Migración completada exitosamente!
🔌 Conexión a MongoDB cerrada
```

### Cuándo usar:
- 🆕 **Primera vez** configurando el proyecto
- 📝 **Después de agregar** nuevos modelos
- 🔄 **Después de modificar** índices en los esquemas
- 🐛 **Para verificar** que todas las colecciones existen

## 🛠️ Personalización

### Agregar nuevos modelos

1. Crea un nuevo archivo en `src/lib/models/`
2. Define el esquema con Mongoose
3. Exporta el modelo

### Agregar nuevos endpoints

1. Crea una nueva carpeta en `src/app/api/`
2. Agrega un archivo `route.ts`
3. Implementa las funciones HTTP necesarias

### Configuración adicional

El archivo `src/lib/mongodb.ts` puede ser modificado para:
- Agregar opciones de conexión adicionales
- Configurar pools de conexión
- Agregar middleware de Mongoose

## 🚨 Manejo de Errores

El backend incluye manejo de errores para:
- Errores de validación de Mongoose
- IDs de MongoDB inválidos
- Usuarios duplicados
- Errores de conexión a la base de datos
- Errores internos del servidor

Todos los errores devuelven respuestas JSON consistentes con códigos de estado HTTP apropiados. 