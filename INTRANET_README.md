# INTRANET - Sistema de Gestión de Inventarios

Sistema completo de gestión de inventarios para la Escuela de Ingeniería Química, con autenticación, panel administrativo, y control de préstamos de equipos.

## ✨ Características

- ✅ **Autenticación segura** con Supabase
- ✅ **Dashboard informativo** con estadísticas en tiempo real
- ✅ **CRUD completo** para Ambientes, Categorías, Estudiantes y Equipos
- ✅ **Sistema de préstamos** con histórico automatizado
- ✅ **Devoluciones automáticas** que actualizan estados de equipos
- ✅ **Vista de ambientes** con distribución física de equipos
- ✅ **Reportes** con exportación a CSV
- ✅ **Diseño responsive** estilo "classroom" (moderno y amigable)
- ✅ **Interfaz intuitiva** con iconos y visual clara

## 🚀 Instalación Rápida

### 1. Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (elige la región más cercana)
3. Espera a que el proyecto se inicialice (2-3 minutos)
4. Ve a **Settings** > **API** y copia:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. Ejecutar SQL Schema

1. En Supabase, abre **SQL Editor**
2. Crea una nueva query
3. Copia todo el contenido de `sql/schema.sql`
4. Ejecuta (▶️ botón verde)
5. Espera a que se complete (deberías ver ✓)

### 3. Crear usuario admin

En Supabase, ve a **Authentication** > **Users**:
1. Click en **Add user**
2. Email: `admin@escuela-iq.edu`
3. Password: Crea una contraseña segura
4. **Save**

### 4. Configurar Variables de Entorno

1. En la carpeta del proyecto, copia `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

2. Edita `.env.local` y reemplaza:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@escuela-iq.edu
```

Obtén las claves desde Supabase > Settings > API

### 5. Instalar Dependencias

```bash
npm install
```

### 6. Ejecutar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000/intranet](http://localhost:3000/intranet)

## 📋 Estructura del Proyecto

```
src/
├── app/
│   └── intranet/
│       ├── layout.jsx              # Layout con sidebar
│       ├── page.jsx                # Redirección
│       ├── login/
│       │   └── page.jsx            # Página de login
│       ├── dashboard/
│       │   └── page.jsx            # Dashboard principal
│       ├── ambientes/
│       │   └── page.jsx            # CRUD Ambientes
│       ├── categorias/
│       │   └── page.jsx            # CRUD Categorías
│       ├── estudiantes/
│       │   └── page.jsx            # CRUD Estudiantes
│       ├── equipos/
│       │   └── page.jsx            # CRUD Equipos
│       ├── prestamos/
│       │   └── page.jsx            # Sistema de préstamos
│       └── reportes/
│           └── page.jsx            # Reportes y análisis
├── components/
│   ├── intranet/
│   │   ├── Sidebar.jsx             # Navegación lateral
│   │   ├── Layout.jsx              # Layout principal
│   │   └── Forms.jsx               # Componentes reutilizables
│   └── Providers.jsx               # Providers de app
├── context/
│   └── AuthContext.jsx             # Context de autenticación
└── lib/
    └── supabase.js                 # Cliente y funciones DB
```

## 🔐 Flujo de Autenticación

1. Usuario no autenticado → Redirige a `/intranet/login`
2. Ingresa credenciales admin
3. Si es correcto → Acceso a toda la intranet
4. Si no → Mensaje de error

## 📊 Modelo de Datos

### Ambientes
- ID, Nombre, Descripción, Ubicación

### Categorías de Equipos
- ID, Nombre, Descripción

### Equipos
- ID, Nombre, Código único, Ambiente, Categoría, Estado (disponible/ocupado/mantenimiento)

### Estudiantes
- ID, Nombre, Email, Matrícula

### Préstamos (Histórico)
- ID, Equipo, Estudiante, Fecha Préstamo, Fecha Devolución, Observaciones

## 🎮 Uso Principal

### Registrar un Préstamo
1. Ve a **Préstamos** > **Nuevo Préstamo**
2. Selecciona un equipo disponible
3. Selecciona un estudiante
4. Automáticamente:
   - Se registra la fecha de préstamo
   - El equipo cambia estado a "ocupado"

### Devolver un Equipo
1. Ve a **Préstamos** > **Préstamos Activos**
2. Click en **Devolver**
3. Automáticamente:
   - Se registra la fecha de devolución
   - El equipo cambia estado a "disponible"

### Ver Reportes
1. Ve a **Reportes**
2. Filtra por: Todos, Activos, Devueltos
3. Exporta a CSV si es necesario

## 🛠️ Personalización

### Cambiar Credenciales Admin
1. En Supabase > Authentication > Users
2. Edita el usuario admin
3. Cambiar email/password

### Agregar Más Usuarios
- Por ahora solo soporta un admin
- Opcionalmente, puedes extender el sistema de roles en `usuarios` tabla

### Cambiar Colores/Tema
- Los estilos están en Tailwind CSS
- Busca `bg-blue-` y reemplaza con tu color preferido
- Los colores principales son: blue, green, red, yellow

## 🚢 Desplegar en Vercel

1. Sube el código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el repositorio
4. En **Environment Variables** agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
5. Deploy 🚀

## 📱 Acceso

- **Landing Page**: [https://tudominio.com](https://tudominio.com)
- **Intranet**: [https://tudominio.com/intranet](https://tudominio.com/intranet)
- **Login**: [https://tudominio.com/intranet/login](https://tudominio.com/intranet/login)

## 🐛 Troubleshooting

### "Error: Missing Supabase environment variables"
- Verifica que `.env.local` tenga `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Reinicia el servidor: `Ctrl+C` y `npm run dev`

### Login no funciona
- Verifica que el usuario admin existe en Supabase > Authentication
- Confirma que la contraseña es correcta
- Abre browser console (F12) para ver errores detallados

### Tablas vacías en dashboard
- Ve a cada sección (Ambientes, Estudiantes, etc.) y crea registros
- El dashboard se actualiza automáticamente

### Equipos no cambian de estado
- Verifica que los RPC functions se ejecutaron en SQL schema
- En Supabase, ve a Database > Functions y comprueba que existen:
  - `registrar_prestamo`
  - `devolver_prestamo`

## 📞 Soporte

Para reportar issues o sugerencias, abre un issue en el repositorio de GitHub.

## 📜 Licencia

Proyecto educativo - Escuela de Ingeniería Química
