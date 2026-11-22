package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    public List<Inventario> listarPorInsumo(int idInsumo) {
        if (!repositorio.existeInsumo(idInsumo)) {
            throw new NoSuchElementException("No existe el insumo con id " + idInsumo);
        }
        return repositorio.buscarPorInsumo(idInsumo);
    }

    public List<Inventario> listarPorCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        String categoriaNormalizada = categoria.trim().toLowerCase();
        if (!List.of("semilla", "abono", "fertilizante").contains(categoriaNormalizada)) {
            throw new IllegalArgumentException("La categoría debe ser semilla, abono o fertilizante");
        }
        return repositorio.buscarPorCategoria(categoriaNormalizada);
    }

    public Inventario obtener(int id) {
        Inventario inventario = repositorio.buscarPorId(id);
        if (inventario == null) {
            throw new NoSuchElementException("No existe el registro de inventario con id " + id);
        }
        return inventario;
    }

    public Inventario crear(Inventario inventario) {
        if (inventario == null) {
            throw new IllegalArgumentException("Los datos del inventario son obligatorios");
        }
        if (inventario.getFechaIngreso() == null) {
            inventario.setFechaIngreso(LocalDate.now());
        }
        validar(inventario);
        inventario.setIdInventario(repositorio.insertar(inventario));
        return repositorio.buscarPorId(inventario.getIdInventario());
    }

    public Inventario actualizar(int id, Inventario inventario) {
        obtener(id);
        validar(inventario);
        if (inventario.getFechaIngreso() == null) {
            throw new IllegalArgumentException("La fecha de ingreso es obligatoria al actualizar");
        }
        inventario.setIdInventario(id);
        repositorio.actualizar(inventario);
        return repositorio.buscarPorId(id);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Inventario inventario) {
        if (inventario == null) {
            throw new IllegalArgumentException("Los datos del inventario son obligatorios");
        }
        if (inventario.getIdInsumo() == null || !repositorio.existeInsumo(inventario.getIdInsumo())) {
            throw new IllegalArgumentException("El id del insumo no existe o es obligatorio");
        }
        if (inventario.getCantidad() == null
                || inventario.getCantidad().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La cantidad debe ser cero o mayor");
        }
        if (inventario.getFechaCaducidad() != null && inventario.getFechaIngreso() != null
                && inventario.getFechaCaducidad().isBefore(inventario.getFechaIngreso())) {
            throw new IllegalArgumentException("La fecha de caducidad no puede ser anterior al ingreso");
        }
    }
}
