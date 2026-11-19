/*
 *son datos inventados
 *BORRARLO: cuando el backend entregue terrenos con sus parcelas, este archivo y su
 *   <script> en los HTML ya no hacen falta.
 */

const TERRENOS_EJEMPLO = [
    {
        id: 1, nombre: "El Encino", ubicacion: "Xalapa, Veracruz",
        superficieHa: 0.12, tipoSuelo: "Franco", estado: "Disponible",
        latitud: 19.5438, longitud: -96.9102,
        parcelas: [
            {
                clave: "Parcela A", superficieM2: 400,
                cultivo: { nombre: "Tomate cherry", etapa: "Floración" },
                bitacora: [
                    { fecha: "19 nov", titulo: "Hojas con manchas", detalle: "Observación registrada por trabajador de campo.", tipo: "Observación" },
                    { fecha: "18 nov", titulo: "Plaga detectada", detalle: "Incidencia abierta; requiere seguimiento.", tipo: "Plaga" },
                    { fecha: "17 nov", titulo: "Riego registrado", detalle: "Cantidad y método en su registro.", tipo: "Riego" }
                ]
            },
            {
                clave: "Parcela B", superficieM2: 350,
                cultivo: { nombre: "Maíz", etapa: "Crecimiento" },
                bitacora: [
                    { fecha: "16 nov", titulo: "Riego registrado", detalle: "Riego por goteo.", tipo: "Riego" }
                ]
            },
            { clave: "Parcela C", superficieM2: 450, cultivo: null, bitacora: [] }
        ]
    },
    {
        id: 2, nombre: "La Esperanza", ubicacion: "Coatepec, Veracruz",
        superficieHa: 0.086, tipoSuelo: "Franco arcilloso", estado: "Disponible",
        latitud: 19.4528, longitud: -96.9610,
        parcelas: [
            {
                clave: "Parcela A", superficieM2: 500,
                cultivo: { nombre: "Calabacita", etapa: "Fructificación" },
                bitacora: []
            },
            { clave: "Parcela B", superficieM2: 360, cultivo: null, bitacora: [] }
        ]
    }
];