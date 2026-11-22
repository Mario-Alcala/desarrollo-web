package com.cultivos.gestioncultivos_backend.service;

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

    public MovimientoInventarioService(
            MovimientoInventarioRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<MovimientoInventario> listar() {
        return repositorio.buscarTodos();
    }

    public MovimientoInventario obtener(int id) {
        MovimientoInventario movimiento = repositorio.buscarPorId(id);

        if (movimiento == null) {
            throw new NoSuchElementException(
                    "No existe el movimiento con id " + id);
        }

        return movimiento;
    }

    public List<MovimientoInventario> listarPorInventario(int idInventario) {
        verificarInventario(idInventario);
        return repositorio.buscarPorInventario(idInventario);
    }

    @Transactional
    public void crear(MovimientoInventario movimiento) {
        validar(movimiento);

        String tipo = movimiento.getTipoMovimiento()
                .trim()
                .toLowerCase();

        movimiento.setTipoMovimiento(tipo);

        int filasActualizadas;

        if (tipo.equals("entrada")) {
            filasActualizadas = repositorio.registrarEntrada(
                    movimiento.getIdInventario(),
                    movimiento.getCantidad());
        } else {
            filasActualizadas = repositorio.registrarSalida(
                    movimiento.getIdInventario(),
                    movimiento.getCantidad());
        }

        if (filasActualizadas == 0) {
            throw new IllegalArgumentException(
                    "No se pudo registrar la salida: revisa el inventario y la cantidad disponible");
        }

        repositorio.insertar(movimiento);
    }

    private void validar(MovimientoInventario movimiento) {
        if (movimiento == null) {
            throw new IllegalArgumentException(
                    "El movimiento es obligatorio");
        }

        if (movimiento.getIdInventario() == null) {
            throw new IllegalArgumentException(
                    "El id del inventario es obligatorio");
        }

        verificarInventario(movimiento.getIdInventario());

        if (movimiento.getTipoMovimiento() == null
                || (!movimiento.getTipoMovimiento().equalsIgnoreCase("entrada")
                && !movimiento.getTipoMovimiento().equalsIgnoreCase("salida"))) {
            throw new IllegalArgumentException(
                    "El tipo debe ser entrada o salida");
        }

        if (movimiento.getCantidad() == null
                || movimiento.getCantidad() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero");
        }
    }

    private void verificarInventario(int idInventario) {
        Inventario inventario = repositorio.buscarInventario(idInventario);

        if (inventario == null) {
            throw new NoSuchElementException(
                    "No existe el producto de inventario con id " + idInventario);
        }
    }
}
