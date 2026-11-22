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
    { id: 5, nombre: "Estiércol composteado", categoria: "abono", varTipo: "bovino", unidad: "kg", activo: true },
    { id: 6, nombre: "Fertilizante triple 17", categoria: "fertilizante", varTipo: "granulado NPK 17-17-17", unidad: "kg", activo: true },
    { id: 7, nombre: "Fertilizante foliar", categoria: "fertilizante", varTipo: "líquido", unidad: "litros", activo: false }
];
