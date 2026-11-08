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
                "DELETE /api/semillas/{id}"));
        return "index";
    }
}
