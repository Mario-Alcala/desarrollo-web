package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Herramienta;
import com.cultivos.gestioncultivos_backend.repository.HerramientaRepository;

/** Capa de logica de negocio: validaciones y reglas de las herramientas. */
@Service
public class HerramientaService {

    private static final List<String> ESTADOS = List.of("Disponible", "En uso", "Mantenimiento");

    private final HerramientaRepository repositorio;

    public HerramientaService(HerramientaRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Herramienta> listar() {
        return repositorio.buscarTodas();
    }

    public Herramienta obtener(Long id) {
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("No existe la herramienta con id " + id));
    }

    public Herramienta crear(Herramienta herramienta) {
        validar(herramienta);
        herramienta.setId(repositorio.insertar(herramienta));
        return herramienta;
    }

    public Herramienta actualizar(Long id, Herramienta herramienta) {
        validar(herramienta);
        obtener(id);
        herramienta.setId(id);
        repositorio.actualizar(herramienta);
        return herramienta;
    }

    public void eliminar(Long id) {
        if (!repositorio.eliminar(id)) {
            throw new NoSuchElementException("No existe la herramienta con id " + id);
        }
    }

    private void validar(Herramienta herramienta) {
        if (herramienta.getNombre() == null || herramienta.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la herramienta es obligatorio");
        }
        herramienta.setNombre(herramienta.getNombre().trim());
        if (herramienta.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede pasar de 100 caracteres");
        }
        if (herramienta.getCantidad() == null) {
            herramienta.setCantidad(1);
        }
        if (herramienta.getCantidad() < 0) {
            throw new IllegalArgumentException("La cantidad no puede ser negativa");
        }
        if (herramienta.getEstado() == null || herramienta.getEstado().isBlank()) {
            herramienta.setEstado("Disponible");
        }
        if (!ESTADOS.contains(herramienta.getEstado())) {
            throw new IllegalArgumentException("Estado inválido. Valores permitidos: " + String.join(", ", ESTADOS));
        }
    }
}
