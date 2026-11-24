#!/usr/bin/env bash
set -euo pipefail

PUERTO="${SERVER_PORT:-8081}"
PERFIL_SPRING="${SPRING_PROFILES_ACTIVE:-mysql}"
URL_API="http://127.0.0.1:${PUERTO}/api/terrenos"

puerto_ocupado() {
    ss -ltnH "sport = :${PUERTO}" | grep -q .
}

# Si ya existe una instancia sana, reutilizarla y evitar el error de puerto ocupado.
for intento in {1..45}; do
    if curl --silent --show-error --fail --max-time 2 "$URL_API" >/dev/null 2>&1; then
        echo "El API ya está activo en http://localhost:${PUERTO}; no iniciaré otra instancia."
        exit 0
    fi

    if ! puerto_ocupado; then
        echo "Iniciando Spring Boot con el perfil ${PERFIL_SPRING} en el puerto ${PUERTO}..."
        SPRING_PROFILES_ACTIVE="$PERFIL_SPRING" exec ./mvnw spring-boot:run
    fi

    sleep 1
done

echo "El puerto ${PUERTO} sigue ocupado, pero el API no responde. No detuve ningún proceso."
ss -ltnp "sport = :${PUERTO}" || true
exit 1
