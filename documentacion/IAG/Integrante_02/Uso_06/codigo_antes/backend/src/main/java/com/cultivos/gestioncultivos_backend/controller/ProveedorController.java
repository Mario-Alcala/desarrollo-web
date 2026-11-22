package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.Proveedor;
import com.cultivos.gestioncultivos_backend.service.ProveedorService;

@RestController 
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService servicio;

    public ProveedorController(ProveedorService servicio) {
        this.servicio = servicio;
    }

    @GetMapping 
    public List<Proveedor> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Proveedor obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    public void crear(@RequestBody Proveedor proveedor) {
        servicio.crear(proveedor);
    }

    @PutMapping("/{id}")
    public void actualizar(@PathVariable("id") int id, @RequestBody Proveedor proveedor) {
        servicio.actualizar(id, proveedor);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }


    
}
