package com.cultivos.gestioncultivos_backend.model;

public class PronosticoDiario {

    private String fecha;
    private double temperaturaMaximaCelsius;
    private int probabilidadLluvia;
    private double lluviaEsperadaMm;

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public double getTemperaturaMaximaCelsius() {
        return temperaturaMaximaCelsius;
    }

    public void setTemperaturaMaximaCelsius(double temperaturaMaximaCelsius) {
        this.temperaturaMaximaCelsius = temperaturaMaximaCelsius;
    }

    public int getProbabilidadLluvia() {
        return probabilidadLluvia;
    }

    public void setProbabilidadLluvia(int probabilidadLluvia) {
        this.probabilidadLluvia = probabilidadLluvia;
    }

    public double getLluviaEsperadaMm() {
        return lluviaEsperadaMm;
    }

    public void setLluviaEsperadaMm(double lluviaEsperadaMm) {
        this.lluviaEsperadaMm = lluviaEsperadaMm;
    }
}
