package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

/**
 * Etapa fenológica programada en el calendario de un cultivo (tabla etapas_cultivo).
 * Al completarse, el servicio sincroniza cultivos.etapa_fenologica con esta etapa.
 */
public class EtapaCultivo {

    private Integer idEtapa;
    private Long idCultivo;
    /** Germinación, Siembra, Vegetación/Riego, Floración o Cosecha. */
    private String etapa;
    private LocalDate fechaProgramada;
    private LocalDate fechaReal;
    /** pendiente o completada. */
    private String estado;
    private String notas;
    /** Trabajador que la marcó como completada. */
    private Integer idUsuario;
    /** Solo lectura: nombre del cultivo (JOIN). */
    private String nombreCultivo;

    public EtapaCultivo() {
    }

    public Integer getIdEtapa() { return idEtapa; }
    public void setIdEtapa(Integer idEtapa) { this.idEtapa = idEtapa; }
    public Long getIdCultivo() { return idCultivo; }
    public void setIdCultivo(Long idCultivo) { this.idCultivo = idCultivo; }
    public String getEtapa() { return etapa; }
    public void setEtapa(String etapa) { this.etapa = etapa; }
    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }
    public LocalDate getFechaReal() { return fechaReal; }
    public void setFechaReal(LocalDate fechaReal) { this.fechaReal = fechaReal; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public String getNombreCultivo() { return nombreCultivo; }
    public void setNombreCultivo(String nombreCultivo) { this.nombreCultivo = nombreCultivo; }
}
