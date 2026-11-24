package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.EtapaCultivo;
import com.cultivos.gestioncultivos_backend.service.EtapaCultivoService;

/**
 * Calendario de etapas de cultivo.
 *  GET    /api/etapas-cultivo                -> todas
 *  GET    /api/etapas-cultivo?idCultivo=1    -> las de un cultivo
 *  POST   /api/etapas-cultivo                -> programa una etapa
 *  PUT    /api/etapas-cultivo/{id}           -> reprograma (fecha, etapa, notas)
 *  PUT    /api/etapas-cultivo/{id}/completar -> {"idUsuario":2,"fechaReal":"2026-11-22"}; sincroniza el cultivo
 *  DELETE /api/etapas-cultivo/{id}           -> elimina una etapa pendiente
 */
@RestController
@RequestMapping("/api/etapas-cultivo")
public class EtapaCultivoController {

    private final EtapaCultivoService servicio;

    public EtapaCultivoController(EtapaCultivoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<EtapaCultivo> listar(@RequestParam(name = "idCultivo", required = false) Long idCultivo) {
        return servicio.listar(idCultivo);
    }

    @GetMapping("/{id}")
    public EtapaCultivo obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EtapaCultivo crear(@RequestBody EtapaCultivo etapa) {
        return servicio.crear(etapa);
    }

    @PutMapping("/{id}")
    public EtapaCultivo actualizar(@PathVariable("id") int id, @RequestBody EtapaCultivo etapa) {
        return servicio.actualizar(id, etapa);
    }

    @PutMapping("/{id}/completar")
    public EtapaCultivo completar(@PathVariable("id") int id, @RequestBody EtapaCultivo datos) {
        return servicio.completar(id, datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}
