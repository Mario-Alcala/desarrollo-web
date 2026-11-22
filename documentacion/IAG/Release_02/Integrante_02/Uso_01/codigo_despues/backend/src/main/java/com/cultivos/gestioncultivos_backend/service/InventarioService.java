package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Inventario;
import com.cultivos.gestioncultivos_backend.repository.InventarioRepository;

@Service
public class InventarioService {

    private final InventarioRepository repositorio;

    public InventarioService(InventarioRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Inventario> listar() {
        return repositorio.buscarTodos();
    }

    public Inventario obtener(int id) {
        Inventario producto = repositorio.buscarPorId(id);

        if (producto == null) {
            throw new NoSuchElementException(
                    "No existe un producto de inventario con id " + id);
        }

        return producto;
    }

    public void crear(Inventario producto) {
        validar(producto);
        repositorio.insertar(producto);
    }

    public void actualizar(int id, Inventario producto) {
        obtener(id);
        validar(producto);
        producto.setIdInventario(id);
        repositorio.actualizar(producto);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Inventario producto) {
        if (producto == null) {
            throw new IllegalArgumentException("El producto es obligatorio");
        }

        if (producto.getNombreProducto() == null
                || producto.getNombreProducto().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }

        if (producto.getCategoria() == null
                || producto.getCategoria().isBlank()) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }

        if (producto.getCantidad() == null
                || producto.getCantidad().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser cero o mayor");
        }

        if (producto.getUnidadMedida() == null
                || producto.getUnidadMedida().isBlank()) {
            throw new IllegalArgumentException(
                    "La unidad de medida es obligatoria");
        }

        if (producto.getStockMinimo() == null
                || producto.getStockMinimo().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El stock mínimo debe ser cero o mayor");
        }

        if (producto.getIdProveedor() == null) {
            throw new IllegalArgumentException("El proveedor es obligatorio");
        }
    }

    public List<Inventario> buscarPorCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }

        return repositorio.buscarPorCategoria(categoria.trim());
    }
}
