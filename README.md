# Control de Gastos Personales

Aplicación de control de gastos personales desarrollada con Next.js 14, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Autenticación**: Registro e inicio de sesión con Supabase Auth
- **Dashboard**: Resumen de gastos con gráficas interactivas
- **Gestión de gastos**: CRUD completo con filtros y paginación
- **Gastos recurrentes**: Soporte para gastos semanales, mensuales y anuales
- **Categorías personalizables**: Con colores e iconos
- **Métodos de pago**: Configurables por usuario
- **Seguridad RLS**: Cada usuario solo ve sus propios datos
- **UI moderna**: Tema oscuro con glassmorfismo

## 📋 Requisitos

- Node.js 18 o superior
- Una cuenta en [Supabase](https://supabase.com)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
cd gastos-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. Copiar el Project URL y la anon key desde **Project Settings > API**

### 4. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📊 Esquema de Base de Datos

El archivo `supabase/schema.sql` incluye:

- **Tablas**: profiles, categories, payment_methods, expenses
- **Índices**: Para optimizar búsquedas por user_id, fecha, categoría
- **Triggers**: Actualización automática de `updated_at`
- **RLS Policies**: Seguridad a nivel de fila
- **Función**: Auto-creación de categorías y métodos por defecto al registrarse

### Estructura de tablas

| Tabla | Descripción |
|-------|-------------|
| profiles | Perfil del usuario (nombre, moneda por defecto) |
| categories | Categorías de gastos con color e icono |
| payment_methods | Métodos de pago (Efectivo, Débito, Crédito, etc.) |
| expenses | Gastos con soporte para recurrentes |

## 🔐 Seguridad

- **RLS habilitado** en todas las tablas
- **Validación Zod** en todas las mutaciones del servidor
- **user_id desde sesión**, nunca desde el cliente
- **anon key + RLS** para operaciones normales (sin service role key)

## 🐳 Despliegue con Docker

### Build de la imagen

```bash
docker build -t gastos-app .
```

### Ejecutar contenedor

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=tu-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key \
  gastos-app
```

### Con docker-compose

```bash
# Crear archivo .env con las variables
docker-compose up -d
```

## 🚀 Despliegue en Dokploy (VPS)

### 1. Configurar repositorio en Dokploy

1. Conectar el repositorio Git
2. Seleccionar el Dockerfile existente

### 2. Variables de entorno

En el panel de Dokploy, agregar:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://tu-proyecto.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu-anon-key |

### 3. Configuración de red

- Puerto: 3000
- Health check: `/api/health` (opcional)

### 4. Build y Deploy

Dokploy construirá automáticamente usando el Dockerfile.

## 📁 Estructura del Proyecto

```
gastos-app/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Páginas de login y registro
│   │   ├── (protected)/      # Páginas protegidas (dashboard, expenses, settings)
│   │   ├── api/              # API Routes
│   │   ├── globals.css       # Estilos globales
│   │   └── layout.tsx        # Layout raíz
│   ├── components/
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── expenses/         # Componentes de gastos
│   │   ├── layout/           # Sidebar
│   │   └── settings/         # Configuración
│   └── lib/
│       ├── supabase/         # Clientes Supabase
│       ├── types.ts          # Tipos TypeScript
│       ├── validators.ts     # Schemas Zod
│       └── utils.ts          # Utilidades
├── supabase/
│   └── schema.sql            # Esquema de base de datos
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 📝 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar en producción |
| `npm run lint` | Verificar código |

## 🎨 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Gráficas**: Recharts
- **Validación**: Zod + React Hook Form
- **Iconos**: Lucide React

## 📄 Licencia

MIT
