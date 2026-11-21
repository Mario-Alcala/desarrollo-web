package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Cultivo {

    private Long id;
    private Long idParcela;
    private String nombre;
    private String tipo;
    private String familia;
    private String etapaFenologica;
    private LocalDate fechaRegistro;
    private LocalDate fechaSiembra;
    private String estado;

    public Cultivo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdParcela() { return idParcela; }
    public void setIdParcela(Long idParcela) { this.idParcela = idParcela; }

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

    public String getFamilia() { return familia; }
    public void setFamilia(String familia) { this.familia = familia; }

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

    public LocalDate getFechaSiembra() { return fechaSiembra; }
    public void setFechaSiembra(LocalDate fechaSiembra) { this.fechaSiembra = fechaSiembra; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
