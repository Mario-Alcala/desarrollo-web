package com.cultivos.gestioncultivos_backend.model;

public class Parcela {
    private Long idParcela;
    private Long idTerreno;
    private String nombre;
    private Double superficieM2;
    private String estado;
    private Long idCultivo;
    private String cultivoNombre;
    private String etapaFenologica;

    public Long getIdParcela() { return idParcela; }
    public void setIdParcela(Long idParcela) { this.idParcela = idParcela; }
    public Long getIdTerreno() { return idTerreno; }
    public void setIdTerreno(Long idTerreno) { this.idTerreno = idTerreno; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Double getSuperficieM2() { return superficieM2; }
    public void setSuperficieM2(Double superficieM2) { this.superficieM2 = superficieM2; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Long getIdCultivo() { return idCultivo; }
    public void setIdCultivo(Long idCultivo) { this.idCultivo = idCultivo; }
    public String getCultivoNombre() { return cultivoNombre; }
    public void setCultivoNombre(String cultivoNombre) { this.cultivoNombre = cultivoNombre; }
    public String getEtapaFenologica() { return etapaFenologica; }
    public void setEtapaFenologica(String etapaFenologica) { this.etapaFenologica = etapaFenologica; }
}
