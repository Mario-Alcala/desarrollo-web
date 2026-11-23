package com.cultivos.gestioncultivos_backend.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.Cultivo;
import com.cultivos.gestioncultivos_backend.model.EtapaCultivo;
import com.cultivos.gestioncultivos_backend.repository.CultivoRepository;
import com.cultivos.gestioncultivos_backend.repository.EtapaCultivoRepository;

/**
 * Calendario de etapas: germinación, siembra, vegetación/riego, floración y cosecha.
 * Reglas:
 *  - Una sola fecha programada por etapa y cultivo.
 *  - Las fechas respetan el orden de las etapas (una etapa no queda antes que la anterior).
 *  - Al completar una etapa, cultivos.etapa_fenologica se actualiza (sincronización con la
 *    pantalla de cultivos) y, si es Siembra y el cultivo no tenía fecha, se guarda la fecha real.
 */
@Service
public class EtapaCultivoService {

    public static final List<String> ETAPAS = List.of(
            "Germinación", "Siembra", "Vegetación/Riego", "Floración", "Cosecha");

    private final EtapaCultivoRepository repositorio;
    private final CultivoRepository cultivos;

    public EtapaCultivoService(EtapaCultivoRepository repositorio, CultivoRepository cultivos) {
        this.repositorio = repositorio;
        this.cultivos = cultivos;
    }

    public List<EtapaCultivo> listar(Long idCultivo) {
        if (idCultivo == null) {
            return repositorio.buscarTodas();
        }
        obtenerCultivo(idCultivo);
        return repositorio.buscarPorCultivo(idCultivo);
    }

    public EtapaCultivo obtener(int id) {
        EtapaCultivo etapa = repositorio.buscarPorId(id);
        if (etapa == null) {
            throw new NoSuchElementException("No existe la etapa con id " + id);
        }
        return etapa;
    }

    public EtapaCultivo crear(EtapaCultivo etapa) {
        validar(etapa, null);
        int id = repositorio.insertar(etapa);
        return obtener(id);
    }

    public EtapaCultivo actualizar(int id, EtapaCultivo etapa) {
        EtapaCultivo actual = obtener(id);
        if ("completada".equals(actual.getEstado())) {
            throw new IllegalArgumentException("La etapa ya se completó; no se puede reprogramar");
        }
        if (etapa == null) {
            throw new IllegalArgumentException("Los datos de la etapa son obligatorios");
        }
        etapa.setIdCultivo(actual.getIdCultivo());
        validar(etapa, id);
        etapa.setIdEtapa(id);
        repositorio.actualizar(etapa);
        return obtener(id);
    }

    @Transactional
    public EtapaCultivo completar(int id, EtapaCultivo datos) {
        EtapaCultivo etapa = obtener(id);
        if ("completada".equals(etapa.getEstado())) {
            throw new IllegalArgumentException("La etapa ya estaba completada");
        }
        if (datos == null || datos.getIdUsuario() == null) {
            throw new IllegalArgumentException("El trabajador que completa la etapa es obligatorio");
        }
        LocalDate fechaReal = datos.getFechaReal() == null ? LocalDate.now() : datos.getFechaReal();
        if (fechaReal.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("No se puede completar una etapa con fecha futura");
        }
        Cultivo cultivo = obtenerCultivo(etapa.getIdCultivo());

        repositorio.completar(id, fechaReal, datos.getIdUsuario());

        // Sincronización: el cultivo avanza a esta etapa si es igual o posterior a la que tenía.
        int indiceNueva = ETAPAS.indexOf(etapa.getEtapa());
        int indiceActual = indiceEtapa(cultivo.getEtapaFenologica());
        if (indiceNueva >= indiceActual) {
            repositorio.cambiarEtapaDelCultivo(etapa.getIdCultivo(), etapa.getEtapa());
        }
        if ("Siembra".equals(etapa.getEtapa())) {
            repositorio.fijarFechaSiembraSiFalta(etapa.getIdCultivo(), fechaReal);
        }
        return obtener(id);
    }

    public void eliminar(int id) {
        EtapaCultivo etapa = obtener(id);
        if ("completada".equals(etapa.getEstado())) {
            throw new IllegalArgumentException("No se puede eliminar una etapa completada");
        }
        repositorio.eliminar(id);
    }

    private void validar(EtapaCultivo etapa, Integer idExcluir) {
        if (etapa == null) {
            throw new IllegalArgumentException("Los datos de la etapa son obligatorios");
        }
        if (etapa.getIdCultivo() == null) {
            throw new IllegalArgumentException("Selecciona un cultivo");
        }
        Cultivo cultivo = obtenerCultivo(etapa.getIdCultivo());
        if ("finalizado".equals(cultivo.getEstado())) {
            throw new IllegalArgumentException("El cultivo está finalizado; no se le pueden programar etapas");
        }
        int indice = indiceEtapa(etapa.getEtapa());
        if (indice < 0) {
            throw new IllegalArgumentException(
                    "La etapa debe ser Germinación, Siembra, Vegetación/Riego, Floración o Cosecha");
        }
        etapa.setEtapa(ETAPAS.get(indice));
        if (etapa.getFechaProgramada() == null) {
            throw new IllegalArgumentException("La fecha programada es obligatoria");
        }
        if (etapa.getNotas() != null) {
            String notas = etapa.getNotas().trim();
            if (notas.length() > 500) {
                throw new IllegalArgumentException("Las notas no pueden pasar de 500 caracteres");
            }
            etapa.setNotas(notas.isEmpty() ? null : notas);
        }
        // Las etapas posteriores a la siembra no pueden quedar antes de la fecha de siembra del cultivo.
        if (indice > ETAPAS.indexOf("Siembra") && cultivo.getFechaSiembra() != null
                && etapa.getFechaProgramada().isBefore(cultivo.getFechaSiembra())) {
            throw new IllegalArgumentException("La " + etapa.getEtapa()
                    + " no puede programarse antes de la siembra (" + cultivo.getFechaSiembra() + ")");
        }

        for (EtapaCultivo otra : repositorio.buscarPorCultivo(etapa.getIdCultivo())) {
            if (idExcluir != null && idExcluir.equals(otra.getIdEtapa())) {
                continue;
            }
            int indiceOtra = indiceEtapa(otra.getEtapa());
            LocalDate fechaOtra = otra.getFechaReal() != null ? otra.getFechaReal() : otra.getFechaProgramada();
            if (indiceOtra == indice) {
                throw new IllegalArgumentException("Este cultivo ya tiene programada la etapa "
                        + etapa.getEtapa() + "; edita esa fecha en lugar de crear otra");
            }
            if (indiceOtra < indice && etapa.getFechaProgramada().isBefore(fechaOtra)) {
                throw new IllegalArgumentException("La " + etapa.getEtapa() + " no puede quedar antes de "
                        + otra.getEtapa() + " (" + fechaOtra + ")");
            }
            if (indiceOtra > indice && etapa.getFechaProgramada().isAfter(fechaOtra)) {
                throw new IllegalArgumentException("La " + etapa.getEtapa() + " no puede quedar después de "
                        + otra.getEtapa() + " (" + fechaOtra + ")");
            }
        }
    }

    private Cultivo obtenerCultivo(Long idCultivo) {
        return cultivos.buscarPorId(idCultivo)
                .orElseThrow(() -> new NoSuchElementException("No existe el cultivo con id " + idCultivo));
    }

    /** Busca la etapa sin importar mayúsculas ni acentos ("floracion" = "Floración"). */
    static int indiceEtapa(String texto) {
        if (texto == null) {
            return -1;
        }
        String buscado = simplificar(texto);
        for (int i = 0; i < ETAPAS.size(); i++) {
            String etapa = simplificar(ETAPAS.get(i));
            if (etapa.equals(buscado) || etapa.startsWith(buscado + "/")) {
                return i;
            }
        }
        return -1;
    }

    private static String simplificar(String texto) {
        String sinAcentos = Normalizer.normalize(texto.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinAcentos.toLowerCase().replace(" ", "");
    }
}
