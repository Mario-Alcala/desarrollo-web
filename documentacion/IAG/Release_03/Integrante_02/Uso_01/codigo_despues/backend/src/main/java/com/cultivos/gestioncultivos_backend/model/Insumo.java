package com.cultivos.gestioncultivos_backend.model;

public class Insumo {

    private Integer idInsumo;
    private String nombre;
    private String categoria;
    private String unidadMedida;
    private Integer idProveedor;

    public Insumo() {
    }

    public Integer getIdInsumo() { return idInsumo; }
    public void setIdInsumo(Integer idInsumo) { this.idInsumo = idInsumo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public Integer getIdProveedor() { return idProveedor; }
    public void setIdProveedor(Integer idProveedor) { this.idProveedor = idProveedor; }
}
