package com.cultivos.gestioncultivos_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Distribucion;
import com.cultivos.gestioncultivos_backend.repository.DistribucionRepository;

@Service
public class DistribucionService {

    private final DistribucionRepository repositorio;

    public DistribucionService(DistribucionRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Distribucion> listar() {
        return repositorio.buscarTodas();
    }

    public Distribucion obtener(int id) {
        Distribucion distribucion = repositorio.buscarPorId(id);

        if (distribucion == null) {
            throw new NoSuchElementException(
                    "No existe la distribución con id " + id);
        }

        return distribucion;
    }

    public void crear(Distribucion distribucion) {
        validar(distribucion);
        repositorio.insertar(distribucion);
    }

    public void actualizar(int id, Distribucion distribucion) {
        obtener(id);
        validar(distribucion);
        distribucion.setIdDistribucion(id);
        repositorio.actualizar(distribucion);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Distribucion distribucion) {
        if (distribucion == null) {
            throw new IllegalArgumentException(
                    "La distribución es obligatoria");
        }

        if (distribucion.getFechaSalida() == null) {
            distribucion.setFechaSalida(LocalDate.now());
        }

        if (distribucion.getDestino() == null
                || distribucion.getDestino().isBlank()) {
            throw new IllegalArgumentException("El destino es obligatorio");
        }

        if (distribucion.getResponsable() == null
                || distribucion.getResponsable().isBlank()) {
            throw new IllegalArgumentException(
                    "El responsable es obligatorio");
        }

        if (distribucion.getEstado() == null
                || distribucion.getEstado().isBlank()) {
            distribucion.setEstado("pendiente");
        }
    }
}
