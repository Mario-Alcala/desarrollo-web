package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.VariedadProducto;
import com.cultivos.gestioncultivos_backend.repository.VariedadProductoRepository;

@Service
public class VariedadProductoService {

    private final VariedadProductoRepository repositorio;

    public VariedadProductoService(VariedadProductoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<VariedadProducto> listar(Integer idFamilia) {
        return repositorio.buscarTodas(idFamilia);
    }

    public VariedadProducto obtener(int id) {
        VariedadProducto variedad = repositorio.buscarPorId(id);
        if (variedad == null) throw new NoSuchElementException("No existe la variedad con id " + id);
        return variedad;
    }

    public VariedadProducto crear(VariedadProducto variedad) {
        validar(variedad);
        if (repositorio.existeNombre(variedad.getIdFamilia(), variedad.getNombre(), 0)) {
            throw new IllegalArgumentException("Ya existe esa variedad dentro de la familia seleccionada");
        }
        variedad.setIdVariedad(repositorio.insertar(variedad));
        return repositorio.buscarPorId(variedad.getIdVariedad());
    }

    public VariedadProducto actualizar(int id, VariedadProducto variedad) {
        obtener(id);
        validar(variedad);
        if (repositorio.existeNombre(variedad.getIdFamilia(), variedad.getNombre(), id)) {
            throw new IllegalArgumentException("Ya existe esa variedad dentro de la familia seleccionada");
        }
        variedad.setIdVariedad(id);
        repositorio.actualizar(variedad);
        return repositorio.buscarPorId(id);
    }

    private void validar(VariedadProducto variedad) {
        if (variedad == null) throw new IllegalArgumentException("Los datos de la variedad son obligatorios");
        if (variedad.getIdFamilia() == null || !repositorio.existeFamilia(variedad.getIdFamilia())) {
            throw new IllegalArgumentException("Selecciona una familia existente");
        }
        if (variedad.getNombre() == null || variedad.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la variedad es obligatorio");
        }
        variedad.setNombre(variedad.getNombre().trim());
        if (variedad.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre de la variedad no puede pasar de 100 caracteres");
        }
        if (variedad.getDescripcion() != null && variedad.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede pasar de 500 caracteres");
        }
        if (variedad.getImagenUrl() != null && variedad.getImagenUrl().length() > 500) {
            throw new IllegalArgumentException("El enlace de imagen no puede pasar de 500 caracteres");
        }
        if (variedad.getPrecioPorKg() == null
                || variedad.getPrecioPorKg().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio por kilogramo debe ser mayor que cero");
        }
    }
}
