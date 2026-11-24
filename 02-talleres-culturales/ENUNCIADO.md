# Simulacro 02 · Inscripción a talleres culturales

**Desarrollo Basado en Plataformas · Pregrado 2026-2**

**Pregunta práctica · 12 puntos**

## Caso

El área de cultura necesita facilitar la inscripción de estudiantes a sus talleres. Cada taller tiene una disciplina, una fecha y sesiones con horarios y vacantes propias. Desarrolla una aplicación web que permita registrarse, iniciar sesión, consultar la oferta e inscribirse en una sesión indicando el nivel de experiencia del estudiante.

## Indicaciones

- Implementa una aplicación web para escritorio con React, TypeScript, React Router, Axios y Tailwind.
- Consume los servicios descritos en el contrato de API incluido al final del enunciado.

## Funcionalidades requeridas

### 1. Autenticación y navegación (2 puntos)

#### Página de registro (`/register`) (0.5 puntos)

- Mostrar un formulario con nombre, correo y contraseña.
- Exigir un nombre no vacío de hasta 100 caracteres, un correo válido y una contraseña de 8 a 72 caracteres ASCII.
- Consumir `POST /api/auth/register` para registrar al usuario.
- Después del registro exitoso, redirigir a `/login`.
- Incluir un enlace para ir al login.

#### Página de login (`/login`) (0.5 puntos)

- Mostrar un formulario con correo y contraseña.
- Consumir `POST /api/auth/login` y mostrar feedback si las credenciales son incorrectas.
- Guardar el JWT recibido en `localStorage` y enviarlo como `Authorization: Bearer <token>` en las peticiones protegidas.
- Después del login exitoso, redirigir a `/workshops`.
- Incluir un enlace para ir al registro.

#### Rutas protegidas y cierre de sesión (1 punto)

- Restringir el listado y el detalle a usuarios con sesión.
- Incluir una acción para cerrar sesión manualmente.
- Al cerrar sesión, limpiar el token y redirigir a `/login`.

### 2. Dashboard de talleres culturales (`/workshops`) (3 puntos)

#### Consulta y visualización (1 punto)

- Consumir `GET /api/workshops?page=1&size=5` para obtener el listado paginado.
- Mostrar los siguientes datos en cada tarjeta o fila.

    - Nombre del taller.
    - Disciplina.
    - Fecha.
    - Cantidad de vacantes.

- Permitir abrir `/workshops/:id` desde el elemento seleccionado.

#### Paginación (1 punto)

- Incluir los botones Anterior y Siguiente.
- Mostrar la página actual y el total de páginas devueltos por la API.
- Deshabilitar Anterior en la primera página y Siguiente cuando no exista una página siguiente. Si el listado está vacío, deshabilitar ambos controles.
- Consultar al servidor cada vez que cambie la página.

#### Estados del listado (1 punto)

- Mostrar un indicador de carga mientras se consulta la API.
- Mostrar un mensaje cuando el listado esté vacío.

### 3. Detalle y inscripción (`/workshops/:id`) (4 puntos)

#### Consulta del detalle (1 punto)

- Obtener el identificador desde la ruta y consumir `GET /api/workshops/:id`.
- Mostrar la información del taller seleccionado.
- Mostrar las sesiones con su identificador, hora de inicio y vacantes disponibles.

#### Formulario y validación (1 punto)

Implementar los siguientes campos.

- Sesión, mediante un selector.
- Nivel de experiencia, mediante un selector con las opciones inicial, intermedio y avanzado.

Antes de enviar el formulario, aplicar las siguientes validaciones y mostrar los errores junto a los campos correspondientes.

- Exigir la selección de una sesión.
- Exigir un nivel de experiencia y enviarlo con el valor correspondiente de la API, BEGINNER, INTERMEDIATE o ADVANCED.

#### Envío y resultado (2 puntos)

Consumir `POST /api/workshops/:id/enrollments` con los siguientes campos en el cuerpo JSON.

- `sessionId`, identificador de la sesión elegida.
- `experienceLevel`, nivel de experiencia seleccionado.

Procesar la respuesta de la API de la siguiente manera.

- Volver a consultar el detalle del taller después de una inscripción exitosa.
- Actualizar las vacantes del taller y de sus sesiones con los datos del servidor.

### 4. Manejo de errores y presentación (3 puntos)

#### Sesión inválida (1 punto)

- Ante una respuesta `401 Unauthorized` en una petición protegida, limpiar la sesión.
- Redirigir al usuario a `/login`.

#### Manejo de conflictos (1 punto)

- Ante una respuesta `409 Conflict` con código `ALREADY_ENROLLED`, mostrar «Ya tienes una inscripción en esta sesión.» junto al formulario.

#### Componentes e interfaz (1 punto)

- Organizar la interfaz con componentes reutilizables y props tipadas.
- Usar Tailwind para construir una presentación legible.
- Etiquetar los campos del formulario y agrupar los controles de paginación.

**Puntaje total · 12 puntos.**

## Contrato de API

### URL base y formato

**URL base:** `http://localhost:3002`. Todas las rutas de la tabla incluyen el prefijo `/api`.

Envía `Content-Type: application/json` en las peticiones con cuerpo y `Authorization: Bearer <token>` en las rutas protegidas. Los identificadores son enteros y el marcador `:id` se reemplaza por el identificador del recurso.

| Método | Ruta | Autenticación | Resultado |
|---|---|---|---|
| GET | `/api/health` | Pública | 200, estado del servicio |
| POST | `/api/auth/register` | Pública | 201, usuario registrado |
| POST | `/api/auth/login` | Pública | 200, token JWT |
| GET | `/api/workshops?page=1&size=5` | Bearer JWT | 200, listado paginado |
| GET | `/api/workshops/:id` | Bearer JWT | 200, detalle |
| POST | `/api/workshops/:id/enrollments` | Bearer JWT | 201, resultado de la operación |

`GET /api/health` devuelve el siguiente JSON.

```json
{
  "status": "UP"
}
```

### Registro e inicio de sesión

**Registro mediante `POST /api/auth/register`**

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Obligatorio. Nombre no vacío de hasta 100 caracteres. |
| `email` | string | Obligatorio. Correo válido de hasta 254 caracteres. |
| `password` | string | Obligatorio. De 8 a 72 caracteres ASCII imprimibles. |

Ejemplo de petición.

```json
{
  "name": "Ana",
  "email": "ana@example.test",
  "password": "Practica123"
}
```

Respuesta `201 Created`.

```json
{
  "name": "Ana",
  "email": "ana@example.test"
}
```

**Login mediante `POST /api/auth/login`**

Envía los campos obligatorios `email` y `password`.

```json
{
  "email": "estudiante@example.test",
  "password": "Practica123"
}
```

Respuesta `200 OK`.

```json
{
  "token": "<JWT devuelto por el servidor>"
}
```

El campo `token` contiene el JWT real del servidor. El ejemplo muestra un marcador que debes reemplazar por ese valor al autenticarte.

El JWT tiene una vigencia de dos horas. El cierre de sesión se realiza limpiando la sesión en el cliente.

| Cuenta de prueba | Contraseña |
|---|---|
| `estudiante@example.test` | `Practica123` |
| `companero@example.test` | `Practica123` |

### Listado paginado

**`GET /api/workshops?page=1&size=5`**

| Parámetro | Tipo | Valor predeterminado | Valores admitidos |
|---|---|---|---|
| `page` | entero | 1 | Desde 1 |
| `size` | entero | 5 | De 1 a 50 |

La respuesta incluye `items` (array de registros), `page` y `size` (enteros), `totalItems` (cantidad total) y `totalPages` (cantidad de páginas). Los registros se ordenan por ID ascendente. Una página fuera del rango devuelve un array `items` vacío. Un listado sin registros devuelve `totalItems: 0` y `totalPages: 0`.

El siguiente ejemplo corresponde a `GET /api/workshops?page=1&size=1`, para mostrar un registro completo en la respuesta inicial.

```json
{
  "items": [
    {
      "id": 1,
      "name": "Taller 1",
      "discipline": "Cerámica",
      "date": "2026-12-01",
      "vacancies": 8
    }
  ],
  "page": 1,
  "size": 1,
  "totalItems": 12,
  "totalPages": 12
}
```

Campos de cada elemento de `items`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | entero | Identificador del recurso. |
| `name` | string | Nombre del taller. |
| `discipline` | string | Disciplina. |
| `date` | string | Fecha en formato YYYY-MM-DD. |
| `vacancies` | entero | Suma de vacantes de las sesiones. |

### Detalle del recurso

**`GET /api/workshops/:id`**

Ejemplo de respuesta inicial para el recurso con ID 1.

```json
{
  "id": 1,
  "name": "Taller 1",
  "discipline": "Cerámica",
  "date": "2026-12-01",
  "vacancies": 8,
  "sessions": [
    {
      "id": 1,
      "startsAt": "10:00",
      "vacancies": 4
    },
    {
      "id": 2,
      "startsAt": "14:00",
      "vacancies": 4
    }
  ]
}
```

El detalle conserva los campos del listado y añade los siguientes.

| Campo | Tipo | Descripción |
|---|---|---|
| `sessions` | array de objetos | Sesiones del taller. |

Cada objeto de `sessions` tiene esta estructura.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | entero | Identificador de la sesión dentro del taller. |
| `startsAt` | string | Hora de inicio en formato HH:mm. |
| `vacancies` | entero | Vacantes restantes de la sesión. |

### Operación principal

**`POST /api/workshops/:id/enrollments`**

Campos del cuerpo JSON.

| Campo | Tipo | Descripción |
|---|---|---|
| `sessionId` | entero | Obligatorio. Identificador de una sesión del taller. |
| `experienceLevel` | string | Obligatorio. BEGINNER, INTERMEDIATE o ADVANCED. |

Ejemplo de petición para el recurso con ID 1.

```json
{
  "sessionId": 1,
  "experienceLevel": "BEGINNER"
}
```

Respuesta `201 Created`.

```json
{
  "sessionId": 1,
  "experienceLevel": "BEGINNER"
}
```

Campos de la respuesta.

| Campo | Tipo | Descripción |
|---|---|---|
| `sessionId` | entero | Sesión de la inscripción. |
| `experienceLevel` | string | Nivel de experiencia confirmado. |

Se registra la inscripción del usuario y se reducen las vacantes de la sesión y del taller. Una segunda inscripción del mismo usuario a esa sesión devuelve ALREADY_ENROLLED. Una sesión sin vacantes devuelve SESSION_FULL.

### Respuestas de error

Las respuestas de error descritas en este contrato incluyen los campos string `code` y `message`.

| Estado HTTP | Código | Situación |
|---|---|---|
| 400 | `INVALID_INPUT` | Campos inválidos, JSON ilegible o parámetros de consulta fuera de los valores admitidos. |
| 401 | `UNAUTHORIZED` | Credenciales incorrectas, token ausente, inválido o expirado. |
| 404 | `NOT_FOUND` | El recurso solicitado no existe o no pertenece al usuario autenticado. |
| 409 | `EMAIL_EXISTS` | El correo ya está registrado. |
| 409 | `ALREADY_ENROLLED` | Ya tienes una inscripción en esta sesión. |
| 409 | `SESSION_FULL` | La sesión está llena. |

Ejemplo de error de validación con estado `400`.

```json
{
  "message": "Revisa los campos de la solicitud.",
  "code": "INVALID_INPUT"
}
```

Ejemplo de petición protegida sin sesión válida, con estado `401`.

```json
{
  "code": "UNAUTHORIZED",
  "message": "Sesión inválida o ausente."
}
```

Ejemplo de respuesta de conflicto, con estado `409`.

```json
{
  "message": "Ya tienes una inscripción en esta sesión.",
  "code": "ALREADY_ENROLLED"
}
```