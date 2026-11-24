package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.Parcela;
import com.cultivos.gestioncultivos_backend.service.ParcelaService;

@RestController
@RequestMapping("/api/parcelas")
public class ParcelaController {
    private final ParcelaService servicio;

    public ParcelaController(ParcelaService servicio) { this.servicio = servicio; }

    @GetMapping("/terreno/{idTerreno}")
    public List<Parcela> listarPorTerreno(@PathVariable("idTerreno") Long idTerreno) {
        return servicio.listarPorTerreno(idTerreno);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Parcela crear(@RequestBody Parcela parcela) {
        return servicio.crear(parcela);
    }
}
