package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.Inventario;
import com.cultivos.gestioncultivos_backend.model.MovimientoInventario;
import com.cultivos.gestioncultivos_backend.repository.MovimientoInventarioRepository;

@Service
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository repositorio;

    public MovimientoInventarioService(MovimientoInventarioRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<MovimientoInventario> listar() {
        return repositorio.buscarTodos();
    }

    public MovimientoInventario obtener(int id) {
        MovimientoInventario movimiento = repositorio.buscarPorId(id);
        if (movimiento == null) {
            throw new NoSuchElementException("No existe el movimiento con id " + id);
        }
        return movimiento;
    }

    public List<MovimientoInventario> listarPorInventario(int idInventario) {
        verificarInventario(idInventario);
        return repositorio.buscarPorInventario(idInventario);
    }

    @Transactional
    public MovimientoInventario crear(MovimientoInventario movimiento) {
        validar(movimiento);
        String tipo = movimiento.getTipoMovimiento().trim().toLowerCase();
        movimiento.setTipoMovimiento(tipo);

        int filas;
        if (tipo.equals("entrada")) {
            filas = repositorio.registrarEntrada(movimiento.getIdInventario(), movimiento.getCantidad());
        } else {
            filas = repositorio.registrarSalida(movimiento.getIdInventario(), movimiento.getCantidad());
        }
        if (filas == 0) {
            throw new IllegalArgumentException("No hay cantidad suficiente para registrar la salida");
        }

        if (movimiento.getFechaMovimiento() == null) {
            movimiento.setFechaMovimiento(LocalDateTime.now());
        }
        movimiento.setIdMovimiento(repositorio.insertar(movimiento));
        return movimiento;
    }

    private void validar(MovimientoInventario movimiento) {
        if (movimiento == null) {
            throw new IllegalArgumentException("Los datos del movimiento son obligatorios");
        }
        if (movimiento.getIdInventario() == null) {
            throw new IllegalArgumentException("El id del inventario es obligatorio");
        }
        verificarInventario(movimiento.getIdInventario());
        if (movimiento.getIdUsuario() == null) {
            throw new IllegalArgumentException("El usuario que registra el movimiento es obligatorio");
        }
        String tipo = movimiento.getTipoMovimiento();
        if (tipo == null || (!tipo.equalsIgnoreCase("entrada") && !tipo.equalsIgnoreCase("salida"))) {
            throw new IllegalArgumentException("El tipo debe ser entrada o salida");
        }
        if (movimiento.getCantidad() == null
                || movimiento.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero");
        }
        if (movimiento.getObservacion() == null || movimiento.getObservacion().isBlank()) {
            throw new IllegalArgumentException("La observación es obligatoria");
        }
        movimiento.setObservacion(movimiento.getObservacion().trim());
    }

    private void verificarInventario(int idInventario) {
        Inventario inventario = repositorio.buscarInventario(idInventario);
        if (inventario == null) {
            throw new NoSuchElementException("No existe el registro de inventario con id " + idInventario);
        }
    }
}
