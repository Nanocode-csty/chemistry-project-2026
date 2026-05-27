# 🚀 Guía Completa de Configuración - Intranet IQ

Sigue estos pasos **exactamente en orden** para configurar la intranet.

## PASO 1: Crear Proyecto en Supabase (5 minutos)

### 1.1 Crear Cuenta
- Visita [https://supabase.com](https://supabase.com)
- Click en **Sign Up** (esquina superior derecha)
- Usa tu email o GitHub
- Verifica tu email

### 1.2 Crear Proyecto
- Dashboard > **New Project**
- Nombre: `escuela-iq-inventarios`
- Contraseña Database: Copia en lugar seguro (no la necesitarás después)
- Región: La más cercana a tu ubicación (ej: `us-east-1` para América)
- Click **Create new project**
- **Espera 2-3 minutos** mientras se inicializa

### 1.3 Obtener Claves API
- Cuando esté listo, ve a **Settings** (⚙️ esquina inferior izquierda)
- Click en **API**
- Copia estos valores (guárdalos en un block de notas):
  - **Project URL** → Esto es tu `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** → Esto es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role secret** → Esto es tu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ CONFIDENCIAL)

Ejemplo:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdef123456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRETO)
```

---

## PASO 2: Crear Base de Datos (5 minutos)

### 2.1 Ir a SQL Editor
- En Supabase, click en **SQL Editor** (izquierda)
- Click en **New Query**

### 2.2 Copiar SQL Schema
1. Abre el archivo `sql/schema.sql` en tu editor
2. Copia **TODO EL CONTENIDO**
3. Pégalo en el SQL Editor de Supabase

### 2.3 Ejecutar
- Click en botón **▶️ RUN** (esquina superior derecha)
- Espera a que termine (verás un ✓ verde)

### 2.4 Verificar
- En Supabase, abre **Table Editor** (izquierda)
- Deberías ver estas tablas:
  - ✓ ambientes
  - ✓ categorias_equipos
  - ✓ equipos
  - ✓ estudiantes
  - ✓ prestamos
  - ✓ usuarios

Si no aparecen, repite PASO 2.1-2.3

---

## PASO 3: Crear Usuario Admin (3 minutos)

### 3.1 Ir a Authentication
- En Supabase, click en **Authentication** (izquierda)
- Click en **Users**

### 3.2 Agregar Usuario
- Click en botón **+ Add user** (esquina superior derecha)
- Email: `admin@escuela-iq.edu` (exacto)
- Password: Crea una contraseña fuerte (ej: `Admin@123!`)
- Deja **Auto Confirm User** SIN MARCAR
- Click en **Save**

### 3.3 Verificar
- Deberías ver el usuario listado con ✓ estado

---

## PASO 4: Configurar Variables de Entorno (2 minutos)

### 4.1 Crear archivo `.env.local`
En la carpeta raíz del proyecto (`escuela-iq-web/`):

1. Copia el archivo `.env.example` como `.env.local`
2. Abre `.env.local` en tu editor

### 4.2 Llenar Variables

```env
# De Supabase API Settings
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Admin por defecto
NEXT_PUBLIC_ADMIN_EMAIL=admin@escuela-iq.edu
NEXT_PUBLIC_ADMIN_PASSWORD=Admin@123!
```

⚠️ **IMPORTANTE**: 
- No compartas `.env.local` (contiene secretos)
- Agrega `.env.local` al `.gitignore`

---

## PASO 5: Instalar Dependencias (5 minutos)

```bash
# En la carpeta escuela-iq-web/
npm install
```

Espera a que termine sin errores.

---

## PASO 6: Probar Localmente (2 minutos)

```bash
npm run dev
```

Deberías ver:
```
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

1. Abre [http://localhost:3000/intranet](http://localhost:3000/intranet)
2. Deberías ver página de **Login**
3. Prueba con:
   - Email: `admin@escuela-iq.edu`
   - Password: La contraseña que creaste

✅ Si funciona, ¡vas bien!

---

## PASO 7: Crear Datos de Prueba (5 minutos)

### 7.1 Crear Ambientes
1. En la intranet, ve a **Ambientes**
2. Click **Nuevo Ambiente**
3. Crea 2-3 ambientes:
   - Laboratorio A - Química Orgánica
   - Laboratorio B - Bioquímica
   - Sala de Espectroscopia

### 7.2 Crear Categorías
1. Ve a **Categorías**
2. Click **Nueva Categoría**
3. Crea 3-4 categorías:
   - Microscopios
   - Cristalería
   - Reactivos
   - Equipos Analíticos

### 7.3 Crear Estudiantes
1. Ve a **Estudiantes**
2. Click **Nuevo Estudiante**
3. Crea 5-10 estudiantes de prueba

### 7.4 Crear Equipos
1. Ve a **Equipos**
2. Click **Nuevo Equipo**
3. Crea 10-15 equipos asignando:
   - Nombres
   - Códigos (MICRO-001, CRISTA-001, etc.)
   - Ambientes
   - Categorías

### 7.5 Probar Préstamos
1. Ve a **Préstamos**
2. Click **Nuevo Préstamo**
3. Selecciona un equipo y estudiante
4. Click en equipo devuelto en **Préstamos Activos** para probar devolución

---

## PASO 8: Deploy en Vercel (5 minutos)

### 8.1 Push a GitHub
```bash
git add .
git commit -m "Add intranet system"
git push origin main
```

### 8.2 Conectar a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Login con GitHub
3. Click **+ New Project**
4. Importa tu repositorio
5. En **Environment Variables**, agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
6. Click **Deploy**

Espera 2-3 minutos. ¡Listo! Tu intranet está en línea 🚀

---

## ❓ Preguntas Frecuentes

### ¿Olvidé la contraseña del admin?
- Ve a Supabase > Authentication > Users
- Click en el usuario admin
- Click **Reset Password**
- Se enviará email (revisa spam si no ves)

### ¿Cómo agrego más administradores?
- De momento, el sistema solo soporta 1 admin
- Para múltiples admins, se requiere extender el sistema de roles

### ¿Qué pasa si pierdo mis claves API?
- En Supabase > Settings > API
- Click en **Regenerate** (se crearán nuevas)
- Actualiza `.env.local` con las nuevas

### ¿Por qué me dice "Missing Supabase environment variables"?
- Verifica que `.env.local` exista (no `.env`)
- Reinicia el servidor: `Ctrl+C` y `npm run dev`
- Asegúrate de que NEXT_PUBLIC_ variables estén sin espacios

### ¿Cómo veo los errores?
- Abre console del navegador: **F12 o Ctrl+Shift+I**
- Ve a la pestaña **Console**
- Busca mensajes en rojo

---

## 📊 URLs Principales

Después de desplegar en Vercel:

- **Landing Page**: `https://tu-dominio.vercel.app`
- **Intranet**: `https://tu-dominio.vercel.app/intranet`
- **Login**: `https://tu-dominio.vercel.app/intranet/login`

---

## 🎉 ¡Listo!

Si llegaste aquí, la intranet está funcionando. Los próximos pasos:

1. ✅ Poblar con datos reales
2. ✅ Entrenar a los usuarios
3. ✅ Realizar devoluciones y préstamos
4. ✅ Revisar reportes

¿Dudas? Revisa el archivo `INTRANET_README.md` para más detalles.
