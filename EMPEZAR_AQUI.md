# 🚀 EMPEZAR AQUÍ

## ¿Ya tienes el código? Excelente. Aquí está qué hacer AHORA:

### ✅ PASO 1: Leer (5 minutos)
Abre y lee **completamente**:
```
SETUP_GUIDE.md
```
Este archivo te guía paso a paso. **NO SALTES PASOS.**

### ✅ PASO 2: Crear Supabase (5 minutos)
1. Ve a https://supabase.com
2. Sign Up (usa GitHub para rápido)
3. Crea un nuevo proyecto
4. **Espera 2-3 minutos** a que se inicialice

### ✅ PASO 3: Crear Base de Datos (5 minutos)
1. En Supabase, abre **SQL Editor**
2. New Query
3. Abre el archivo: `sql/schema.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor de Supabase
6. Click **RUN** (▶️ verde)
7. Espera que termine

### ✅ PASO 4: Crear Admin (3 minutos)
1. En Supabase, ve a **Authentication** > **Users**
2. Click **+ Add user**
3. Email: `admin@escuela-iq.edu`
4. Password: Elige una segura (ej: `Admin@123!`)
5. Save

### ✅ PASO 5: Configurar Variables (2 minutos)
1. Abre el archivo `.env.example`
2. Cópialo como `.env.local` (en la carpeta raíz)
3. Abre `.env.local`
4. Llena las 3 claves desde Supabase:
   - Ve a Supabase > Settings > API
   - Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copia `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copia `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### ✅ PASO 6: Instalar (5 minutos)
```bash
npm install
```

### ✅ PASO 7: Ejecutar (1 minuto)
```bash
npm run dev
```

### ✅ PASO 8: Probar (2 minutos)
1. Abre http://localhost:3000/intranet/login
2. Login con:
   - Email: `admin@escuela-iq.edu`
   - Password: La que creaste en PASO 4

¡Si viste el dashboard, FUNCIONÓ! ✅

---

## 📊 Dashboard Que Deberías Ver

```
┌─────────────────────────────────────────────┐
│         INTRANET IQ - DASHBOARD             │
├─────────────────────────────────────────────┤
│                                             │
│  Total Ambientes: 0          Estudiantes: 0│
│  Total Equipos: 0            Préstamos: 0 │
│                                             │
│  Equipos Disponibles: 0                    │
│  Equipos Ocupados: 0                       │
│  En Mantenimiento: 0                       │
│                                             │
│  Ambientes y Equipos                       │
│  (Vacío, pero listo para datos)            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Próximo Paso: Crear Datos de Prueba

En el menú izquierdo:
1. Ve a **Ambientes** → Crea 2-3
2. Ve a **Categorías** → Crea 3-4
3. Ve a **Estudiantes** → Crea 5-10
4. Ve a **Equipos** → Crea 10-15
5. Ve a **Préstamos** → Crea 2-3 pruebas

---

## ❓ Problemas Comunes

**"Error: Missing Supabase environment variables"**
- Verifica `.env.local` tenga las 3 variables
- Reinicia: Ctrl+C y `npm run dev`

**"Login no funciona"**
- En Supabase > Authentication, ¿existe el usuario?
- ¿La contraseña es correcta?

**"No veo las tablas en Supabase"**
- Vuelve a ejecutar el SQL schema
- Asegúrate de hacer click en RUN

---

## 📖 Más Información

- `SETUP_GUIDE.md` - Guía completa paso a paso
- `INTRANET_README.md` - Documentación funcional
- `QUICK_REFERENCE.md` - Referencia técnica
- `INDEX.md` - Índice de toda la documentación
- `IMPLEMENTACION_COMPLETADA.md` - Resumen del proyecto

---

## ✨ ¡Eso es Todo!

Sigue los 8 pasos arriba y tendrás una intranet funcional.

**Tiempo total: ~35 minutos**

¿Preguntas? Vuelve a leer `SETUP_GUIDE.md` - tiene TODO explicado.

¡Éxito! 🚀
