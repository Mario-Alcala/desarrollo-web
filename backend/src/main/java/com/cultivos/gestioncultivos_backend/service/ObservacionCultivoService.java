package com.cultivos.gestioncultivos_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.ObservacionCultivo;
import com.cultivos.gestioncultivos_backend.repository.ObservacionCultivoRepository;

@Service
public class ObservacionCultivoService {

    private final ObservacionCultivoRepository repositorio;

    public ObservacionCultivoService(
            ObservacionCultivoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<ObservacionCultivo> listar() {
        return repositorio.buscarTodas();
    }

    public ObservacionCultivo obtener(int id) {
        ObservacionCultivo observacion = repositorio.buscarPorId(id);

        if (observacion == null) {
            throw new NoSuchElementException(
                    "No existe la observación con id " + id);
        }

        return observacion;
    }

    public void crear(ObservacionCultivo observacion) {
        validar(observacion);
        repositorio.insertar(observacion);
    }

    public void actualizar(int id, ObservacionCultivo observacion) {
        obtener(id);
        validar(observacion);
        observacion.setIdObservacion(id);
        repositorio.actualizar(observacion);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(ObservacionCultivo observacion) {
        if (observacion == null) {
            throw new IllegalArgumentException(
                    "La observación es obligatoria");
        }

        if (observacion.getIdCultivo() == null) {
            throw new IllegalArgumentException(
                    "El cultivo es obligatorio");
        }

        if (observacion.getIdUsuario() == null) {
            throw new IllegalArgumentException(
                    "El usuario es obligatorio");
        }

        if (observacion.getDescripcion() == null
                || observacion.getDescripcion().isBlank()) {
            throw new IllegalArgumentException(
                    "La descripción es obligatoria");
        }

        if (observacion.getFechaObservacion() == null) {
            observacion.setFechaObservacion(LocalDate.now());
        }

        observacion.setDescripcion(observacion.getDescripcion().trim());
    }
}