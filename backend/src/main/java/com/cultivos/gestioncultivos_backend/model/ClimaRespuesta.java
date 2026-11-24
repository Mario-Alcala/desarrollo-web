package com.cultivos.gestioncultivos_backend.model;

import java.util.List;

public class ClimaRespuesta {

    private double latitud;
    private double longitud;
    private String horaActualizacion;
    private String fechaPronostico;
    private double temperaturaCelsius;
    private int humedadRelativa;
    private double precipitacionActualMm;
    private double vientoKmH;
    private int probabilidadLluvia;
    private double lluviaEsperadaMm;
    private double temperaturaMaximaCelsius;
    private List<String> sugerencias;
    private List<PronosticoDiario> pronostico;

    public ClimaRespuesta() {
    }

    public double getLatitud() {
        return latitud;
    }

    public void setLatitud(double latitud) {
        this.latitud = latitud;
    }

    public double getLongitud() {
        return longitud;
    }

    public void setLongitud(double longitud) {
        this.longitud = longitud;
    }

    public String getHoraActualizacion() {
        return horaActualizacion;
    }

    public void setHoraActualizacion(String horaActualizacion) {
        this.horaActualizacion = horaActualizacion;
    }

    public String getFechaPronostico() {
        return fechaPronostico;
    }

    public void setFechaPronostico(String fechaPronostico) {
        this.fechaPronostico = fechaPronostico;
    }

    public double getTemperaturaCelsius() {
        return temperaturaCelsius;
    }

    public void setTemperaturaCelsius(double temperaturaCelsius) {
        this.temperaturaCelsius = temperaturaCelsius;
    }

    public int getHumedadRelativa() {
        return humedadRelativa;
    }

    public void setHumedadRelativa(int humedadRelativa) {
        this.humedadRelativa = humedadRelativa;
    }

    public double getPrecipitacionActualMm() {
        return precipitacionActualMm;
    }

    public void setPrecipitacionActualMm(double precipitacionActualMm) {
        this.precipitacionActualMm = precipitacionActualMm;
    }

    public double getVientoKmH() {
        return vientoKmH;
    }

    public void setVientoKmH(double vientoKmH) {
        this.vientoKmH = vientoKmH;
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

    public double getTemperaturaMaximaCelsius() {
        return temperaturaMaximaCelsius;
    }

    public void setTemperaturaMaximaCelsius(double temperaturaMaximaCelsius) {
        this.temperaturaMaximaCelsius = temperaturaMaximaCelsius;
    }

    public List<String> getSugerencias() {
        return sugerencias;
    }

    public void setSugerencias(List<String> sugerencias) {
        this.sugerencias = sugerencias;
    }

    public List<PronosticoDiario> getPronostico() {
        return pronostico;
    }

    public void setPronostico(List<PronosticoDiario> pronostico) {
        this.pronostico = pronostico;
    }
}
