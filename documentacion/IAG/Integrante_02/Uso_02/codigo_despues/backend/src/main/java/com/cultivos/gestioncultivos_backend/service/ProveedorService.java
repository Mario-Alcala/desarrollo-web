package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Proveedor;
import com.cultivos.gestioncultivos_backend.repository.ProveedorRepository;

@Service
public class ProveedorService {

    private final ProveedorRepository repositorio;

    public ProveedorService(ProveedorRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Proveedor> listar() {
        return repositorio.buscarTodos();
    }

    public Proveedor obtener(int id) {
        Proveedor proveedor = repositorio.buscarPorId(id);

        if (proveedor == null) {
            throw new NoSuchElementException(
                    "No existe ese proveedor con ese id " + id);
        }

        return proveedor;
    }

    public void crear(Proveedor proveedor) {
        validar(proveedor);
        repositorio.insertar(proveedor);
    }

    public void actualizar(int id, Proveedor proveedor) {
        if (repositorio.buscarPorId(id) == null) {
            throw new NoSuchElementException(
                    "No existe el proveedor con id " + id);
        }

        validar(proveedor);
        proveedor.setIdProveedor(id);
        repositorio.actualizar(proveedor);
    }

    public void eliminar(int id) {
        if (repositorio.buscarPorId(id) == null) {
            throw new NoSuchElementException(
                    "No existe el proveedor con id " + id);
        }

        repositorio.eliminar(id);
    }

    private void validar(Proveedor proveedor) {
        if (proveedor == null) {
            throw new IllegalArgumentException("El proveedor es obligatorio");
        }

        if (proveedor.getNombreEmpresa() == null
                || proveedor.getNombreEmpresa().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la empresa es obligatorio");
        }
    }
}
