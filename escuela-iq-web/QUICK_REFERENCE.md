# 📖 REFERENCIA RÁPIDA - Intranet IQ

## 🚀 Primeros Pasos (Después de clonar)

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar archivo de variables
cp .env.example .env.local

# 3. EDITAR .env.local con tus claves de Supabase
# (Ve a SETUP_GUIDE.md para obtenerlas)

# 4. Correr servidor de desarrollo
npm run dev

# 5. Abre http://localhost:3000/intranet
```

---

## 📂 Estructura de Archivos Clave

```
src/
├── app/intranet/
│   ├── login/page.jsx              ← Pantalla de login
│   ├── dashboard/page.jsx          ← Panel principal con stats
│   ├── ambientes/page.jsx          ← CRUD de laboratorios
│   ├── categorias/page.jsx         ← CRUD de categorías
│   ├── estudiantes/page.jsx        ← CRUD de estudiantes
│   ├── equipos/page.jsx            ← CRUD de equipos
│   ├── prestamos/page.jsx          ← Sistema de préstamos
│   └── reportes/page.jsx           ← Reportes y análisis
├── components/intranet/
│   ├── Layout.jsx                  ← Layout principal con sidebar
│   ├── Sidebar.jsx                 ← Navegación
│   └── Forms.jsx                   ← Componentes reutilizables
├── context/
│   └── AuthContext.jsx             ← Autenticación
└── lib/
    └── supabase.js                 ← Cliente DB y funciones
```

---

## 🗄️ Tablas de Base de Datos

| Tabla | Campos | Función |
|-------|--------|---------|
| `ambientes` | id, nombre, descripcion, ubicacion | Laboratorios y salas |
| `categorias_equipos` | id, nombre, descripcion | Tipos de equipos |
| `equipos` | id, nombre, codigo, ambiente_id, categoria_id, estado | Inventario |
| `estudiantes` | id, nombre, email, matricula, estado | Usuarios |
| `prestamos` | id, equipo_id, estudiante_id, fecha_prestamo, fecha_devolucion | Histórico de préstamos |

Estados de equipos:
- `disponible` - Listo para usar
- `ocupado` - Actualmente prestado
- `en_mantenimiento` - Fuera de servicio

---

## 🔑 Variables de Entorno

Necesarias para funcionar:

```env
NEXT_PUBLIC_SUPABASE_URL        # URL del proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Clave pública
SUPABASE_SERVICE_ROLE_KEY       # Clave secreta (servidor)
```

Opcionales:

```env
NEXT_PUBLIC_ADMIN_EMAIL         # Para referencia
NEXT_PUBLIC_ADMIN_PASSWORD      # Para referencia
```

---

## 🎯 Flujos Principales

### Login
1. Usuario va a `/intranet/login`
2. Ingresa credenciales
3. Sistema valida con Supabase
4. Si OK → Dashboard
5. Si NO → Error

### Registrar Préstamo
1. Admin en `/intranet/prestamos` → "Nuevo Préstamo"
2. Selecciona equipo disponible + estudiante
3. Al guardar:
   - ✓ Se crea registro en `prestamos`
   - ✓ Equipo cambia a estado "ocupado"
   - ✓ Se registra fecha_prestamo

### Devolver Equipo
1. Admin en `/intranet/prestamos` → "Préstamos Activos"
2. Click "Devolver"
3. Al devolver:
   - ✓ Se actualiza fecha_devolucion
   - ✓ Equipo cambia a "disponible"
   - ✓ Se guarda en histórico

---

## 🛠️ Funciones Disponibles (en lib/supabase.js)

```javascript
// Autenticación
await dbOperations.login(email, password)
await dbOperations.logout()
await dbOperations.getCurrentUser()

// Ambientes
await dbOperations.getAmbientes()
await dbOperations.crearAmbiente(nombre, descripcion)
await dbOperations.actualizarAmbiente(id, nombre, descripcion)
await dbOperations.eliminarAmbiente(id)

// Categorías
await dbOperations.getCategorias()
await dbOperations.crearCategoria(nombre, descripcion)
await dbOperations.actualizarCategoria(id, nombre, descripcion)
await dbOperations.eliminarCategoria(id)

// Estudiantes
await dbOperations.getEstudiantes()
await dbOperations.crearEstudiante(nombre, email, matricula)
await dbOperations.actualizarEstudiante(id, nombre, email, matricula)
await dbOperations.eliminarEstudiante(id)

// Equipos
await dbOperations.getEquipos()
await dbOperations.getEquiposPorAmbiente(ambienteId)
await dbOperations.crearEquipo(nombre, codigo, ambienteId, categoriaId, descripcion)
await dbOperations.actualizarEquipo(id, nombre, codigo, ambienteId, categoriaId, descripcion, estado)
await dbOperations.cambiarEstadoEquipo(id, estado)
await dbOperations.eliminarEquipo(id)

// Préstamos
await dbOperations.crearPrestamo(equipoId, estudianteId, fechaPrestamo)
await dbOperations.devolverPrestamo(prestamoId)
await dbOperations.getPrestamos()
await dbOperations.getPrestamosPendientes()
await dbOperations.getHistorialEstudiante(estudianteId)

// Dashboard
await dbOperations.getDashboardStats()
```

---

## 🎨 Componentes UI Reutilizables

Desde `components/intranet/Forms.jsx`:

```jsx
// Modal de diálogo
<Modal isOpen={isOpen} onClose={onClose} title="Título">
  {children}
</Modal>

// Input de texto
<FormInput
  label="Nombre"
  name="nombre"
  value={value}
  onChange={handleChange}
  required
/>

// Select/Dropdown
<FormSelect
  label="Categoría"
  name="categoria_id"
  value={value}
  onChange={handleChange}
  options={[{ id: 1, nombre: "Opción 1" }]}
  required
/>

// Botón
<Button onClick={handleClick} variant="primary">
  Guardar
</Button>

// Tabla
<Table
  columns={[{ key: 'nombre', label: 'Nombre' }]}
  data={data}
  actions={(row) => <button>Editar</button>}
/>

// Badge/Etiqueta
<Badge color="green">Disponible</Badge>
```

---

## 🐛 Debugging

### Ver errores en consola
```bash
# Terminal (npm run dev)
# Verifica que no haya errores en rojo

# Browser (F12)
# Console tab → busca errores
# Network tab → verifica llamadas a Supabase
```

### Verificar BD
En Supabase > Table Editor:
- ¿Existen las tablas?
- ¿Hay datos?
- ¿Los datos son correctos?

### Verificar Auth
En Supabase > Authentication > Users:
- ¿Existe el usuario admin?
- ¿El email es correcto?

---

## 📈 Mejoras Futuras

- [ ] Múltiples roles (admin, profesor, estudiante)
- [ ] Notificaciones por email de préstamos/devoluciones
- [ ] Foto de equipos
- [ ] QR codes para escanear equipos
- [ ] Historial de devoluciones tardías
- [ ] Correos automáticos de recordatorio

---

## 📞 Soporte

Lee los archivos en orden:
1. **SETUP_GUIDE.md** - Configuración paso a paso
2. **INTRANET_README.md** - Documentación completa
3. **Este archivo** - Referencia rápida

¿Aún hay dudas? Abre un issue en el repositorio.
