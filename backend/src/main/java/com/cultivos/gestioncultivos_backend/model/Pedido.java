package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Pedido {
    private Integer idPedido;
    private Integer idUsuario;
    private String cliente;
    private LocalDateTime fechaPedido;
    private String tipoEntrega;
    private String estado;
    private String estadoEntrega;
    private BigDecimal total;
    private Integer cantidadLotes;
    private Boolean compraCatalogo;
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaEntrega;
    private String numeroRastreo;
    private Integer idResponsable;
    private String responsable;
    private String direccionEntrega;
    private java.time.LocalDate fechaRecoleccion;

    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    public String getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getEstadoEntrega() { return estadoEntrega; }
    public void setEstadoEntrega(String estadoEntrega) { this.estadoEntrega = estadoEntrega; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public Integer getCantidadLotes() { return cantidadLotes; }
    public void setCantidadLotes(Integer cantidadLotes) { this.cantidadLotes = cantidadLotes; }
    public Boolean getCompraCatalogo() { return compraCatalogo; }
    public void setCompraCatalogo(Boolean compraCatalogo) { this.compraCatalogo = compraCatalogo; }
    public LocalDateTime getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDateTime fechaSalida) { this.fechaSalida = fechaSalida; }
    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    public String getNumeroRastreo() { return numeroRastreo; }
    public void setNumeroRastreo(String numeroRastreo) { this.numeroRastreo = numeroRastreo; }
    public Integer getIdResponsable() { return idResponsable; }
    public void setIdResponsable(Integer idResponsable) { this.idResponsable = idResponsable; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
    public java.time.LocalDate getFechaRecoleccion() { return fechaRecoleccion; }
    public void setFechaRecoleccion(java.time.LocalDate fechaRecoleccion) { this.fechaRecoleccion = fechaRecoleccion; }
}
