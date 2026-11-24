# API · Inscripción a talleres culturales

URL base: `http://localhost:3002`. Verifica con `GET /api/health`, que devuelve `{"status":"UP"}`.

## Autenticación

| Método y ruta | Cuerpo de ejemplo | Respuesta |
|---|---|---|
| `POST /api/auth/register` | `{"name":"Ana","email":"ana@example.test","password":"Practica123"}` | `201` con `name` y `email` |
| `POST /api/auth/login` | `{"email":"estudiante@example.test","password":"Practica123"}` | `200` con `token` |

También puedes usar `companero@example.test` con la misma contraseña. El registro requiere nombre de hasta 100 caracteres, correo válido de hasta 254 caracteres y contraseña de 8–72 caracteres ASCII. Envía `Content-Type: application/json` en solicitudes con cuerpo y `Authorization: Bearer <token>` en las rutas de negocio.

## Consultas

- `GET /api/workshops?page=1&size=5` devuelve `{"items":[...],"page":1,"size":5,"totalItems":12,"totalPages":3}` con los registros del caso. La cuenta de prueba tiene 12 registros iniciales. La página empieza en 1. El tamaño admitido es de 1 a 50. Una página fuera del rango devuelve una lista vacía.
- `GET /api/workshops/1` devuelve un registro con ID numérico y los datos del detalle.

Ejemplo de un elemento en `items`:

```json
{"id":1,"name":"Taller 1","discipline":"Cerámica","date":"2026-12-01","vacancies":8}
```

El detalle conserva esos campos y añade `sessions: [{ "id": 1, "startsAt": "10:00", "vacancies": 4 }]`.

## Operación principal

`POST /api/workshops/1/enrollments` con el cuerpo `{"sessionId":1,"experienceLevel":"BEGINNER"}`. Devuelve `201` con el resultado. Tras inscribirte, actualiza las vacantes del taller.

Ejemplo de respuesta exitosa:

```json
{"sessionId":1,"experienceLevel":"BEGINNER"}
```

## Errores

El cuerpo siempre tiene `code` y `message` en los errores de la API documentados. Los estados son `400` (entrada inválida), `401` (sesión inválida o ausente), `404` (registro inexistente o inaccesible) y `409` (conflicto o correo ya registrado).

Para provocar el conflicto evaluado, parte de los datos iniciales. Inscríbete dos veces en la sesión 1 del taller 1 con la misma cuenta.

El conflicto evaluado devuelve el código `ALREADY_ENROLLED`. El token dura dos horas y se invalida al reiniciar el backend.
Una sesión sin vacantes devuelve `409 SESSION_FULL`.

## Prueba rápida con curl

Inicia sesión y consulta la primera página. Copia el valor de `token` de la primera respuesta en la segunda petición.

```bash
curl -sS http://localhost:3002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"estudiante@example.test","password":"Practica123"}'

curl -sS 'http://localhost:3002/api/workshops?page=1&size=5' \
  -H 'Authorization: Bearer REEMPLAZA_CON_EL_TOKEN'
```
