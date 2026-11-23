package com.cultivos.gestioncultivos_backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.SeguimientoIncidencia;
import com.cultivos.gestioncultivos_backend.repository.IncidenciaCultivoRepository;
import com.cultivos.gestioncultivos_backend.repository.SeguimientoIncidenciaRepository;

@Service
public class SeguimientoIncidenciaService {

    private final SeguimientoIncidenciaRepository repositorio;
    private final IncidenciaCultivoRepository incidencias;
    private final IncidenciaCultivoService servicioIncidencias;

    public SeguimientoIncidenciaService(SeguimientoIncidenciaRepository repositorio,
            IncidenciaCultivoRepository incidencias,
            IncidenciaCultivoService servicioIncidencias) {
        this.repositorio = repositorio;
        this.incidencias = incidencias;
        this.servicioIncidencias = servicioIncidencias;
    }

    public List<SeguimientoIncidencia> listar(Integer idIncidencia) {
        if (idIncidencia == null) {
            return repositorio.buscarTodos();
        }
        servicioIncidencias.obtener(idIncidencia);
        return repositorio.buscarPorIncidencia(idIncidencia);
    }

    @Transactional
    public SeguimientoIncidencia crear(SeguimientoIncidencia seguimiento) {
        validar(seguimiento);
        servicioIncidencias.obtener(seguimiento.getIdIncidencia());
        seguimiento.setIdSeguimiento(repositorio.insertar(seguimiento));
        if (seguimiento.getEstadoIncidencia() != null) {
            incidencias.cambiarEstado(seguimiento.getIdIncidencia(), seguimiento.getEstadoIncidencia());
        }
        return seguimiento;
    }

    private void validar(SeguimientoIncidencia seguimiento) {
        if (seguimiento == null) {
            throw new IllegalArgumentException("Los datos del seguimiento son obligatorios");
        }
        if (seguimiento.getIdIncidencia() == null) {
            throw new IllegalArgumentException("La incidencia es obligatoria");
        }
        if (seguimiento.getIdUsuario() == null) {
            throw new IllegalArgumentException("El trabajador que registra el seguimiento es obligatorio");
        }
        if (seguimiento.getAccionRealizada() == null || seguimiento.getAccionRealizada().isBlank()) {
            throw new IllegalArgumentException("Describe la acción realizada");
        }
        seguimiento.setAccionRealizada(seguimiento.getAccionRealizada().trim());
        if (seguimiento.getObservacion() != null) {
            String observacion = seguimiento.getObservacion().trim();
            seguimiento.setObservacion(observacion.isEmpty() ? null : observacion);
        }
        if (seguimiento.getFecha() == null) {
            seguimiento.setFecha(LocalDate.now());
        }
        if (seguimiento.getFecha().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha del seguimiento no puede ser futura");
        }
        String estado = seguimiento.getEstadoIncidencia();
        if (estado != null && !estado.isBlank()) {
            estado = estado.trim().toLowerCase().replace(' ', '_');
            if (!IncidenciaCultivoService.ESTADOS.contains(estado)) {
                throw new IllegalArgumentException(
                        "El estado debe ser abierta, en_seguimiento o erradicada");
            }
            seguimiento.setEstadoIncidencia(estado);
        } else {
            seguimiento.setEstadoIncidencia(null);
        }
    }
}
