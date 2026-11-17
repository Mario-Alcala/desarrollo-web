package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Abono;
import com.cultivos.gestioncultivos_backend.repository.AbonoRepository;

@Service
public class AbonoService {

    private final AbonoRepository repositorio;

    public AbonoService(AbonoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Abono> listar() {
        return repositorio.buscarTodos();
    }

    public Abono obtener(int id) {
        Abono abono = repositorio.buscarPorId(id);

        if (abono == null) {
            throw new NoSuchElementException(
                    "No existe el abono con id " + id);
        }

        return abono;
    }

    public void crear(Abono abono) {
        validar(abono);
        repositorio.insertar(abono);
    }

    public void actualizar(int id, Abono abono) {
        obtener(id);
        validar(abono);
        abono.setIdAbono(id);
        repositorio.actualizar(abono);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Abono abono) {
        if (abono == null) {
            throw new IllegalArgumentException("El abono es obligatorio");
        }

        if (abono.getNombreAbono() == null
                || abono.getNombreAbono().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del abono es obligatorio");
        }

        if (abono.getTipoAbono() == null
                || abono.getTipoAbono().isBlank()) {
            throw new IllegalArgumentException(
                    "El tipo de abono es obligatorio");
        }

        if (abono.getFechaCaducidad() == null) {
            throw new IllegalArgumentException(
                    "La fecha de caducidad es obligatoria");
        }

        abono.setNombreAbono(abono.getNombreAbono().trim());
        abono.setTipoAbono(abono.getTipoAbono().trim());
    }
}