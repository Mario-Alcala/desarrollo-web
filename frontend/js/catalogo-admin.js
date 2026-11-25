/**
 * Consulta, filtra y guarda las familias y variedades del catálogo.
 *
 * @author Equipo de Gestión de Cultivos
 */
class CatalogoAdmin {
    /**
     * Prepara las listas del catálogo y los identificadores que se usan al editar.
     */
    constructor() {
        this.familias = [];
        this.variedades = [];
        this.idFamiliaEditando = null;
        this.idVariedadEditando = null;
    }

    /**
     * Envía una solicitud del catálogo.
     *
     * @param ruta - Ruta del recurso en la API.
     * @param [metodo] - Método HTTP.
     * @param [datos] - Datos que se envían como JSON.
     */
    async pedirCatalogo(ruta, metodo, datos) {
        const opciones = { method: metodo || "GET", headers: {} };
        if (datos) {
            opciones.headers["Content-Type"] = "application/json";
            opciones.body = JSON.stringify(datos);
        }

        let respuesta;
        try {
            respuesta = await fetch(API_CATALOGO + ruta, opciones);
        } catch (error) {
            throw new Error("No se pudo conectar con la API. Verifica que Spring Boot esté ejecutándose en el puerto 8081.");
        }

        let cuerpo = {};
        try {
            cuerpo = await respuesta.json();
        } catch (error) {
            cuerpo = {};
        }
        if (!respuesta.ok) {
            if (respuesta.status === 404) {
                throw new Error(`El backend no reconoce ${API_CATALOGO + ruta}. Reinicia Spring Boot para cargar las rutas nuevas del catálogo.`);
            }
            throw new Error(cuerpo.mensaje || cuerpo.error || cuerpo.detalle || `La API respondió con el error HTTP ${respuesta.status}.`);
        }
        return cuerpo;
    }

    /**
     * Consulta las familias y variedades y actualiza la pantalla.
     */
    async cargarCatalogo() {
        mensaje.textContent = "Cargando catálogo…";
        try {
            this.familias = await this.pedirCatalogo("/familias-producto");
            this.variedades = await this.pedirCatalogo("/variedades-producto");
            this.actualizarFiltroNombre();
            this.dibujarCatalogo();
        } catch (error) {
            lista.replaceChildren();
            mensaje.textContent = error.message;
        }
    }

    /**
     * Busca una familia por nombre o la crea en la API.
     *
     * @param nombre - El nombre.
     */
    async obtenerNombreProducto(nombre) {
        const nombreNormalizado = nombre.trim().toLowerCase();
        const existente = this.familias.find(familia => familia.nombre.trim().toLowerCase() === nombreNormalizado);
        if (existente) return existente;

        const familia = await this.pedirCatalogo("/familias-producto", "POST", { nombre: nombre.trim() });
        this.familias.push(familia);
        return familia;
    }

    /**
     * Guarda una variedad nueva o editada.
     *
     * @param evento - El evento del formulario.
     */
    async guardarProducto(evento) {
        evento.preventDefault();
        const aviso = document.getElementById("mensaje-producto");
        aviso.textContent = "";

        const nombre = document.getElementById("producto-nombre").value.trim();
        const nombreVariedad = document.getElementById("producto-variedad").value.trim();
        const datosProducto = {
            nombre: nombreVariedad,
            descripcion: document.getElementById("producto-descripcion").value.trim(),
            imagenUrl: document.getElementById("producto-imagen").value.trim(),
            precioPorKg: Number(document.getElementById("producto-precio").value)
        };

        try {
            let familia;
            if (this.idVariedadEditando && this.idFamiliaEditando !== null) {
                const familiaOriginal = this.familias.find(familia => familia.idFamilia === this.idFamiliaEditando);
                if (familiaOriginal && familiaOriginal.nombre.trim().toLowerCase() === nombre.toLowerCase()) {
                    familia = familiaOriginal;
                } else {
                    familia = await this.obtenerNombreProducto(nombre);
                }
            } else {
                familia = await this.obtenerNombreProducto(nombre);
            }

            datosProducto.idFamilia = familia.idFamilia;
            const ruta = this.idVariedadEditando ? `/variedades-producto/${this.idVariedadEditando}` : "/variedades-producto";
            await this.pedirCatalogo(ruta, this.idVariedadEditando ? "PUT" : "POST", datosProducto);
            dialogoProducto.close();
            formularioProducto.reset();
            this.idFamiliaEditando = null;
            this.idVariedadEditando = null;
            await this.cargarCatalogo();
            mensaje.textContent = "Producto guardado.";
        } catch (error) {
            aviso.textContent = error.message;
        }
    }

    /**
     * Rellena el filtro con los nombres de familia.
     */
    actualizarFiltroNombre() {
        const valorAnterior = filtroNombre.value;
        const opcionTodos = crear("option", "Todos los nombres");
        opcionTodos.value = "";
        filtroNombre.replaceChildren(opcionTodos);
        for (let i = 0; i < this.familias.length; i++) {
            const familia = this.familias[i];
            const opcion = crear("option", familia.nombre);
            opcion.value = String(familia.idFamilia);
            filtroNombre.append(opcion);
        }
        if (this.familias.some(familia => String(familia.idFamilia) === valorAnterior)) {
            filtroNombre.value = valorAnterior;
        }
    }

    /**
     * Muestra el catálogo según el texto y la familia elegidos.
     */
    dibujarCatalogo() {
        const texto = buscador.value.trim().toLowerCase();
        const idFiltro = filtroNombre.value;
        const visibles = [];
        for (let i = 0; i < this.variedades.length; i++) {
            const variedad = this.variedades[i];
            const coincideNombre = !idFiltro || String(variedad.idFamilia) === idFiltro;
            const textoProducto = `${variedad.nombreFamilia} ${variedad.nombre} ${variedad.descripcion || ""}`.toLowerCase();
            const coincideTexto = !texto || textoProducto.includes(texto);
            if (coincideNombre && coincideTexto) visibles.push(variedad);
        }

        lista.replaceChildren();
        for (let i = 0; i < visibles.length; i++) {
            lista.append(this.crearTarjeta(visibles[i]));
        }

        if (visibles.length === 0) {
            lista.append(crear("p", "No hay productos para mostrar.", "vacio"));
        }
        mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "producto" : "productos"}`;
    }

    /**
     * Arma la tarjeta de un producto.
     *
     * @param variedad - Su variedad, familia, imagen y precio.
     */
    crearTarjeta(variedad) {
        const pantalla = this;
        const tarjeta = crear("article", undefined, "tarjeta-producto");
        let imagen;

        if (variedad.imagenUrl) {
            imagen = crear("img", undefined, "imagen-producto imagen-producto-foto");
            imagen.src = variedad.imagenUrl;
            imagen.alt = `${variedad.nombreFamilia} ${variedad.nombre}`;
            imagen.loading = "lazy";
            imagen.onerror = function () {
                const reemplazo = crear("div", "Imagen no disponible", "imagen-producto sin-imagen");
                imagen.replaceWith(reemplazo);
            };
        } else {
            imagen = crear("div", "Sin imagen", "imagen-producto sin-imagen");
        }

        const cuerpo = crear("div", undefined, "cuerpo-producto");
        const titulo = crear("div", undefined, "fila-titulo");
        titulo.append(crear("h3", `${variedad.nombreFamilia} ${variedad.nombre}`));
        cuerpo.append(
            titulo,
            crear("p", variedad.descripcion || "Sin descripción.", "descripcion-producto"),
            crear("p", `${fmtMoneda(variedad.precioPorKg)} / kg`, "precio-producto")
        );

        const pie = crear("div", undefined, "pie-producto");
        pie.append(crear("span", variedad.nombreFamilia));
        pie.append(crearBoton("Editar", "boton boton-secundario boton-chico", function () {
            pantalla.abrirProducto(variedad);
        }));
        cuerpo.append(pie);
        tarjeta.append(imagen, cuerpo);
        return tarjeta;
    }

    /**
     * Abre el formulario del producto.
     *
     * @param variedad - La variedad o null para crear.
     */
    abrirProducto(variedad) {
        this.idVariedadEditando = variedad ? variedad.idVariedad : null;
        this.idFamiliaEditando = variedad ? variedad.idFamilia : null;
        document.getElementById("titulo-producto").textContent = variedad ? "Editar producto" : "Agregar producto";
        document.getElementById("producto-nombre").value = variedad ? variedad.nombreFamilia : "";
        document.getElementById("producto-variedad").value = variedad ? variedad.nombre : "";
        document.getElementById("producto-descripcion").value = variedad ? variedad.descripcion || "" : "";
        document.getElementById("producto-imagen").value = variedad ? variedad.imagenUrl || "" : "";
        document.getElementById("producto-precio").value = variedad ? variedad.precioPorKg : "";
        document.getElementById("mensaje-producto").textContent = "";
        dialogoProducto.showModal();
    }

    /**
     * Conecta los controles de la página y ejecuta la carga inicial.
     */
    iniciarCatalogo() {
        const pantalla = this;
        formularioProducto.addEventListener("submit", this.guardarProducto.bind(this));
        document.getElementById("agregar-producto").addEventListener("click", function () { pantalla.abrirProducto(null); });
        document.getElementById("cancelar-producto").addEventListener("click", function () { dialogoProducto.close(); });
        filtroNombre.addEventListener("change", this.dibujarCatalogo.bind(this));
        buscador.addEventListener("input", this.dibujarCatalogo.bind(this));
        this.cargarCatalogo();
    }
}

const API_CATALOGO = "http://localhost:8081/api";
const lista = document.getElementById("lista-productos");
const mensaje = document.getElementById("mensaje-catalogo");
const buscador = document.querySelector("#topbar input");
const filtroNombre = document.getElementById("filtrar-familia");
const dialogoProducto = document.getElementById("dialogo-producto");
const formularioProducto = document.getElementById("formulario-producto");

const catalogoAdmin = new CatalogoAdmin();

catalogoAdmin.iniciarCatalogo();
