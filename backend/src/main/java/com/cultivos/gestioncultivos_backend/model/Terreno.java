package com.cultivos.gestioncultivos_backend.model;

public class Terreno {

    private Long id;
    private String nombre;
    private String ubicacion;
    private Double superficieHa;
    private String tipoSuelo;
    private String estado;

    public Terreno() {
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

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Double getSuperficieHa() {
        return superficieHa;
    }

    public void setSuperficieHa(Double superficieHa) {
        this.superficieHa = superficieHa;
    }

    public String getTipoSuelo() {
        return tipoSuelo;
    }

    public void setTipoSuelo(String tipoSuelo) {
        this.tipoSuelo = tipoSuelo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
