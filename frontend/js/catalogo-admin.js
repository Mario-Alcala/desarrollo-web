const API = "http://localhost:8081/api";
const lista = document.getElementById("lista-productos");
const mensaje = document.getElementById("mensaje-catalogo");
const buscador = document.querySelector("#topbar input");
let cultivos = [];
let cosechas = [];

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const porCultivo = new Map(cultivos.map(c => [String(c.id), c]));
    const visibles = [...porCultivo.values()].filter(p =>
        !q || `${p.nombre} ${p.tipo || ""} ${p.etapaFenologica || ""}`.toLowerCase().includes(q)
    );
    lista.replaceChildren(...visibles.map(p => {
        const lotes = cosechas.filter(l => String(l.idCultivo) === String(p.id));
        const total = lotes.reduce((suma, l) => suma + Number(l.cantidadDisponible || 0), 0);
        const tarjeta = crear("article", undefined, "tarjeta-producto");
        const imagen = crear("div", p.tipo || "Producto", "imagen-producto verdura");
        const cuerpo = crear("div", undefined, "cuerpo-producto");
        cuerpo.append(crear("h3", p.nombre), crear("p", p.etapaFenologica || "Producto de temporada", "descripcion-producto"));
        if (total > 0) {
            const detalle = crear("div", undefined, "lotes-producto");
            lotes.filter(l => Number(l.cantidadDisponible || 0) > 0).forEach(l => {
                const madurez = l.estadoMaduracion ? capitalizar(l.estadoMaduracion) : "Lote";
                detalle.append(crear("p", `${madurez} · ${fmtNum(l.cantidadDisponible)} kg`, "lote-producto"));
            });
            cuerpo.append(detalle, crear("p", `Disponible total: ${fmtNum(total)} kg`, "existencias total-existencias"));
        } else {
            cuerpo.append(crear("p", "Agotado", "existencias"));
        }
        tarjeta.append(imagen, cuerpo);
        return tarjeta;
    }));
    if (visibles.length) mensaje.textContent = `${visibles.length} productos`;
    else if (!mensaje.textContent.startsWith("No se pudo")) mensaje.textContent = "No hay productos para mostrar.";
}

async function cargarCatalogo() {
    mensaje.textContent = "Cargando catálogo…";
    try {
        const [rCultivos, rCosechas] = await Promise.all([fetch(`${API}/cultivos`), fetch(`${API}/cosechas`)]);
        if (!rCultivos.ok || !rCosechas.ok) throw new Error();
        [cultivos, cosechas] = await Promise.all([rCultivos.json(), rCosechas.json()]);
        dibujar();
    } catch {
        cultivos = [];
        cosechas = [];
        dibujar();
        mensaje.textContent = "No se pudo conectar con el API para cargar el catálogo.";
    }
}

buscador.addEventListener("input", dibujar);
window.addEventListener("pageshow", cargarCatalogo);
cargarCatalogo();
