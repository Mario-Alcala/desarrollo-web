package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Cosecha;
import com.cultivos.gestioncultivos_backend.repository.CosechaRepository;

@Service
public class CosechaService {

    private final CosechaRepository repositorio;

    public CosechaService(CosechaRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Cosecha> listar() {
        return repositorio.buscarTodas();
    }

    public Cosecha obtener(int id) {
        Cosecha cosecha = repositorio.buscarPorId(id);

        if (cosecha == null) {
            throw new NoSuchElementException(
                    "No existe la cosecha con id " + id);
        }

        return cosecha;
    }

    public void crear(Cosecha cosecha) {
        validar(cosecha);
        repositorio.insertar(cosecha);
    }

    public void actualizar(int id, Cosecha cosecha) {
        obtener(id);
        validar(cosecha);
        cosecha.setIdCosecha(id);
        repositorio.actualizar(cosecha);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Cosecha cosecha) {
        if (cosecha == null) {
            throw new IllegalArgumentException("La cosecha es obligatoria");
        }

        if (cosecha.getIdCultivo() == null) {
            throw new IllegalArgumentException("El cultivo es obligatorio");
        }

        if (cosecha.getFechaCosecha() == null) {
            cosecha.setFechaCosecha(LocalDate.now());
        }

        if (cosecha.getCantidadCosechada() == null
                || cosecha.getCantidadCosechada()
                        .compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad cosechada debe ser mayor que cero");
        }
    }
}