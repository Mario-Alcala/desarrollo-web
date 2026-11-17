package com.cultivos.gestioncultivos_backend.model;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cultivos.gestioncultivos_backend.service.ClimaService;

@RestController
@RequestMapping("/api/clima")
public class ClimaController {

    private final ClimaService servicio;

    public ClimaController(ClimaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ClimaRespuesta consultar(
            @RequestParam double latitud,
            @RequestParam double longitud) {

        if (latitud < -90 || latitud > 90) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La latitud debe estar entre -90 y 90");
        }

        if (longitud < -180 || longitud > 180) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La longitud debe estar entre -180 y 180");
        }

        return servicio.consultar(latitud, longitud);
    }
}