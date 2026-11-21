package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/** Pagina de inicio del backend, renderizada con una plantilla Thymeleaf (templates/index.html). */

@Controller
public class HomeController {

    @GetMapping("/")
    public String inicio(Model model) {
        model.addAttribute("titulo", "Gestión de Cultivos - API REST");
        model.addAttribute("endpoints", List.of(
                "GET /api/cultivos (opcional: ?etapa=Siembra)",
                "GET /api/cultivos/{id}",
                "POST /api/cultivos",
                "PUT /api/cultivos/{id}",
                "DELETE /api/cultivos/{id}",
                "GET /api/semillas",
                "GET /api/semillas/{id}",
                "POST /api/semillas",
                "PUT /api/semillas/{id}",
                "DELETE /api/semillas/{id}",
                "GET /api/insumos (opcional: ?categoria=semilla|abono|fertilizante)",
                "GET /api/insumos/{id}",
                "POST /api/insumos",
                "PUT /api/insumos/{id}",
                "DELETE /api/insumos/{id}",
                "GET /api/familias-producto",
                "POST /api/familias-producto",
                "PUT /api/familias-producto/{id}",
                "GET /api/variedades-producto (opcional: ?idFamilia=1)",
                "POST /api/variedades-producto",
                "PUT /api/variedades-producto/{id}",
                "GET /api/inventario",
                "GET /api/inventario/{id}",
                "GET /api/inventario/insumo/{idInsumo}",
                "POST /api/inventario",
                "PUT /api/inventario/{id}",
                "DELETE /api/inventario/{id}",
                "GET /api/movimientos-inventario",
                "POST /api/movimientos-inventario",
                "GET /api/proveedores",
                "GET /api/terrenos",
                "GET /api/terrenos/{id}",
                "POST /api/terrenos",
                "PUT /api/terrenos/{id}",
                "DELETE /api/terrenos/{id}",
                "GET /api/herramientas",
                "GET /api/herramientas/{id}",
                "POST /api/herramientas",
                "PUT /api/herramientas/{id}",
                "DELETE /api/herramientas/{id}"));
        return "index";
    }
}
