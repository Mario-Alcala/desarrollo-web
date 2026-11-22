package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Terreno;
import com.cultivos.gestioncultivos_backend.repository.TerrenoRepository;

/** Capa de logica de negocio: validaciones y reglas de los terrenos. */
@Service
public class TerrenoService {

    private static final List<String> ESTADOS = List.of("Disponible", "En uso", "En descanso");

    private final TerrenoRepository repositorio;

    public TerrenoService(TerrenoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Terreno> listar() {
        return repositorio.buscarTodos();
    }

    public Terreno obtener(Long id) {
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("No existe el terreno con id " + id));
    }

    public Terreno crear(Terreno terreno) {
        validar(terreno);
        terreno.setId(repositorio.insertar(terreno));
        return terreno;
    }

    public Terreno actualizar(Long id, Terreno terreno) {
        validar(terreno);
        obtener(id);
        terreno.setId(id);
        repositorio.actualizar(terreno);
        return terreno;
    }

    public void eliminar(Long id) {
        if (!repositorio.eliminar(id)) {
            throw new NoSuchElementException("No existe el terreno con id " + id);
        }
    }

    private void validar(Terreno terreno) {
        if (terreno.getNombre() == null || terreno.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del terreno es obligatorio");
        }
        terreno.setNombre(terreno.getNombre().trim());
        if (terreno.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede pasar de 100 caracteres");
        }
        if (terreno.getSuperficieHa() != null && terreno.getSuperficieHa() < 0) {
            throw new IllegalArgumentException("La superficie no puede ser negativa");
        }
        if (terreno.getEstado() == null || terreno.getEstado().isBlank()) {
            terreno.setEstado("Disponible");
        }
        if (!ESTADOS.contains(terreno.getEstado())) {
            throw new IllegalArgumentException("Estado inválido. Valores permitidos: " + String.join(", ", ESTADOS));
        }
    }
}
