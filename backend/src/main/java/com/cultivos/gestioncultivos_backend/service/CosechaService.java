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
        if (!repositorio.cultivoActivo(cosecha.getIdCultivo())) {
            throw new IllegalArgumentException("Solo se puede cosechar un cultivo activo");
        }
        // Al crear el lote, todo lo cosechado queda inicialmente disponible en bodega.
        cosecha.setCantidadDisponible(cosecha.getCantidadCosechada());
        repositorio.insertar(cosecha);
        repositorio.finalizarCultivo(cosecha.getIdCultivo());
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

        if (cosecha.getIdUsuario() == null) {
            throw new IllegalArgumentException("El usuario que registra la cosecha es obligatorio");
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

        if (cosecha.getEstadoMaduracion() == null
                || !List.of("verde", "maduro").contains(cosecha.getEstadoMaduracion().trim().toLowerCase())) {
            throw new IllegalArgumentException("La maduración debe ser verde o maduro");
        }
        cosecha.setEstadoMaduracion(cosecha.getEstadoMaduracion().trim().toLowerCase());
        if (cosecha.getUbicacionBodega() == null || cosecha.getUbicacionBodega().isBlank()) {
            throw new IllegalArgumentException("La ubicación en bodega es obligatoria");
        }
        cosecha.setUbicacionBodega(cosecha.getUbicacionBodega().trim());
    }
}
