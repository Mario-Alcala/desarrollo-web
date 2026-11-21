package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.FamiliaProducto;
import com.cultivos.gestioncultivos_backend.repository.FamiliaProductoRepository;

@Service
public class FamiliaProductoService {

    private final FamiliaProductoRepository repositorio;

    public FamiliaProductoService(FamiliaProductoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<FamiliaProducto> listar() {
        return repositorio.buscarTodas();
    }

    public FamiliaProducto obtener(int id) {
        FamiliaProducto familia = repositorio.buscarPorId(id);
        if (familia == null) throw new NoSuchElementException("No existe la familia con id " + id);
        return familia;
    }

    public FamiliaProducto crear(FamiliaProducto familia) {
        validar(familia);
        if (repositorio.existeNombre(familia.getNombre(), 0)) {
            throw new IllegalArgumentException("Ya existe esa familia");
        }
        familia.setIdFamilia(repositorio.insertar(familia));
        return familia;
    }

    public FamiliaProducto actualizar(int id, FamiliaProducto familia) {
        obtener(id);
        validar(familia);
        if (repositorio.existeNombre(familia.getNombre(), id)) {
            throw new IllegalArgumentException("Ya existe esa familia");
        }
        familia.setIdFamilia(id);
        repositorio.actualizar(familia);
        return familia;
    }

    private void validar(FamiliaProducto familia) {
        if (familia == null || familia.getNombre() == null || familia.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la familia es obligatorio");
        }
        familia.setNombre(familia.getNombre().trim());
        if (familia.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre de la familia no puede pasar de 100 caracteres");
        }
    }
}
