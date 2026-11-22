package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Insumo;
import com.cultivos.gestioncultivos_backend.repository.InsumoRepository;

@Service
public class InsumoService {

    private static final List<String> CATEGORIAS = List.of("semilla", "abono", "fertilizante");
    private final InsumoRepository repositorio;

    public InsumoService(InsumoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Insumo> listar(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            return repositorio.buscarTodos();
        }
        String categoriaNormalizada = categoria.trim().toLowerCase();
        validarCategoria(categoriaNormalizada);
        return repositorio.buscarPorCategoria(categoriaNormalizada);
    }

    public Insumo obtener(int id) {
        Insumo insumo = repositorio.buscarPorId(id);
        if (insumo == null) {
            throw new NoSuchElementException("No existe el insumo con id " + id);
        }
        return insumo;
    }

    public Insumo crear(Insumo insumo) {
        validar(insumo);
        insumo.setIdInsumo(repositorio.insertar(insumo));
        return insumo;
    }

    public Insumo actualizar(int id, Insumo insumo) {
        obtener(id);
        validar(insumo);
        insumo.setIdInsumo(id);
        repositorio.actualizar(insumo);
        return insumo;
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Insumo insumo) {
        if (insumo == null) {
            throw new IllegalArgumentException("Los datos del insumo son obligatorios");
        }
        if (insumo.getNombre() == null || insumo.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del insumo es obligatorio");
        }
        insumo.setNombre(insumo.getNombre().trim());
        if (insumo.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede pasar de 100 caracteres");
        }
        if (insumo.getCategoria() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        insumo.setCategoria(insumo.getCategoria().trim().toLowerCase());
        validarCategoria(insumo.getCategoria());
        if (insumo.getUnidadMedida() == null || insumo.getUnidadMedida().isBlank()) {
            throw new IllegalArgumentException("La unidad de medida es obligatoria");
        }
        insumo.setUnidadMedida(insumo.getUnidadMedida().trim());
        if (insumo.getUnidadMedida().length() > 30) {
            throw new IllegalArgumentException("La unidad de medida no puede pasar de 30 caracteres");
        }
    }

    private void validarCategoria(String categoria) {
        if (!CATEGORIAS.contains(categoria)) {
            throw new IllegalArgumentException("La categoría debe ser semilla, abono o fertilizante");
        }
    }
}
