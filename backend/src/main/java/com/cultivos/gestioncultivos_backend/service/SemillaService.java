package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Semilla;
import com.cultivos.gestioncultivos_backend.repository.SemillaRepository;

/** Capa de logica: validaciones y reglas del banco de semillas. */

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
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("No existe la semilla con id " + id));
    }

    public Semilla crear(Semilla semilla) {
        validar(semilla);
        semilla.setId(repositorio.insertar(semilla));
        return semilla;
    }

    public Semilla actualizar(Long id, Semilla semilla) {
        validar(semilla);
        obtener(id);
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
        if (semilla.getVariedad() == null || semilla.getVariedad().isBlank()) {
            throw new IllegalArgumentException("La variedad de la semilla es obligatoria");
        }
        semilla.setVariedad(semilla.getVariedad().trim());
        if (semilla.getVariedad().length() > 100) {
            throw new IllegalArgumentException("La variedad no puede pasar de 100 caracteres");
        }
        if (semilla.getStockDisponible() == null) {
            semilla.setStockDisponible(0);
        }
        if (semilla.getStockDisponible() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
    }
}
