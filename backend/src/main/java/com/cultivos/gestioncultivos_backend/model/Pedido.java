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
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaEntrega;

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
    public LocalDateTime getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDateTime fechaSalida) { this.fechaSalida = fechaSalida; }
    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
}
