package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Semilla;
import com.cultivos.gestioncultivos_backend.repository.SemillaRepository;

@Service
public class SemillaService {

    private final SemillaRepository repositorio;

    public SemillaService(SemillaRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Semilla> listar() {
        return repositorio.buscarTodas();
    }

    public Semilla obtener(Long id) {
        Semilla semilla = repositorio.buscarPorId(id);
        if (semilla == null) {
            throw new NoSuchElementException("No existe la semilla con id " + id);
        }
        return semilla;
    }

    public Semilla crear(Semilla semilla) {
        validar(semilla);
        semilla.setId(repositorio.insertar(semilla));
        return semilla;
    }

    public Semilla actualizar(Long id, Semilla semilla) {
        obtener(id);
        validar(semilla);
        semilla.setId(id);
        repositorio.actualizar(semilla);
        return semilla;
    }

    public void eliminar(Long id) {
        if (!repositorio.eliminar(id)) {
            throw new NoSuchElementException("No existe la semilla con id " + id);
        }
    }

    private void validar(Semilla semilla) {
        if (semilla == null) {
            throw new IllegalArgumentException("Los datos de la semilla son obligatorios");
        }
        if (semilla.getNombre() == null || semilla.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la semilla es obligatorio");
        }
        semilla.setNombre(semilla.getNombre().trim());
        if (semilla.getUnidadMedida() == null || semilla.getUnidadMedida().isBlank()) {
            throw new IllegalArgumentException("La unidad de medida es obligatoria");
        }
        semilla.setUnidadMedida(semilla.getUnidadMedida().trim());
    }
}
