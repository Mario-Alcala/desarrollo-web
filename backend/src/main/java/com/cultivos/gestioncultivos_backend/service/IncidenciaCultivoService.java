package com.cultivos.gestioncultivos_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.IncidenciaCultivo;
import com.cultivos.gestioncultivos_backend.repository.IncidenciaCultivoRepository;

@Service
public class IncidenciaCultivoService {

    public static final List<String> ESTADOS = List.of("abierta", "en_seguimiento", "erradicada");

    private final IncidenciaCultivoRepository repositorio;

    public IncidenciaCultivoService(
            IncidenciaCultivoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<IncidenciaCultivo> listar() {
        return repositorio.buscarTodas();
    }

    public IncidenciaCultivo obtener(int id) {
        IncidenciaCultivo incidencia = repositorio.buscarPorId(id);

        if (incidencia == null) {
            throw new NoSuchElementException(
                    "No existe la incidencia con id " + id);
        }

        return incidencia;
    }

    public void crear(IncidenciaCultivo incidencia) {
        validar(incidencia);
        repositorio.insertar(incidencia);
    }

    public void actualizar(int id, IncidenciaCultivo incidencia) {
        IncidenciaCultivo actual = obtener(id);
        // Si la pantalla no manda el estado (por ejemplo, al corregir la descripción), se conserva.
        if (incidencia != null && (incidencia.getEstado() == null || incidencia.getEstado().isBlank())) {
            incidencia.setEstado(actual.getEstado());
        }
        validar(incidencia);
        incidencia.setIdIncidencia(id);
        repositorio.actualizar(incidencia);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(IncidenciaCultivo incidencia) {
        if (incidencia == null) {
            throw new IllegalArgumentException(
                    "La incidencia es obligatoria");
        }

        if (incidencia.getIdCultivo() == null) {
            throw new IllegalArgumentException("El cultivo es obligatorio");
        }

        if (incidencia.getIdUsuario() == null) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }

        if (incidencia.getTipoIncidencia() == null
                || !(incidencia.getTipoIncidencia().equalsIgnoreCase("plaga")
                || incidencia.getTipoIncidencia()
                        .equalsIgnoreCase("enfermedad"))) {
            throw new IllegalArgumentException(
                    "El tipo debe ser plaga o enfermedad");
        }

        if (incidencia.getDescripcion() == null
                || incidencia.getDescripcion().isBlank()) {
            throw new IllegalArgumentException(
                    "La descripción es obligatoria");
        }

        if (incidencia.getNivelGravedad() == null
                || !(incidencia.getNivelGravedad().equalsIgnoreCase("bajo")
                || incidencia.getNivelGravedad().equalsIgnoreCase("medio")
                || incidencia.getNivelGravedad().equalsIgnoreCase("alto"))) {
            throw new IllegalArgumentException(
                    "La gravedad debe ser bajo, medio o alto");
        }

        if (incidencia.getFechaIncidencia() == null) {
            incidencia.setFechaIncidencia(LocalDate.now());
        }

        String estado = incidencia.getEstado() == null || incidencia.getEstado().isBlank()
                ? "abierta"
                : incidencia.getEstado().trim().toLowerCase().replace(' ', '_');
        if (!ESTADOS.contains(estado)) {
            throw new IllegalArgumentException(
                    "El estado debe ser abierta, en_seguimiento o erradicada");
        }
        incidencia.setEstado(estado);

        incidencia.setTipoIncidencia(
                incidencia.getTipoIncidencia().toLowerCase());
        incidencia.setNivelGravedad(
                incidencia.getNivelGravedad().toLowerCase());
        incidencia.setDescripcion(incidencia.getDescripcion().trim());
    }
}