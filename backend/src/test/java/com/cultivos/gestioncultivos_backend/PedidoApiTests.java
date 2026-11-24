package com.cultivos.gestioncultivos_backend;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PedidoApiTests {
    @LocalServerPort int port;
    @Autowired JdbcClient jdbc;
    @Autowired PasswordEncoder encoder;
    HttpClient cliente;

    @BeforeEach
    void preparar() throws Exception {
        for (String tabla : new String[]{"distribuciones", "detalle_pedido", "pedidos", "cosechas", "cultivos", "variedades_producto", "familias_producto", "parcelas", "terrenos", "usuarios"}) {
            jdbc.sql("DELETE FROM " + tabla).update();
        }
        jdbc.sql("INSERT INTO usuarios VALUES (1, 'Cliente uno', 'uno@prueba.test', :clave, 'cliente'), (2, 'Cliente dos', 'dos@prueba.test', :clave, 'cliente')")
                .param("clave", encoder.encode("clave-prueba")).update();
        jdbc.sql("INSERT INTO terrenos VALUES (1, 'Terreno prueba', 'Prueba', 100, 'ocupado')").update();
        jdbc.sql("INSERT INTO parcelas VALUES (1, 1, 'Parcela prueba', 100, 'ocupada')").update();
        jdbc.sql("INSERT INTO familias_producto VALUES (1, 'Hortaliza')").update();
        jdbc.sql("INSERT INTO variedades_producto VALUES (1, 1, 'Tomate', 'Descripción', '/tomate.png', 20.50)").update();
        jdbc.sql("INSERT INTO cultivos (id, id_parcela, id_variedad, nombre, estado) VALUES (1, 1, 1, 'Tomate cultivo', 'activo')").update();
        jdbc.sql("INSERT INTO cosechas (id_cosecha,id_cultivo,id_usuario,fecha_cosecha,cantidad_cosechada,cantidad_disponible,estado_maduracion) VALUES (1,1,1,CURRENT_DATE,10,10,'Maduro'), (2,1,1,CURRENT_DATE,2,2,'Verde')").update();
        cliente = login("uno@prueba.test");
    }

    HttpClient login(String correo) throws Exception {
        HttpClient c = HttpClient.newBuilder().cookieHandler(new CookieManager()).build();
        var respuesta = enviar(c, "/usuarios/login", "{\"correoElectronico\":\"" + correo + "\",\"contrasena\":\"clave-prueba\"}");
        assertEquals(200, respuesta.statusCode());
        assertFalse(respuesta.body().contains("contrasena"));
        return c;
    }

    HttpRequest solicitud(String ruta, String json) {
        var b = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api" + ruta));
        if (json != null) { b.header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)); }
        return b.build();
    }

    HttpResponse<String> enviar(HttpClient c, String ruta, String json) throws Exception {
        return c.send(solicitud(ruta, json), HttpResponse.BodyHandlers.ofString());
    }

    String pedido(String kilos) {
        return "{\"metodoPago\":\"transferencia\",\"tipoEntrega\":\"recoleccion\",\"fechaRecoleccion\":\"" + LocalDate.now().plusDays(1)
                + "\",\"detalles\":[{\"idCosecha\":1,\"kilos\":" + kilos + "}]}";
    }

    int cuenta(String tabla) {
        return jdbc.sql("SELECT COUNT(*) FROM " + tabla).query(Integer.class).single();
    }

    BigDecimal disponible() {
        return jdbc.sql("SELECT cantidad_disponible FROM cosechas WHERE id_cosecha=1").query(BigDecimal.class).single();
    }

    HttpClient personal() throws Exception {
        jdbc.sql("INSERT INTO usuarios VALUES (3, 'Empacador', 'personal@prueba.test', :clave, 'trabajador')")
                .param("clave", encoder.encode("clave-prueba")).update();
        return login("personal@prueba.test");
    }

    @Test
    void personalRegistraPedidoParaClienteYConservaPreciosDelServidor() throws Exception {
        var trabajador = personal();
        String json = "{\"idUsuario\":2," + pedido("1.25").substring(1);
        var resultado = enviar(trabajador, "/pedidos/registro", json);
        assertEquals(201, resultado.statusCode(), resultado.body());
        assertEquals(2, jdbc.sql("SELECT id_usuario FROM pedidos").query(Integer.class).single());
        assertEquals(0, disponible().compareTo(new BigDecimal("8.75")));
        assertEquals(0, jdbc.sql("SELECT total FROM pedidos").query(BigDecimal.class).single().compareTo(new BigDecimal("25.63")));
        assertEquals(200, enviar(trabajador, "/pedidos", null).statusCode());
        assertEquals(403, enviar(cliente, "/pedidos/registro", json).statusCode());
        assertEquals(401, enviar(HttpClient.newHttpClient(), "/pedidos/registro", json).statusCode());
        assertEquals(400, enviar(trabajador, "/pedidos/registro", json.replace("\"idUsuario\":2", "\"idUsuario\":3")).statusCode());
        assertEquals(400, enviar(trabajador, "/pedidos/registro", pedido("1")).statusCode());
        assertEquals(1, cuenta("pedidos"));
    }

    @Test
    void empacadorRegistraKilosYEntregaSinSuplantarResponsable() throws Exception {
        var trabajador = personal();
        jdbc.sql("INSERT INTO pedidos (id_pedido,id_usuario,metodo_pago,tipo_entrega,estado,total) VALUES (99,1,'transferencia','recoleccion','pendiente',0)").update();
        assertEquals(400, enviar(trabajador, "/pedidos/99/lotes", "{\"idCosecha\":1,\"kilos\":0.001}").statusCode());
        assertEquals(201, enviar(trabajador, "/pedidos/99/lotes", "{\"idCosecha\":1,\"kilos\":2}").statusCode());
        assertEquals(3, jdbc.sql("SELECT id_usuario FROM distribuciones WHERE id_pedido=99").query(Integer.class).single());
        assertEquals(0, disponible().compareTo(new BigDecimal("8")));
        for (String estado : new String[]{"listo_recoleccion", "entregado"}) {
            var req = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/pedidos/99/entrega"))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString("{\"estado\":\"" + estado + "\",\"idUsuario\":\"2\"}")).build();
            var resultado = trabajador.send(req, HttpResponse.BodyHandlers.ofString());
            assertEquals(204, resultado.statusCode(), resultado.body());
        }
        assertEquals(3, jdbc.sql("SELECT id_usuario FROM distribuciones WHERE id_pedido=99").query(Integer.class).single());
        assertEquals("entregado", jdbc.sql("SELECT estado FROM pedidos WHERE id_pedido=99").query(String.class).single());
        assertEquals(400, enviar(trabajador, "/pedidos/99/lotes", "{\"idCosecha\":1,\"kilos\":1}").statusCode());
    }

    @Test
    void corsPermiteCookiesYPreflightSoloDesdeOrigenesConfigurados() throws Exception {
        for (String origen : new String[]{"http://localhost:5500", "http://127.0.0.1:5501", "https://no-permitido.test"}) {
            var req = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/pedidos/registro"))
                    .header("Origin", origen).header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "content-type")
                    .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
            var resultado = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
            if (origen.startsWith("https")) {
                assertEquals(403, resultado.statusCode());
            } else {
                assertEquals(200, resultado.statusCode());
                assertEquals(origen, resultado.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
                assertEquals("true", resultado.headers().firstValue("Access-Control-Allow-Credentials").orElse(""));
            }
        }
    }

    @Test
    void logoutInvalidaLaSesionHttpAunqueElClienteConserveLaCookie() throws Exception {
        var trabajador = personal();
        assertEquals(200, enviar(trabajador, "/pedidos", null).statusCode());
        assertEquals(204, enviar(trabajador, "/usuarios/logout", "{}").statusCode());
        assertEquals(401, enviar(trabajador, "/pedidos", null).statusCode());
    }

    @Test
    void catalogoConLotesDecimalesYPreciosDelServidor() throws Exception {
        var catalogo = enviar(cliente, "/catalogo", null);
        assertEquals(200, catalogo.statusCode());
        assertTrue(catalogo.body().contains("maduracion"));
        assertTrue(catalogo.body().contains("precioPorKg"), catalogo.body());
        assertTrue(catalogo.body().contains("Tomate"));
        var resultado = enviar(cliente, "/pedidos", pedido("1.25"));
        assertEquals(201, resultado.statusCode(), resultado.body());
        assertEquals(0, disponible().compareTo(new BigDecimal("8.75")));
        assertEquals(0, jdbc.sql("SELECT total FROM pedidos").query(BigDecimal.class).single().compareTo(new BigDecimal("25.63")));
        assertEquals(1, cuenta("distribuciones"));
        assertEquals(1, cuenta("detalle_pedido"));
        assertEquals(0, jdbc.sql("SELECT precio_unitario FROM detalle_pedido").query(BigDecimal.class).single().compareTo(new BigDecimal("20.50")));
    }

    @Test
    void domicilioYHistorialSoloDelClienteAutenticado() throws Exception {
        String json = "{\"idUsuario\":2,\"total\":0.01,\"metodoPago\":\"tarjeta\",\"tipoEntrega\":\"domicilio\",\"direccion\":\"Calle prueba 10\",\"detalles\":[{\"idCosecha\":1,\"kilos\":0.50,\"precioKilo\":0.01}]}";
        assertEquals(201, enviar(cliente,"/pedidos",json).statusCode());
        assertEquals(1, jdbc.sql("SELECT id_usuario FROM pedidos").query(Integer.class).single());
        assertEquals("Calle prueba 10",jdbc.sql("SELECT direccion_entrega FROM distribuciones").query(String.class).single());
        assertEquals(0, jdbc.sql("SELECT COUNT(*) FROM distribuciones WHERE fecha_recoleccion IS NOT NULL OR numero_rastreo1 IS NOT NULL").query(Integer.class).single());
        assertTrue(enviar(cliente,"/pedidos/cliente/1",null).body().contains("Tomate"));
        assertEquals("[]",enviar(login("dos@prueba.test"),"/pedidos/cliente/2",null).body());
        assertEquals(403,enviar(cliente,"/pedidos/cliente/2",null).statusCode());
        assertEquals(401,enviar(HttpClient.newHttpClient(),"/pedidos",null).statusCode());
        assertEquals(401,enviar(HttpClient.newHttpClient(),"/pedidos",pedido("1")).statusCode());
    }

    @Test
    void rechazaCantidadesFechasYStockInvalidos() throws Exception {
        for (String kilos : new String[]{"0","-1","0.001","11"}) {
            assertEquals(400,enviar(cliente,"/pedidos",pedido(kilos)).statusCode());
        }
        assertEquals(400,enviar(cliente,"/pedidos",pedido("1").replace(LocalDate.now().plusDays(1).toString(),LocalDate.now().minusDays(1).toString())).statusCode());
        assertEquals(0,cuenta("pedidos"));
        assertEquals(0,disponible().compareTo(new BigDecimal("10")));
    }

    @Test
    void rollbackSiFallaElDetalleDespuesDeInsertarPedidoYEntrega() throws Exception {
        jdbc.sql("ALTER TABLE detalle_pedido ADD CONSTRAINT prueba_fallo CHECK (cantidad < 2)").update();
        try {
            assertEquals(400,enviar(cliente,"/pedidos",pedido("2")).statusCode());
            assertEquals(0,cuenta("pedidos")); assertEquals(0,cuenta("distribuciones"));
            assertEquals(0,cuenta("detalle_pedido"));
            assertEquals(0,disponible().compareTo(new BigDecimal("10")));
        } finally { jdbc.sql("ALTER TABLE detalle_pedido DROP CONSTRAINT prueba_fallo").update(); }
    }

    @Test
    void dosPedidosConcurrentesNoVendenMasStockDelDisponible() throws Exception {
        var uno = cliente.sendAsync(solicitud("/pedidos",pedido("7")),HttpResponse.BodyHandlers.ofString());
        var dos = cliente.sendAsync(solicitud("/pedidos",pedido("7")),HttpResponse.BodyHandlers.ofString());
        CompletableFuture.allOf(uno,dos).join();
        assertTrue((uno.join().statusCode()==201 && dos.join().statusCode()==400)
                || (uno.join().statusCode()==400 && dos.join().statusCode()==201));
        assertEquals(1,cuenta("pedidos"));
        assertEquals(0,disponible().compareTo(new BigDecimal("3")));
    }

    @Test
    void unLoteRepetidoSeSumaAntesDeValidarExistencias() throws Exception {
        String repetido = pedido("6").replace("}]", "},{\"idCosecha\":1,\"kilos\":6}]");
        assertEquals(400,enviar(cliente,"/pedidos",repetido).statusCode());
        assertEquals(0,cuenta("pedidos"));
    }
}
