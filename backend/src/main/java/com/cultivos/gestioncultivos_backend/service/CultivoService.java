package com.cultivos.gestioncultivos_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Cultivo;
import com.cultivos.gestioncultivos_backend.repository.CultivoRepository;

/** Capa de logica: validaciones y reglas de los cultivos. */

@Service
public class CultivoService {

    private final CultivoRepository repositorio;

    public CultivoService(CultivoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Cultivo> listar(String etapa) {
        if (etapa == null || etapa.isBlank()) {
            return repositorio.buscarTodos();
        }
        return repositorio.buscarPorEtapa(etapa.trim());
    }

    public Cultivo obtener(Long id) {
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("No existe el cultivo con id: " + id));
    }

    public Cultivo crear(Cultivo cultivo) {
        validar(cultivo);
        if (cultivo.getIdParcela() == null || cultivo.getIdParcela() <= 0) {
            throw new IllegalArgumentException("Selecciona una parcela válida para crear el cultivo.");
        }
        if (cultivo.getFechaRegistro() == null) {
            cultivo.setFechaRegistro(LocalDate.now());
        }
        if (cultivo.getFechaSiembra() == null) cultivo.setFechaSiembra(cultivo.getFechaRegistro());
        if (cultivo.getEstado() == null) cultivo.setEstado("activo");
        cultivo.setId(repositorio.insertar(cultivo));
        return cultivo;
    }

    public Cultivo actualizar(Long id, Cultivo cultivo) {
        validar(cultivo);
        Cultivo actual = obtener(id);
        cultivo.setId(id);
        if (cultivo.getIdParcela() == null) { cultivo.setIdParcela(actual.getIdParcela()); }
        if (cultivo.getIdVariedad() == null) { cultivo.setIdVariedad(actual.getIdVariedad()); }
        if (cultivo.getFechaRegistro() == null) {
            cultivo.setFechaRegistro(actual.getFechaRegistro());
        }
        if (cultivo.getFechaSiembra() == null) cultivo.setFechaSiembra(cultivo.getFechaRegistro());
        if (cultivo.getEstado() == null) cultivo.setEstado(actual.getEstado());
        repositorio.actualizar(cultivo);
        return cultivo;
    }

    public void eliminar(Long id) {
        if (!repositorio.eliminar(id)) {
            throw new NoSuchElementException("No existe el cultivo con id: " + id);
        }
    }

    private void validar(Cultivo cultivo) {
        if (cultivo.getNombre() == null || cultivo.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del cultivo es obligatorio");
        }
        cultivo.setNombre(cultivo.getNombre().trim());
        if (cultivo.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede pasar de 100 caracteres");
        }
        if (cultivo.getIdParcela() == null) {
            throw new IllegalArgumentException("La parcela del cultivo es obligatoria");
        }
        if (cultivo.getIdVariedad() == null || cultivo.getIdVariedad() <= 0) {
            throw new IllegalArgumentException("Selecciona una variedad existente del catálogo");
        }
    }

    
}
