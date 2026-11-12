package com.cultivos.gestioncultivos_backend.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejo centralizado de errores de la API REST.
 */

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** 404: el id solicitado no existe. */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(NoSuchElementException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /** 400: validaciones de los servicios (nombre vacio, stock negativo, etc.). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> datoInvalido(IllegalArgumentException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** 400: el JSON recibido esta mal formado o tiene un tipo/fecha incorrecto. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException ex) {
        return respuesta(HttpStatus.BAD_REQUEST,
                "El cuerpo de la peticion no es un JSON valido (las fechas usan el formato AAAA-MM-DD)");
    }

    /** 400: MySQL rechazo el dato (texto demasiado largo, nulo en columna obligatoria...). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex) {
        log.warn("Dato rechazado por la base de datos: {}", ex.getMostSpecificCause().getMessage());
        return respuesta(HttpStatus.BAD_REQUEST,
                "La base de datos rechazo el dato (revisa longitudes y campos obligatorios)");
    }

    /** 500: falla de base de datos (MySQL apagado, tablas sin crear, credenciales...). */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> baseDeDatos(DataAccessException ex) {
        log.error("Error de acceso a la base de datos", ex);
        // "detalle" muestra la causa real para diagnosticar en desarrollo.
        // Quitar antes de entregar/publicar si no se quiere exponer.
        String detalle = ex.getClass().getSimpleName() + ": " + ex.getMostSpecificCause().getMessage();
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR,
                "No se pudo acceder a la base de datos. Verifica que MySQL este encendido "
                        + "y que se haya ejecutado database/init.sql",
                detalle);
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje) {
        return respuesta(estado, mensaje, null);
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje, String detalle) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("fecha", LocalDateTime.now().toString());
        cuerpo.put("estado", estado.value());
        cuerpo.put("mensaje", mensaje);
        if (detalle != null) {
            cuerpo.put("detalle", detalle);
        }
        return ResponseEntity.status(estado).body(cuerpo);
    }
}