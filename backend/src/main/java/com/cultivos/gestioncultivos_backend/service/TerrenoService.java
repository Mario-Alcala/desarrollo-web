package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Terreno;
import com.cultivos.gestioncultivos_backend.repository.TerrenoRepository;

/**
 * Capa de lógica de negocio: validaciones y reglas de los terrenos.
 */
@Service
public class TerrenoService {

    private static final List<String> ESTADOS =
            List.of("disponible", "ocupado");

    private final TerrenoRepository repositorio;

    public TerrenoService(TerrenoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Terreno> listar() {
        return repositorio.buscarTodos();
    }

    public Terreno obtener(Long id) {
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe el terreno con id " + id));
    }

    public Terreno crear(Terreno terreno) {
        validar(terreno);
        terreno.setId(repositorio.insertar(terreno));
        return terreno;
    }

    public Terreno actualizar(Long id, Terreno terreno) {
        obtener(id);
        validar(terreno);
        terreno.setId(id);
        repositorio.actualizar(terreno);
        return terreno;
    }

    public void eliminar(Long id) {
        if (!repositorio.eliminar(id)) {
            throw new NoSuchElementException(
                    "No existe el terreno con id " + id);
        }
    }

    private void validar(Terreno terreno) {
        if (terreno == null) {
            throw new IllegalArgumentException(
                    "Los datos del terreno son obligatorios");
        }

        if (terreno.getNombre() == null
                || terreno.getNombre().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del terreno es obligatorio");
        }

        terreno.setNombre(terreno.getNombre().trim());

        if (terreno.getNombre().length() > 100) {
            throw new IllegalArgumentException(
                    "El nombre no puede pasar de 100 caracteres");
        }

        if (terreno.getSuperficieHa() != null
                && terreno.getSuperficieHa() < 0) {
            throw new IllegalArgumentException(
                    "La superficie no puede ser negativa");
        }

        if ((terreno.getLatitud() == null) != (terreno.getLongitud() == null)) {
            throw new IllegalArgumentException(
                    "Debes registrar latitud y longitud juntas, o dejar ambas vacías");
        }
        if (terreno.getLatitud() != null
                && (terreno.getLatitud() < -90 || terreno.getLatitud() > 90)) {
            throw new IllegalArgumentException("La latitud debe estar entre -90 y 90");
        }
        if (terreno.getLongitud() != null
                && (terreno.getLongitud() < -180 || terreno.getLongitud() > 180)) {
            throw new IllegalArgumentException("La longitud debe estar entre -180 y 180");
        }

        if (terreno.getEstado() == null
                || terreno.getEstado().isBlank()) {
            terreno.setEstado("disponible");
        }
        terreno.setEstado(terreno.getEstado().trim().toLowerCase());

        if (!ESTADOS.contains(terreno.getEstado())) {
            throw new IllegalArgumentException(
                    "Estado inválido. Valores permitidos: "
                            + String.join(", ", ESTADOS));
        }

    }
}
