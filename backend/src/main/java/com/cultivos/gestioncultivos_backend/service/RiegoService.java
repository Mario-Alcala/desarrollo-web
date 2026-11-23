package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Riego;
import com.cultivos.gestioncultivos_backend.repository.RiegoRepository;

@Service
public class RiegoService {

    private final RiegoRepository repositorio;

    public RiegoService(RiegoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Riego> listar() {
        return repositorio.buscarTodos();
    }

    public Riego obtener(int id) {
        Riego riego = repositorio.buscarPorId(id);

        if (riego == null) {
            throw new NoSuchElementException(
                    "No existe el riego con id " + id);
        }

        return riego;
    }

    public void crear(Riego riego) {
        validar(riego);
        repositorio.insertar(riego);
    }

    public void actualizar(int id, Riego riego) {
        obtener(id);
        validar(riego);
        riego.setIdRiego(id);
        repositorio.actualizar(riego);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Riego riego) {
        if (riego == null) {
            throw new IllegalArgumentException("El riego es obligatorio");
        }

        if (riego.getIdCultivo() == null) {
            throw new IllegalArgumentException("El cultivo es obligatorio");
        }

        if (riego.getIdUsuario() == null) {
            throw new IllegalArgumentException("El usuario que registra el riego es obligatorio");
        }

        if (riego.getFechaRiego() == null) {
            riego.setFechaRiego(LocalDateTime.now());
        }

        if (riego.getCantidadAgua() == null
                || riego.getCantidadAgua().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad de agua debe ser mayor que cero");
        }

        if (riego.getUnidadMedida() == null
                || riego.getUnidadMedida().isBlank()) {
            throw new IllegalArgumentException(
                    "La unidad de medida es obligatoria");
        }
    }
}
