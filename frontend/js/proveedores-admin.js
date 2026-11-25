/**
 * Consulta, busca y guarda proveedores mediante la API.
 *
 * @author Equipo de Gestión de Cultivos
 */
class ProveedoresAdmin {
    /**
     * Prepara la lista de proveedores y el estado de la edición.
     */
    constructor() {
        this.proveedores = [];
        this.editando = null;
    }

    /**
     * Consulta los proveedores y actualiza la tabla.
     */
    async cargarProveedores() {
        mensaje.textContent = "Cargando proveedores…";
        try {
            const respuesta = await fetch(API_PROVEEDORES);
            if (!respuesta.ok) throw new Error("No se pudo consultar el API de proveedores.");
            this.proveedores = await respuesta.json();
            this.dibujar();
        } catch (error) {
            this.proveedores = [];
            this.dibujar();
            mensaje.textContent = "No se pudieron cargar los proveedores desde el API. Comprueba que el backend esté conectado.";
        }
    }

    /**
     * Envía el proveedor nuevo o editado a la API.
     *
     * @param evento - El evento del formulario.
     */
    async guardarProveedor(evento) {
        evento.preventDefault();
        msgFormulario.textContent = "";
        const datos = {
            nombreEmpresa: document.getElementById("pv-empresa").value.trim(),
            contacto: document.getElementById("pv-contacto").value.trim(),
            telefono: document.getElementById("pv-telefono").value.trim(),
            email: document.getElementById("pv-email").value.trim(),
            direccion: document.getElementById("pv-direccion").value.trim()
        };
        try {
            const respuesta = await fetch(this.editando === null ? API_PROVEEDORES : `${API_PROVEEDORES}/${this.editando}`, {
                method: this.editando === null ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) {
                let error = {};
                try { error = await respuesta.json(); } catch (noEsJson) { error = {}; }
                throw new Error(error.mensaje || "No se pudo guardar el proveedor.");
            }
            dialogo.close();
            await this.cargarProveedores();
        } catch (error) {
            msgFormulario.textContent = error.message;
        }
    }

    /**
     * Muestra los proveedores que coinciden con el texto buscado.
     */
    dibujar() {
        const pantalla = this;
        const q = buscador.value.trim().toLowerCase();
        const visibles = [];
        for (let i = 0; i < this.proveedores.length; i++) {
            const proveedor = this.proveedores[i];
            const texto = `${proveedor.nombreEmpresa || ""} ${proveedor.contacto || ""} ${proveedor.telefono || ""} ${proveedor.email || ""} ${proveedor.direccion || ""}`.toLowerCase();
            if (!q || texto.includes(q)) visibles.push(proveedor);
        }

        cabecera.replaceChildren();
        const nombresColumnas = ["Empresa", "Contacto", "Teléfono", "Correo", "Dirección", "Acciones"];
        for (let i = 0; i < nombresColumnas.length; i++) {
            cabecera.append(crear("th", nombresColumnas[i]));
        }

        cuerpo.replaceChildren();
        for (let i = 0; i < visibles.length; i++) {
            const p = visibles[i];
            const fila = crear("tr");
            fila.append(crear("td", p.nombreEmpresa));
            fila.append(crear("td", p.contacto || "—"));
            fila.append(crear("td", p.telefono || "—"));
            fila.append(crear("td", p.email || "—"));
            fila.append(crear("td", p.direccion || "—"));
            const acciones = crear("td");
            acciones.append(crearBoton("Editar", "boton boton-secundario boton-chico", function () { pantalla.abrir(p); }));
            fila.append(acciones);
            cuerpo.append(fila);
        }
        if (visibles.length) mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "proveedor" : "proveedores"}`;
        else if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay proveedores para mostrar.";
    }

    /**
     * Abre el formulario de proveedor.
     *
     * @param p - El proveedor a editar o null para crear.
     */
    abrir(p) {
        this.editando = p ? p.idProveedor : null;
        document.getElementById("titulo-proveedor").textContent = p ? "Editar proveedor" : "Agregar proveedor";
        msgFormulario.textContent = "";
        formulario.reset();
        if (p) {
            document.getElementById("pv-empresa").value = p.nombreEmpresa || "";
            document.getElementById("pv-contacto").value = p.contacto || "";
            document.getElementById("pv-telefono").value = p.telefono || "";
            document.getElementById("pv-email").value = p.email || "";
            document.getElementById("pv-direccion").value = p.direccion || "";
        }
        dialogo.showModal();
    }

    /**
     * Conecta los controles de la página y ejecuta la carga inicial.
     */
    iniciarProveedores() {
        const pantalla = this;
        formulario.addEventListener("submit", this.guardarProveedor.bind(this));
        document.getElementById("agregar-proveedor").addEventListener("click", function () { pantalla.abrir(null); });
        document.getElementById("cancelar-proveedor").addEventListener("click", function () { dialogo.close(); });
        buscador.addEventListener("input", this.dibujar.bind(this));
        this.cargarProveedores();
    }
}

const API_PROVEEDORES = "http://localhost:8081/api/proveedores";
const buscador = document.querySelector("#topbar input");
const mensaje = document.getElementById("mensaje-prov");
const cabecera = document.getElementById("tabla-cabecera");
const cuerpo = document.getElementById("tabla-cuerpo");
const dialogo = document.getElementById("dialogo-proveedor");
const formulario = document.getElementById("formulario-proveedor");
const msgFormulario = document.getElementById("mensaje-proveedor");

const proveedoresAdmin = new ProveedoresAdmin();

proveedoresAdmin.iniciarProveedores();
