# Parrillero El Cotohurco — Plataforma Web

Sitio web para el restaurante **Parrillero El Cotohurco**, con carta completa, sección de desayunos/almuerzos/aperitivos especiales con disponibilidad diaria, promociones de temporada, servicios del local, información de domicilios/para llevar, y un **Panel Admin** para que el propio restaurante actualice todo sin tocar código.

Estilo inspirado en: la energía y color de **KFC**, la calidez tradicional de **Menestras del Negro**, y el orden/limpieza de **Dunamai.group**.

## Cómo abrir el sitio

Es un sitio 100% estático (HTML + CSS + JavaScript), no necesita instalación:

1. Descomprime la carpeta del proyecto.
2. Abre `index.html` con doble clic (o, mejor, sirve la carpeta con un servidor local, por ejemplo `python3 -m http.server` desde dentro de la carpeta, y visita `http://localhost:8000`).

Para publicarlo en internet, puedes subir toda la carpeta a cualquier hosting estático (por ejemplo Netlify, Vercel, GitHub Pages, o el hosting que ya use el restaurante).

## Estructura de páginas

- `index.html` — Inicio: hero, servicios, platos destacados, adelanto de especiales del día y promociones.
- `carta.html` — La Carta completa, con filtro por categoría y precios "Local" / "Para llevar".
- `desayunos.html` — Desayunos, almuerzos y aperitivos especiales (humitas, quimbolitos, tamales, empanadas de verde, etc.) con disponibilidad en unidades, pensada para actualizarse a diario.
- `promociones.html` — Promociones y lanzamientos de temporada.
- `servicios.html` — Servicios del local (para llevar, domicilio, parqueadero, eventos, etc.).
- `domicilios.html` — Reglas de empaque/domicilio + calculadora de estimado de costo adicional.
- `admin.html` — Panel administrativo protegido por contraseña.

## Panel Admin

Entra a `admin.html` y usa la contraseña por defecto:

```
cothourco2026
```

Puedes cambiarla luego desde la pestaña **Cuenta**. Desde el panel puedes:

- Editar la información general del restaurante (nombre, dirección, teléfono, horario, redes).
- Agregar, editar u ocultar **servicios** del local.
- Agregar, editar u ocultar **platos de la carta** y crear nuevas categorías.
- Actualizar a diario los **desayunos/almuerzos/aperitivos especiales**: precio, unidades disponibles y estado (publicado / no publicar). Cuando el stock llega a 0, el plato se muestra automáticamente como "Agotado" en el sitio público.
- Crear y administrar **promociones y lanzamientos de temporada**.
- Configurar las **reglas de domicilio**: cargo de empaque, tarifa mínima, y zonas de entrega con su tarifa.
- Restaurar todos los datos a los valores originales del proyecto.

### Importante sobre cómo se guardan los datos

Todo lo que edites en el Panel Admin se guarda en el **almacenamiento local del navegador** (`localStorage`) del dispositivo donde lo edites. Esto significa:

- Los cambios se mantienen aunque cierres o reinicies el navegador, **en ese mismo dispositivo/navegador**.
- Si el restaurante quiere administrar el sitio desde varios dispositivos (por ejemplo, un celular en cocina y una laptop en caja) y que los cambios se vean igual para todos los clientes en tiempo real, se necesita un paso adicional: conectar el sitio a una base de datos/backend real (por ejemplo Firebase, Supabase, o un pequeño servidor propio). El código está organizado para que ese cambio sea sencillo: toda la lectura/escritura de datos pasa por un único archivo, `js/store.js`, que es el que habría que reemplazar por llamadas a esa API.
- La contraseña del panel es una protección simple, pensada para evitar ediciones accidentales del personal — no es un sistema de seguridad robusto (cualquiera con acceso al código fuente del navegador podría revisarla). Si se requiere seguridad real, también se necesitaría un backend con autenticación.

## Contenido que debes revisar antes de publicar

Para que el sitio esté listo para clientes reales, entra al Panel Admin y confirma/completa:

1. **Dirección real, teléfono, horario y redes sociales** (pestaña General). Mientras no se agregue una dirección, esa línea simplemente no se muestra en el sitio.
2. **Precio y stock del día** de humitas, quimbolitos, tamales, empanadas de verde y cualquier otro aperitivo especial (pestaña "Especiales del día"). Se incluyeron como ejemplo de cómo funciona la disponibilidad diaria, pero no tienen precio oficial todavía.
3. **Servicios del local** (pestaña Servicios): se incluyó una lista de servicios típicos de un restaurante (para llevar, domicilio, parqueadero, eventos, wifi) — confirma cuáles aplican realmente y edita/agrega lo que haga falta.
4. **Promociones**: se dejó una promoción de EJEMPLO desactivada, para que veas cómo se ve. Actívala o reemplázala por promociones reales cuando las tengas.
5. **Zonas y tarifas de domicilio** (pestaña Domicilio): se dejaron 4 zonas de referencia con tarifas de ejemplo ($1.00 a $2.00, y "Consultar" para distancias largas). Ajústalas según las zonas reales de reparto.

## Platos oficiales ya cargados (proporcionados por el cliente)

| Plato | Precio local |
|---|---|
| Parrillada Mini | $6.50 |
| Parrillada Completa | $10.00 |
| Parrillada Mar y Tierra | $20.00 |
| Churrasco | $5.00 |
| Menestra de Res | $3.50 |
| Menestra de Pollo | $3.50 |
| Menestra de Cerdo | $3.75 |
| Asado de Res | $3.50 |
| Asado de Cerdo | $3.75 |
| Camarones Apanados | $5.00 |

Reglas de precio aplicadas automáticamente en todo el sitio:
- **Para llevar**: precio local + $0.25 (cargo de empaque).
- **A domicilio**: cargo de empaque + tarifa de zona (desde $1.00), configurable en el Panel Admin. Pedido mínimo de 1 a 3 platos (del mismo plato o combinados).

Puedes agregar más platos en cualquier momento desde la pestaña **La Carta** del Panel Admin — no hay límite, y puedes crear nuevas categorías (por ejemplo "Postres" o "Bebidas") cuando las necesites.

## Estructura técnica (para quien continúe el desarrollo)

```
index.html, carta.html, desayunos.html, promociones.html,
servicios.html, domicilios.html, admin.html
css/style.css        → todos los estilos del sitio
js/data.js            → datos iniciales ("semilla") del restaurante
js/store.js           → capa de almacenamiento (localStorage) — CRUD de todos los datos
js/main.js             → lógica y renderizado del sitio público
js/admin.js            → lógica del Panel Admin (login, formularios, tablas)
images/logo.png        → logo oficial del restaurante
```

No se usan frameworks ni build tools: es HTML, CSS y JavaScript puro, así que cualquier desarrollador puede editarlo directamente sin instalar nada.
