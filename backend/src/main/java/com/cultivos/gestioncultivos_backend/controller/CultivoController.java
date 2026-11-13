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

import com.cultivos.gestioncultivos_backend.model.Cultivo;
import com.cultivos.gestioncultivos_backend.service.CultivoService;

/** API REST de cultivos: GET, POST, PUT y DELETE sobre /api/cultivos. 
 *  GET /api/cultivos               -> todos
 *  GET /api/cultivos?etapa=Siembra -> filtrados por Query String
**/

@RestController
@RequestMapping("/api/cultivos")
public class CultivoController {

    private final CultivoService servicio;

    public CultivoController(CultivoService servicio) {
        this.servicio = servicio;
    }
    
    @GetMapping
    public List<Cultivo> listar(@RequestParam(name = "etapa", required = false) String etapa) {
        return servicio.listar(etapa);
    }

    @GetMapping("/{id}")
    public Cultivo obtener(@PathVariable("id") Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cultivo crear(@RequestBody Cultivo cultivo) {
        return servicio.crear(cultivo);
    }

    @PutMapping("/{id}")
    public Cultivo actualizar(@PathVariable("id") Long id, @RequestBody Cultivo cultivo) {
        return servicio.actualizar(id, cultivo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        servicio.eliminar(id);
    }
}
