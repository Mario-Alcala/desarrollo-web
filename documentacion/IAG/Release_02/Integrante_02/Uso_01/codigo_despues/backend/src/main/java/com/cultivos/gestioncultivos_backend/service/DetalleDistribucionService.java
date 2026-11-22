package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.DetalleDistribucion;
import com.cultivos.gestioncultivos_backend.repository.CosechaRepository;
import com.cultivos.gestioncultivos_backend.repository.DetalleDistribucionRepository;
import com.cultivos.gestioncultivos_backend.repository.DistribucionRepository;

@Service
public class DetalleDistribucionService {

    private final DetalleDistribucionRepository repositorio;
    private final DistribucionRepository distribucionRepositorio;
    private final CosechaRepository cosechaRepositorio;

    public DetalleDistribucionService(
            DetalleDistribucionRepository repositorio,
            DistribucionRepository distribucionRepositorio,
            CosechaRepository cosechaRepositorio) {
        this.repositorio = repositorio;
        this.distribucionRepositorio = distribucionRepositorio;
        this.cosechaRepositorio = cosechaRepositorio;
    }

    public List<DetalleDistribucion> listar() {
        return repositorio.buscarTodos();
    }

    public List<DetalleDistribucion> listarPorDistribucion(int idDistribucion) {
        if (distribucionRepositorio.buscarPorId(idDistribucion) == null) {
            throw new NoSuchElementException(
                    "No existe la distribución con id " + idDistribucion);
        }

        return repositorio.buscarPorDistribucion(idDistribucion);
    }

    public DetalleDistribucion obtener(int id) {
        DetalleDistribucion detalle = repositorio.buscarPorId(id);

        if (detalle == null) {
            throw new NoSuchElementException(
                    "No existe el detalle de distribución con id " + id);
        }

        return detalle;
    }

    public void crear(DetalleDistribucion detalle) {
        validar(detalle);
        repositorio.insertar(detalle);
    }

    public void actualizar(int id, DetalleDistribucion detalle) {
        obtener(id);
        validar(detalle);
        detalle.setIdDetalle(id);
        repositorio.actualizar(detalle);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(DetalleDistribucion detalle) {
        if (detalle == null) {
            throw new IllegalArgumentException(
                    "El detalle de distribución es obligatorio");
        }

        if (detalle.getIdDistribucion() == null
                || distribucionRepositorio.buscarPorId(
                        detalle.getIdDistribucion()) == null) {
            throw new IllegalArgumentException(
                    "La distribución indicada no existe");
        }

        if (detalle.getIdCosecha() == null
                || cosechaRepositorio.buscarPorId(
                        detalle.getIdCosecha()) == null) {
            throw new IllegalArgumentException(
                    "La cosecha indicada no existe");
        }

        if (detalle.getCantidad() == null || detalle.getCantidad() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero");
        }
    }
}
