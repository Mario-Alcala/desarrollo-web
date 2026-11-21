/*
 * ARCHIVO: js/admin-datos.js
 * CAPA: FRONTEND (datos de ejemplo). ¿ES CASCARÓN? NO: son datos inventados, no diseño.
 * QUÉ CONTIENE: productos del catálogo y lotes de cosecha (más adelante: bodegas, proveedores,
 *   insumos, inventario, herramientas y pedidos), con los campos del documento del proyecto.
 * POR QUÉ EXISTE (BACKEND INCOMPLETO): la API aún no tiene catálogo de productos, bodegas,
 *   cosechas ni pedidos. Con estos datos se ven las pantallas completas mientras tanto.
 * CUÁNDO BORRARLO: cuando el backend entregue estos datos; se reemplaza cada arreglo por un fetch().
 * NOTA: los cambios hechos en las pantallas viven solo en memoria; al recargar vuelven a estos datos.
 */

/* ---------- Catálogo (tabla productos) ---------- */
const PRODUCTOS = [
    { id: 1, categoria: "verdura", familia: "tomate", variedad: "cherry", descripcion: "Tomate pequeño y dulce, ideal para ensaladas y botanas.", imagen: "", precioPorKg: 48, activo: true },
    { id: 2, categoria: "verdura", familia: "tomate", variedad: "saladette", descripcion: "Tomate firme de pulpa gruesa, perfecto para salsas.", imagen: "", precioPorKg: 32, activo: true },
    { id: 3, categoria: "verdura", familia: "calabacita", variedad: "italiana", descripcion: "Calabacita tierna de cáscara verde, cosechada joven.", imagen: "", precioPorKg: 28, activo: true },
    { id: 4, categoria: "verdura", familia: "maíz", variedad: "elote", descripcion: "Elote dulce recién cortado.", imagen: "", precioPorKg: 18, activo: true },
    { id: 5, categoria: "fruta", familia: "limón", variedad: "persa", descripcion: "Limón sin semilla, jugoso y de cáscara delgada.", imagen: "", precioPorKg: 26, activo: true },
    { id: 6, categoria: "fruta", familia: "aguacate", variedad: "hass", descripcion: "Aguacate cremoso de cáscara rugosa.", imagen: "", precioPorKg: 85, activo: true },
    { id: 7, categoria: "verdura", familia: "chile", variedad: "serrano", descripcion: "Chile picante de temporada.", imagen: "", precioPorKg: 40, activo: false }
];

/* ---------- Cosechas: cada corte es un lote ---------- */
const COSECHAS = [
    { id: 1, idProducto: 1, origen: "El Encino · Parcela A", idBodega: 1, fecha: "2026-11-15", kgCosechados: 120, kgDisponibles: 85.5, maduracion: "maduro" },
    { id: 2, idProducto: 1, origen: "El Encino · Parcela A", idBodega: 1, fecha: "2026-11-18", kgCosechados: 60, kgDisponibles: 60, maduracion: "verde" },
    { id: 3, idProducto: 2, origen: "El Encino · Parcela B", idBodega: 1, fecha: "2026-11-12", kgCosechados: 200, kgDisponibles: 140, maduracion: "maduro" },
    { id: 4, idProducto: 3, origen: "La Esperanza · Parcela A", idBodega: 2, fecha: "2026-11-16", kgCosechados: 90, kgDisponibles: 90, maduracion: "maduro" },
    { id: 5, idProducto: 4, origen: "El Encino · Parcela B", idBodega: 2, fecha: "2026-11-10", kgCosechados: 150, kgDisponibles: 0, maduracion: "maduro" },
    { id: 6, idProducto: 5, origen: "La Esperanza · Parcela B", idBodega: 1, fecha: "2026-11-14", kgCosechados: 75, kgDisponibles: 52, maduracion: "verde" },
    { id: 7, idProducto: 6, origen: "La Esperanza · Parcela B", idBodega: 2, fecha: "2026-11-13", kgCosechados: 40, kgDisponibles: 28, maduracion: "maduro" }
];

/* ---------- Proveedores (tabla proveedores) ---------- */
const PROVEEDORES = [
    { id: 1, nombreEmpresa: "AgroSur", contacto: "Laura Méndez", telefono: "2281234567", email: "ventas@agrosur.example", direccion: "Carretera Xalapa-Veracruz km 12, Xalapa, Ver." },
    { id: 2, nombreEmpresa: "Semillas del Golfo", contacto: "Carlos Ibarra", telefono: "2299876543", email: "contacto@semillasgolfo.example", direccion: "Av. Hidalgo 45, Veracruz, Ver." },
    { id: 3, nombreEmpresa: "Fertiverde", contacto: "Ana Torres", telefono: "2288765432", email: "ana@fertiverde.example", direccion: "Calle Reforma 210, Coatepec, Ver." },
    { id: 4, nombreEmpresa: "Abonos Orgánicos La Huerta", contacto: "Miguel Cruz", telefono: "2282345678", email: "info@lahuerta.example", direccion: "Camino a Banderilla s/n, Banderilla, Ver." }
];

/* ---------- Insumos (tabla insumos): semilla, abono o fertilizante ---------- */
const INSUMOS = [
    { id: 1, nombre: "Semilla de tomate cherry", categoria: "semilla", varTipo: "cherry", unidad: "kg", activo: true },
    { id: 2, nombre: "Semilla de calabacita", categoria: "semilla", varTipo: "italiana", unidad: "kg", activo: true },
    { id: 3, nombre: "Semilla de maíz elote", categoria: "semilla", varTipo: "dulce", unidad: "kg", activo: true },
    { id: 4, nombre: "Composta de lombriz", categoria: "abono", varTipo: "orgánico", unidad: "kg", activo: true },
    { id: 5, nombre: "Estiércol composteado", categoria: "abono", varTipo: "orgánico", unidad: "kg", activo: true },
    { id: 8, nombre: "Abono mineral", categoria: "abono", varTipo: "inorgánico", unidad: "kg", activo: true },
    { id: 6, nombre: "Fertilizante triple 17", categoria: "fertilizante", varTipo: "granulado NPK 17-17-17", unidad: "kg", activo: true },
    { id: 7, nombre: "Fertilizante foliar", categoria: "fertilizante", varTipo: "líquido", unidad: "litros", activo: false }
];

/* ---------- Bodegas (tabla bodegas) ---------- */
const BODEGAS = [
    { id: 1, nombre: "Bodega Central", ubicacion: "El Encino, Xalapa, Ver." },
    { id: 2, nombre: "Bodega Norte", ubicacion: "La Esperanza, Coatepec, Ver." }
];

/* ---------- Inventario: lotes de insumos (tabla inventario) ---------- */
const INVENTARIO = [
    { id: 1, idInsumo: 1, idProveedor: 2, idBodega: 1, fechaIngreso: "2026-10-20", fechaCaducidad: "2027-05-01", cantidadDisponible: 12.5 },
    { id: 2, idInsumo: 2, idProveedor: 2, idBodega: 1, fechaIngreso: "2026-10-20", fechaCaducidad: "2027-03-15", cantidadDisponible: 8 },
    { id: 3, idInsumo: 3, idProveedor: 2, idBodega: 2, fechaIngreso: "2026-10-25", fechaCaducidad: "2026-12-05", cantidadDisponible: 20 },
    { id: 4, idInsumo: 4, idProveedor: 4, idBodega: 2, fechaIngreso: "2026-11-02", fechaCaducidad: "", cantidadDisponible: 300 },
    { id: 5, idInsumo: 5, idProveedor: 4, idBodega: 1, fechaIngreso: "2026-11-05", fechaCaducidad: "", cantidadDisponible: 450 },
    { id: 6, idInsumo: 6, idProveedor: 3, idBodega: 1, fechaIngreso: "2026-09-15", fechaCaducidad: "2026-11-10", cantidadDisponible: 60 },
    { id: 7, idInsumo: 7, idProveedor: 3, idBodega: 2, fechaIngreso: "2026-10-30", fechaCaducidad: "2027-08-01", cantidadDisponible: 25 }
];

/* ---------- Herramientas (tabla herramientas) ---------- */
const HERRAMIENTAS = [
    { id: 1, idBodega: 1, nombre: "Azadón", tipo: "Manual", cantidad: 6, estado: "Disponible" },
    { id: 2, idBodega: 1, nombre: "Pala", tipo: "Manual", cantidad: 4, estado: "En uso" },
    { id: 3, idBodega: 1, nombre: "Tijeras de podar", tipo: "Manual", cantidad: 8, estado: "Disponible" },
    { id: 4, idBodega: 2, nombre: "Motobomba de riego", tipo: "Motor", cantidad: 2, estado: "Mantenimiento" },
    { id: 5, idBodega: 2, nombre: "Carretilla", tipo: "Transporte", cantidad: 5, estado: "Disponible" },
    { id: 6, idBodega: 2, nombre: "Rejas de cosecha", tipo: "Empaque", cantidad: 40, estado: "En uso" }
];

/* ---------- Movimientos de inventario (tabla movimientos_inventario) ---------- */
const MOVIMIENTOS = [
    { id: 1, idInventario: 1, usuario: "Administrador / Agricultor", tipo: "entrada", cantidad: 15, fecha: "2026-10-20T09:30" },
    { id: 2, idInventario: 1, usuario: "Trabajador de bodega", tipo: "salida", cantidad: 2.5, fecha: "2026-11-03T08:10" },
    { id: 3, idInventario: 5, usuario: "Trabajador de bodega", tipo: "salida", cantidad: 50, fecha: "2026-11-12T07:45" },
    { id: 4, idInventario: 4, usuario: "Administrador / Agricultor", tipo: "entrada", cantidad: 300, fecha: "2026-11-02T10:00" }
];

/* ---------- Pedidos (tablas pedidos, detalle_pedido y entregas) ----------
 * El total NO se guarda: se calcula sumando kg × precio de cada renglón del detalle.
 * La entrega vive dentro del pedido:
 *   tipo "domicilio"   -> direccion y numeroRastreo (si ya salió)
 *   tipo "recoleccion" -> idBodega y diaRecoleccion (horario fijo 7:00 a. m. a 6:00 p. m.)
 */
const PEDIDOS = [
    {
        id: 1001, cliente: "Restaurante La Hacienda", fecha: "2026-11-18", estado: "entregado",
        detalle: [
            { idProducto: 2, kg: 40, precioPorKg: 32 },
            { idProducto: 3, kg: 15, precioPorKg: 28 }
        ],
        entrega: { tipo: "domicilio", direccion: "Av. Xalapa 120, Xalapa, Ver.", numeroRastreo: "GC-48213", estado: "entregada" }
    },
    {
        id: 1002, cliente: "Mercado Los Sauces", fecha: "2026-11-19", estado: "enviado",
        detalle: [
            { idProducto: 1, kg: 25, precioPorKg: 48 },
            { idProducto: 5, kg: 30, precioPorKg: 26 },
            { idProducto: 6, kg: 10, precioPorKg: 85 }
        ],
        entrega: { tipo: "domicilio", direccion: "Calle Hidalgo 33, Coatepec, Ver.", numeroRastreo: "GC-48377", estado: "en camino" }
    },
    {
        id: 1003, cliente: "María Fernanda Ortiz", fecha: "2026-11-19", estado: "pendiente",
        detalle: [
            { idProducto: 1, kg: 3, precioPorKg: 48 },
            { idProducto: 4, kg: 6, precioPorKg: 18 }
        ],
        entrega: { tipo: "recoleccion", idBodega: 1, diaRecoleccion: "2026-11-22", estado: "por programar" }
    },
    {
        id: 1004, cliente: "Cocina Económica Doña Lupe", fecha: "2026-11-20", estado: "en preparación",
        detalle: [
            { idProducto: 2, kg: 20, precioPorKg: 32 },
            { idProducto: 3, kg: 12, precioPorKg: 28 }
        ],
        entrega: { tipo: "recoleccion", idBodega: 2, diaRecoleccion: "2026-11-23", estado: "por programar" }
    },
    {
        id: 1005, cliente: "Tienda Naturista Verde Vida", fecha: "2026-11-14", estado: "cancelado",
        detalle: [
            { idProducto: 6, kg: 8, precioPorKg: 85 }
        ],
        entrega: { tipo: "domicilio", direccion: "Blvd. Díaz Mirón 410, Veracruz, Ver.", numeroRastreo: "", estado: "cancelada" }
    }
];
