package com.cultivos.gestioncultivos_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriBuilder;

import com.cultivos.gestioncultivos_backend.model.ClimaRespuesta;

import tools.jackson.databind.JsonNode;

@Service
public class ClimaService {

    private final RestClient climaRestClient;

    public ClimaService(RestClient climaRestClient) {
        this.climaRestClient = climaRestClient;
    }

    public ClimaRespuesta consultar(double latitud, double longitud) {
        try {
            JsonNode datos = climaRestClient.get()
                    .uri(uriBuilder -> construirUrl(uriBuilder, latitud, longitud))
                    .retrieve()
                    .body(JsonNode.class);

            if (datos == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "El servicio meteorológico no devolvió datos");
            }

            JsonNode actual = datos.path("current");
            JsonNode diario = datos.path("daily");

            ClimaRespuesta resultado = new ClimaRespuesta();

            resultado.setLatitud(latitud);
            resultado.setLongitud(longitud);
            resultado.setHoraActualizacion(
                    actual.path("time").asText());
            resultado.setFechaPronostico(
                    diario.path("time").path(0).asText());

            resultado.setTemperaturaCelsius(
                    actual.path("temperature_2m").asDouble());
            resultado.setHumedadRelativa(
                    actual.path("relative_humidity_2m").asInt());
            resultado.setPrecipitacionActualMm(
                    actual.path("precipitation").asDouble());
            resultado.setVientoKmH(
                    actual.path("wind_speed_10m").asDouble());

            resultado.setProbabilidadLluvia(
                    diario.path("precipitation_probability_max")
                            .path(0).asInt());
            resultado.setLluviaEsperadaMm(
                    diario.path("precipitation_sum").path(0).asDouble());
            resultado.setTemperaturaMaximaCelsius(
                    diario.path("temperature_2m_max").path(0).asDouble());

            resultado.setSugerencias(generarSugerencias(resultado));

            return resultado;

        } catch (RestClientException error) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el servicio meteorológico");
        }
    }

    private java.net.URI construirUrl(
            UriBuilder uriBuilder,
            double latitud,
            double longitud) {

        return uriBuilder
                .path("/v1/forecast")
                .queryParam("latitude", latitud)
                .queryParam("longitude", longitud)
                .queryParam(
                        "current",
                        "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m")
                .queryParam(
                        "daily",
                        "precipitation_probability_max,precipitation_sum,temperature_2m_max")
                .queryParam("temperature_unit", "celsius")
                .queryParam("wind_speed_unit", "kmh")
                .queryParam("precipitation_unit", "mm")
                .queryParam("timezone", "America/Mexico_City")
                .build();
    }

    private List<String> generarSugerencias(ClimaRespuesta clima) {
        List<String> sugerencias = new ArrayList<>();

        if (clima.getProbabilidadLluvia() >= 60
                || clima.getLluviaEsperadaMm() >= 5) {
            sugerencias.add(
                    "Hay posibilidad de lluvia. Revisa el riego programado para evitar exceso de agua.");
        } else if (clima.getProbabilidadLluvia() < 20
                && clima.getTemperaturaMaximaCelsius() >= 30) {
            sugerencias.add(
                    "Se pronostica poca lluvia y temperatura alta. Revisa la humedad del suelo antes de regar.");
        } else {
            sugerencias.add(
                    "No hay una alerta de lluvia o calor según las reglas actuales.");
        }

        return sugerencias;
    }
}