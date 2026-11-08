package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Cultivo {

    private Long id;
    private String nombre;
    private String tipo;
    private String etapaFenologica;
    private LocalDate fechaRegistro;

    public Cultivo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEtapaFenologica() {
        return etapaFenologica;
    }

    public void setEtapaFenologica(String etapaFenologica) {
        this.etapaFenologica = etapaFenologica;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
