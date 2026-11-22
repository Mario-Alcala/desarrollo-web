package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Fertilizante;
import com.cultivos.gestioncultivos_backend.repository.FertilizanteRepository;

@Service
public class FertilizanteService {

    private final FertilizanteRepository repositorio;

    public FertilizanteService(FertilizanteRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Fertilizante> listar() {
        return repositorio.buscarTodos();
    }

    public Fertilizante obtener(int id) {
        Fertilizante fertilizante = repositorio.buscarPorId(id);

        if (fertilizante == null) {
            throw new NoSuchElementException(
                    "No existe el fertilizante con id " + id);
        }

        return fertilizante;
    }

    public void crear(Fertilizante fertilizante) {
        validar(fertilizante);
        repositorio.insertar(fertilizante);
    }

    public void actualizar(int id, Fertilizante fertilizante) {
        obtener(id);
        validar(fertilizante);
        fertilizante.setIdFertilizante(id);
        repositorio.actualizar(fertilizante);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Fertilizante fertilizante) {
        if (fertilizante == null) {
            throw new IllegalArgumentException(
                    "El fertilizante es obligatorio");
        }

        if (fertilizante.getNombreFertilizante() == null
                || fertilizante.getNombreFertilizante().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del fertilizante es obligatorio");
        }

        if (fertilizante.getTipoFertilizante() == null
                || fertilizante.getTipoFertilizante().isBlank()) {
            throw new IllegalArgumentException(
                    "El tipo de fertilizante es obligatorio");
        }

        if (fertilizante.getFechaCaducidad() == null) {
            throw new IllegalArgumentException(
                    "La fecha de caducidad es obligatoria");
        }

        fertilizante.setNombreFertilizante(
                fertilizante.getNombreFertilizante().trim());
        fertilizante.setTipoFertilizante(
                fertilizante.getTipoFertilizante().trim());
    }
}
