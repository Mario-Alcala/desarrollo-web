package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.SeguimientoIncidencia;
import com.cultivos.gestioncultivos_backend.service.SeguimientoIncidenciaService;

/**
 * Seguimientos de plagas y enfermedades.
 *  GET  /api/seguimientos-incidencia                 -> todos
 *  GET  /api/seguimientos-incidencia?idIncidencia=3  -> los de una incidencia
 *  POST /api/seguimientos-incidencia                 -> registra la acción (y opcionalmente el nuevo estado)
 */
@RestController
@RequestMapping("/api/seguimientos-incidencia")
public class SeguimientoIncidenciaController {

    private final SeguimientoIncidenciaService servicio;

    public SeguimientoIncidenciaController(SeguimientoIncidenciaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<SeguimientoIncidencia> listar(
            @RequestParam(name = "idIncidencia", required = false) Integer idIncidencia) {
        return servicio.listar(idIncidencia);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeguimientoIncidencia crear(@RequestBody SeguimientoIncidencia seguimiento) {
        return servicio.crear(seguimiento);
    }
}
